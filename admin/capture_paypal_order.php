<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://www.danielsaire.com.ar');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Mismas credenciales que create_paypal_order.php
// ─────────────────────────────────────────────────────────────────────────────
$PAYPAL_CLIENT_ID     = 'AaumAIrQfgY6XcAKSGkcvbBTDU1gsgxLmaxo-8ziokXGZpOxQ2EbfLEv7JQ1kGK8_oqRLBIBg3UneZ-i';
$PAYPAL_CLIENT_SECRET = 'EKrBSct1sDjGdLqYoOLV36e49kgWCKsBC3uUAng4ubipGa3j_Q4LUJ59G48RKTQcbiXG_AxWdhVEzrgN';
$PAYPAL_BASE_URL      = 'https://api-m.paypal.com';

$FIREBASE_API_KEY = 'AIzaSyCZNcCA4l_jj6W7ZFAo8pNAgDW2WASW_Ro';
$FIREBASE_PROJECT = 'cursoaires-1cada';

$emailjsUserId    = 'SPTO4pRPITctohc5C';
$emailjsServiceId = 'service_wti02gq';

function logPayPal($msg)
{
    $logFile   = __DIR__ . '/paypal_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $msg\n", FILE_APPEND | LOCK_EX);
}

// ─── Validar input ────────────────────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['orderID']) || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$orderID   = preg_replace('/[^A-Z0-9\-]/', '', strtoupper($input['orderID']));
$email     = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$firstName = substr(strip_tags($input['firstName'] ?? ''), 0, 100);
$lastName  = substr(strip_tags($input['lastName']  ?? ''), 0, 100);
$phone     = substr(strip_tags($input['phone']     ?? ''), 0, 30);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// ─── Obtener access token PayPal ──────────────────────────────────────────────
$ch = curl_init($PAYPAL_BASE_URL . '/v1/oauth2/token');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
    CURLOPT_USERPWD        => $PAYPAL_CLIENT_ID . ':' . $PAYPAL_CLIENT_SECRET,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_TIMEOUT        => 15
]);
$tokenResp = curl_exec($ch);
$tokenCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($tokenCode !== 200) {
    logPayPal("Auth failed: HTTP $tokenCode");
    http_response_code(500);
    echo json_encode(['error' => 'Error de autenticación con PayPal']);
    exit;
}
$accessToken = json_decode($tokenResp, true)['access_token'] ?? '';

// ─── Capturar la orden ────────────────────────────────────────────────────────
$ch = curl_init($PAYPAL_BASE_URL . "/v2/checkout/orders/$orderID/capture");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => '{}',
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $accessToken,
        'PayPal-Request-Id: cap-' . bin2hex(random_bytes(16))
    ],
    CURLOPT_TIMEOUT => 30
]);
$captureResp = curl_exec($ch);
$captureCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$captureData = json_decode($captureResp, true);
$captureStatus = $captureData['status'] ?? '';

if ($captureCode < 200 || $captureCode >= 300 || $captureStatus !== 'COMPLETED') {
    logPayPal("Capture failed for $orderID: HTTP $captureCode - status: $captureStatus");
    http_response_code(500);
    echo json_encode(['error' => 'Error al capturar el pago. Contactá soporte si se realizó el cobro.']);
    exit;
}

$txId      = $captureData['purchase_units'][0]['payments']['captures'][0]['id']              ?? $orderID;
$amountPaid = $captureData['purchase_units'][0]['payments']['captures'][0]['amount']['value'] ?? '0';

logPayPal("Captured OK: order=$orderID tx=$txId amount=USD $amountPaid email=$email");

// ─── Idempotencia: verificar si ya procesamos esta TX ─────────────────────────
$queryBody = json_encode(['structuredQuery' => [
    'from'  => [['collectionId' => 'orders']],
    'where' => ['fieldFilter' => [
        'field' => ['fieldPath' => 'paymentId'],
        'op'    => 'EQUAL',
        'value' => ['stringValue' => $txId]
    ]],
    'limit' => 1
]]);
$ch = curl_init("https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents:runQuery");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $queryBody,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 10
]);
$checkData = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!empty($checkData[0]['document'])) {
    logPayPal("TX $txId ya procesada, ignorando");
    echo json_encode(['success' => true]);
    exit;
}

// ─── Generar contraseña ───────────────────────────────────────────────────────
$chars    = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
$password = '';
for ($i = 0; $i < 8; $i++) {
    $password .= $chars[random_int(0, strlen($chars) - 1)];
}

// ─── Crear usuario en Firebase Auth ──────────────────────────────────────────
$ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$FIREBASE_API_KEY");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode(['email' => $email, 'password' => $password, 'returnSecureToken' => true]),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 30
]);
$authResponse = curl_exec($ch);
$authCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$authData = json_decode($authResponse, true);
$uid      = $authData['localId'] ?? null;

