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
//  CONFIGURACIÓN — Reemplazá estos valores con los del developer.paypal.com
//  Client ID:     se copia también en Firebase siteContent/config.paypalClientId
//  Client Secret: SOLO va acá, nunca en Firebase ni en el frontend
// ─────────────────────────────────────────────────────────────────────────────
$PAYPAL_CLIENT_ID     = 'AaumAIrQfgY6XcAKSGkcvbBTDU1gsgxLmaxo-8ziokXGZpOxQ2EbfLEv7JQ1kGK8_oqRLBIBg3UneZ-i';
$PAYPAL_CLIENT_SECRET = 'EKrBSct1sDjGdLqYoOLV36e49kgWCKsBC3uUAng4ubipGa3j_Q4LUJ59G48RKTQcbiXG_AxWdhVEzrgN';
// Para sandbox usá: https://api-m.sandbox.paypal.com
// Para producción:  https://api-m.paypal.com
$PAYPAL_BASE_URL      = 'https://api-m.paypal.com';

$FIREBASE_PROJECT = 'cursoaires-1cada';

// ─── Validar input ────────────────────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// ─── Leer precio y tipo de cambio desde Firestore ────────────────────────────
$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$FIREBASE_PROJECT/databases/(default)/documents/siteContent/precio";
$ch = curl_init($firestoreUrl);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
$fsResp = curl_exec($ch);
curl_close($ch);

$usdPrice = '29'; // fallback
$fsData   = json_decode($fsResp, true);
if ($fsData && isset($fsData['fields'])) {
    $arsAmount = 39999;
    if (isset($fsData['fields']['amount']['stringValue'])) {
        $parsed = (int) preg_replace('/[^0-9]/', '', $fsData['fields']['amount']['stringValue']);
        if ($parsed > 0) $arsAmount = $parsed;
    }
    $usdRate = 1400;
    if (isset($fsData['fields']['usdRate']['integerValue'])) {
        $r = (int) $fsData['fields']['usdRate']['integerValue'];
        if ($r > 0) $usdRate = $r;
    } elseif (isset($fsData['fields']['usdRate']['doubleValue'])) {
        $r = (int) $fsData['fields']['usdRate']['doubleValue'];
        if ($r > 0) $usdRate = $r;
    }
    $usdPrice = (string) round($arsAmount / $usdRate, 2);
}

// ─── Obtener access token de PayPal ──────────────────────────────────────────
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
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo autenticar con PayPal']);
    exit;
}
$accessToken = json_decode($tokenResp, true)['access_token'] ?? '';

// ─── Crear orden PayPal ───────────────────────────────────────────────────────
$orderBody = [
    'intent' => 'CAPTURE',
    'purchase_units' => [[
        'description' => 'Curso Completo AC Automotor + 4 Bonus',
        'amount'      => [
            'currency_code' => 'USD',
            'value'         => $usdPrice
        ]
    ]],
    'application_context' => [
        'brand_name'          => 'Daniels Aire',
        'shipping_preference' => 'NO_SHIPPING',
        'user_action'         => 'PAY_NOW'
    ]
];

$ch = curl_init($PAYPAL_BASE_URL . '/v2/checkout/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($orderBody),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $accessToken,
        'PayPal-Request-Id: ' . bin2hex(random_bytes(16))
    ],
    CURLOPT_TIMEOUT => 30
]);
$orderResp = curl_exec($ch);
$orderCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($orderCode < 200 || $orderCode >= 300) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear la orden en PayPal']);
    exit;
}

$orderData = json_decode($orderResp, true);
echo json_encode(['orderID' => $orderData['id']]);
