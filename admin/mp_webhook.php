<?php
// MercadoPago Webhook - Procesa notificaciones de pago
// Cuando un pago se confirma, crea el usuario en Firebase y guarda la orden

$ACCESS_TOKEN = 'APP_USR-7491260817896291-031921-656d8231520710cd484a6167001f61ea-1531846';
$FIREBASE_API_KEY = 'AIzaSyCZNcCA4l_jj6W7ZFAo8pNAgDW2WASW_Ro';
$FIREBASE_PROJECT = 'cursoaires-1cada';

// Log para debugging
function logWebhook($msg) {
    $logFile = __DIR__ . '/webhook_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $msg\n", FILE_APPEND | LOCK_EX);
}

// Respond 200 immediately to MP and keep script running
ignore_user_abort(true);
set_time_limit(120);

// IMPORTANT: Read input BEFORE flushing the response
$input = json_decode(file_get_contents('php://input'), true);

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['status' => 'ok']);
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
} else {
    if (ob_get_level() > 0) ob_end_flush();
    flush();
}

if (!$input || !isset($input['type'])) {
    logWebhook('Notificación sin type: ' . json_encode($input));
    exit;
}

// Solo procesamos pagos
if ($input['type'] !== 'payment') {
    logWebhook('Type ignorado: ' . $input['type']);
    exit;
}

$paymentId = $input['data']['id'] ?? null;
if (!$paymentId) {
    logWebhook('Sin payment ID');
    exit;
}

// Obtener detalles del pago desde MP API
$ch = curl_init("https://api.mercadopago.com/v1/payments/$paymentId");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $ACCESS_TOKEN
    ],
    CURLOPT_TIMEOUT => 30
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    logWebhook("Error al consultar pago $paymentId: HTTP $httpCode");
    exit;
}

$payment = json_decode($response, true);
$status = $payment['status'] ?? '';

logWebhook("Pago $paymentId - Status: $status");

if ($status !== 'approved') {
    logWebhook("Pago no aprobado, ignorando");
    exit;
}

// Idempotencia: verificar si ya procesamos este pago
$checkUrl = "https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents/orders?pageSize=1";
$checkQuery = "https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents:runQuery";
$queryBody = json_encode(['structuredQuery' => [
    'from' => [['collectionId' => 'orders']],
    'where' => ['fieldFilter' => [
        'field' => ['fieldPath' => 'paymentId'],
        'op' => 'EQUAL',
        'value' => ['stringValue' => (string)$paymentId]
    ]],
    'limit' => 1
]]);
$ch = curl_init($checkQuery);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $queryBody,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT => 10
]);
$checkResp = curl_exec($ch);
curl_close($ch);
$checkData = json_decode($checkResp, true);
if (!empty($checkData[0]['document'])) {
    logWebhook("Pago $paymentId ya procesado anteriormente, ignorando");
    exit;
}

// Extraer datos del comprador desde external_reference
$extRef = json_decode($payment['external_reference'] ?? '{}', true);
$email = $extRef['email'] ?? '';
$firstName = $extRef['firstName'] ?? '';
$lastName = $extRef['lastName'] ?? '';
$phone = $extRef['phone'] ?? '';

if (empty($email)) {
    logWebhook("Email vacío en external_reference");
    exit;
}

// Generar contraseña
$chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
$password = '';
for ($i = 0; $i < 8; $i++) {
    $password .= $chars[random_int(0, strlen($chars) - 1)];
}

// Crear usuario en Firebase Auth via REST API
$ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$FIREBASE_API_KEY");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'email' => $email,
        'password' => $password,
        'returnSecureToken' => true
    ]),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT => 30
]);
$authResponse = curl_exec($ch);
$authCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$authData = json_decode($authResponse, true);
$uid = $authData['localId'] ?? null;

if (!$uid) {
    $errorMsg = $authData['error']['message'] ?? 'Unknown';
    logWebhook("No se pudo crear usuario Firebase: $errorMsg");
    if (strpos($errorMsg, 'EMAIL_EXISTS') === false) {
        exit;
    }
    // Usuario ya existe: obtener su UID para poder crear la orden
    logWebhook("Usuario ya existe, buscando UID existente");
    $ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=$FIREBASE_API_KEY");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['email' => $email]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 15
    ]);
    $lookupResp = curl_exec($ch);
    curl_close($ch);
    $lookupData = json_decode($lookupResp, true);
    $uid = $lookupData['users'][0]['localId'] ?? null;
    // No se puede saber la contraseña anterior: omitir email al comprador para evitar confusión
    $password = null;
    logWebhook("UID encontrado: $uid");
}