if (!$uid) {
    $errorMsg = $authData['error']['message'] ?? 'Unknown';
    logPayPal("Firebase user create failed: $errorMsg");
    if (strpos($errorMsg, 'EMAIL_EXISTS') === false) {
        echo json_encode(['error' => 'Error al crear cuenta de usuario']);
        exit;
    }
    // Usuario ya existe: obtener su UID
    $ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=$FIREBASE_API_KEY");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['email' => $email]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 15
    ]);
    $lookupData = json_decode(curl_exec($ch), true);
    curl_close($ch);
    $uid      = $lookupData['users'][0]['localId'] ?? null;
    $password = null; // No enviar contraseña (ya tenía cuenta)
}

$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents";

// ─── Guardar orden en Firestore ───────────────────────────────────────────────
$orderDoc = [
    'fields' => [
        'email'         => ['stringValue'  => $email],
        'firstName'     => ['stringValue'  => $firstName],
        'lastName'      => ['stringValue'  => $lastName],
        'phone'         => ['stringValue'  => $phone],
        'status'        => ['stringValue'  => 'completed'],
        'paymentMethod' => ['stringValue'  => 'paypal'],
        'paymentId'     => ['stringValue'  => $txId],
        'amount'        => ['doubleValue'  => floatval($amountPaid)],
        'currency'      => ['stringValue'  => 'USD'],
        'password'      => ['stringValue'  => $password ?? ''],
        'createdAt'     => ['timestampValue' => date('c')]
    ]
];
if ($uid) {
    $orderDoc['fields']['uid'] = ['stringValue' => $uid];
}

$ch = curl_init("$firestoreUrl/orders");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($orderDoc),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 15
]);
$orderSaveResp = curl_exec($ch);
curl_close($ch);
logPayPal("Orden guardada: " . substr($orderSaveResp, 0, 200));

// ─── Guardar perfil estudiante en Firestore ───────────────────────────────────
if ($uid) {
    $studentData = [
        'fields' => [
            'email'         => ['stringValue'  => $email],
            'firstName'     => ['stringValue'  => $firstName],
            'lastName'      => ['stringValue'  => $lastName],
            'phone'         => ['stringValue'  => $phone],
            'active'        => ['booleanValue' => true],
            'paymentMethod' => ['stringValue'  => 'paypal'],
            'createdAt'     => ['timestampValue' => date('c')]
        ]
    ];
    $ch = curl_init("$firestoreUrl/students/$uid");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER  => true,
        CURLOPT_CUSTOMREQUEST   => 'PATCH',
        CURLOPT_POSTFIELDS      => json_encode($studentData),
        CURLOPT_HTTPHEADER      => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT         => 15
    ]);
    curl_exec($ch);
    curl_close($ch);
}

// ─── Email al COMPRADOR con credenciales ──────────────────────────────────────
$buyerPassword = ($password !== null) ? $password : '(usá tu contraseña anterior — si la olvidaste, podés resetearla desde el curso)';
$buyerEmailData = [
    'service_id'      => $emailjsServiceId,
    'template_id'     => 'template_lghwwxc',
    'user_id'         => $emailjsUserId,
    'template_params' => [
        'buyer_name'     => $firstName . ' ' . $lastName,
        'buyer_email'    => $email,
        'buyer_password' => $buyerPassword
    ]
];
$ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($buyerEmailData),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Origin: https://www.danielsaire.com.ar'
    ],
    CURLOPT_TIMEOUT => 30
]);
$emailResp1 = curl_exec($ch);
$httpCode1  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
logPayPal("Email comprador - HTTP: $httpCode1 - Resp: $emailResp1");

// ─── Email al VENDEDOR ────────────────────────────────────────────────────────
$sellerEmailData = [
    'service_id'      => $emailjsServiceId,
    'template_id'     => 'template_s1ipj7x',
    'user_id'         => $emailjsUserId,
    'template_params' => [
        'buyer_name'  => $firstName . ' ' . $lastName,
        'buyer_email' => $email,
        'buyer_phone' => !empty($phone) ? $phone : 'No proporcionado',
        'order_date'  => date('d/m/Y H:i')
    ]
];
$ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($sellerEmailData),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Origin: https://www.danielsaire.com.ar'
    ],
    CURLOPT_TIMEOUT => 30
]);
$emailResp2 = curl_exec($ch);
$httpCode2  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
logPayPal("Email vendedor - HTTP: $httpCode2 - Resp: $emailResp2");

logPayPal("Pago PayPal procesado OK - Email: $email - TX: $txId");
echo json_encode(['success' => true]);
