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

$ACCESS_TOKEN = 'APP_USR-7491260817896291-031921-656d8231520710cd484a6167001f61ea-1531846';
$FIREBASE_PROJECT = 'cursoaires-1cada';
$SITE_URL = 'https://www.danielsaire.com.ar';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['email']) || empty($input['firstName']) || empty($input['lastName'])) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$firstName = substr(strip_tags($input['firstName']), 0, 100);
$lastName = substr(strip_tags($input['lastName']), 0, 100);
$phone = isset($input['phone']) ? substr(strip_tags($input['phone']), 0, 30) : '';

// Leer precio actual desde Firestore
$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents/siteContent/precio";
$ch = curl_init($firestoreUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10
]);
$fsResp = curl_exec($ch);
curl_close($ch);

$unitPrice = 39999; // fallback
$fsData = json_decode($fsResp, true);
if (isset($fsData['fields']['amount']['stringValue'])) {
    // Eliminar todo excepto dígitos (formato argentino: 39.999 → 39999)
    $parsed = (int) preg_replace('/[^0-9]/', '', $fsData['fields']['amount']['stringValue']);
    if ($parsed > 0) {
        $unitPrice = $parsed;
    }
}

$preference = [
    'items' => [
        [
            'title' => 'Curso Completo AC Automotor + 4 Bonus',
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'currency_id' => 'ARS'
        ]
    ],
    'payer' => [
        'name' => $firstName,
        'surname' => $lastName,
        'email' => $email
    ],
    'back_urls' => [
        'success' => $SITE_URL . '/checkout_result.html?status=approved',
        'failure' => $SITE_URL . '/checkout_result.html?status=rejected',
        'pending' => $SITE_URL . '/checkout_result.html?status=pending'
    ],
    'auto_return' => 'approved',
    'external_reference' => json_encode([
        'email' => $email,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'phone' => $phone
    ]),
    'notification_url' => $SITE_URL . '/admin/mp_webhook.php',
    'statement_descriptor' => 'CURSO AC AUTOMOTOR'
];

$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($preference),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $ACCESS_TOKEN
    ],
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    $data = json_decode($response, true);
    echo json_encode([
        'init_point' => $data['init_point'],
        'id' => $data['id']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear preferencia de pago']);
}