// Guardar orden y perfil en Firestore via REST API
$idToken = $authData['idToken'] ?? '';

// Guardar orden
$orderData = [
    'fields' => [
        'email' => ['stringValue' => $email],
        'firstName' => ['stringValue' => $firstName],
        'lastName' => ['stringValue' => $lastName],
        'phone' => ['stringValue' => $phone],
        'status' => ['stringValue' => 'completed'],
        'paymentMethod' => ['stringValue' => 'mercadopago'],
        'paymentId' => ['stringValue' => (string)$paymentId],
        'amount' => ['doubleValue' => $payment['transaction_amount'] ?? 0],
        'password' => ['stringValue' => $password],
        'createdAt' => ['timestampValue' => date('c')]
    ]
];

if ($uid) {
    $orderData['fields']['uid'] = ['stringValue' => $uid];
}

$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents";

// Create order document
$ch = curl_init("$firestoreUrl/orders");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($orderData),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT => 30
]);
$orderResp = curl_exec($ch);
curl_close($ch);
logWebhook("Orden creada: " . substr($orderResp, 0, 200));

// Create/update student profile
if ($uid) {
    $studentData = [
        'fields' => [
            'email' => ['stringValue' => $email],
            'firstName' => ['stringValue' => $firstName],
            'lastName' => ['stringValue' => $lastName],
            'phone' => ['stringValue' => $phone],
            'active' => ['booleanValue' => true],
            'createdAt' => ['timestampValue' => date('c')]
        ]
    ];

    $ch = curl_init("$firestoreUrl/students/$uid");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_POSTFIELDS => json_encode($studentData),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 30
    ]);
    $studentResp = curl_exec($ch);
    curl_close($ch);
    logWebhook("Perfil estudiante creado: " . substr($studentResp, 0, 200));
}

// --- Enviar emails via EmailJS REST API ---
$emailjsUserId = 'SPTO4pRPITctohc5C';
$emailjsServiceId = 'service_wti02gq';

// 1) Email al COMPRADOR con credenciales (solo si es usuario nuevo)
if ($password !== null) {
    $buyerEmailData = [
        'service_id' => $emailjsServiceId,
        'template_id' => 'template_lghwwxc',
        'user_id' => $emailjsUserId,
        'template_params' => [
            'buyer_name' => $firstName . ' ' . $lastName,
            'buyer_email' => $email,
            'buyer_password' => $password
        ]
    ];

    $ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($buyerEmailData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Origin: https://www.danielsaire.com.ar'
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    $emailResp1 = curl_exec($ch);
    $curlErr1 = curl_error($ch);
    $httpCode1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    logWebhook("Email comprador - HTTP: $httpCode1 - Resp: $emailResp1 - CurlErr: $curlErr1");
} else {
    // Usuario ya tenía cuenta: avisarle que ya puede ingresar
    $existingUserEmail = [
        'service_id' => $emailjsServiceId,
        'template_id' => 'template_lghwwxc',
        'user_id' => $emailjsUserId,
        'template_params' => [
            'buyer_name' => $firstName . ' ' . $lastName,
            'buyer_email' => $email,
            'buyer_password' => '(usá tu contraseña anterior — si la olvidaste, podés resetearla desde el curso)'
        ]
    ];
    $ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($existingUserEmail),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Origin: https://www.danielsaire.com.ar'
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    $emailResp1 = curl_exec($ch);
    $curlErr1 = curl_error($ch);
    $httpCode1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    logWebhook("Email comprador existente - HTTP: $httpCode1 - Resp: $emailResp1 - CurlErr: $curlErr1");
}

// 2) Email al VENDEDOR con notificación de venta
$sellerEmailData = [
    'service_id' => $emailjsServiceId,
    'template_id' => 'template_s1ipj7x',
    'user_id' => $emailjsUserId,
    'template_params' => [
        'buyer_name' => $firstName . ' ' . $lastName,
        'buyer_email' => $email,
        'buyer_phone' => !empty($phone) ? $phone : 'No proporcionado',
        'order_date' => date('d/m/Y H:i')
    ]
];

$ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($sellerEmailData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Origin: https://www.danielsaire.com.ar'
    ],
    CURLOPT_TIMEOUT => 30
]);
$emailResp2 = curl_exec($ch);
$curlErr2 = curl_error($ch);
$httpCode2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
logWebhook("Email vendedor - HTTP: $httpCode2 - Resp: $emailResp2 - CurlErr: $curlErr2");

logWebhook("Pago $paymentId procesado OK - Email: $email - Password: $password");
