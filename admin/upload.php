<?php
header('Content-Type: application/json');

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB
$uploadDir = '../images/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No se recibió la imagen']);
    exit;
}

$file = $_FILES['image'];

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Formato no permitido']);
    exit;
}

if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'error' => 'La imagen supera los 5MB']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$realType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
if (!in_array($realType, $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Tipo de archivo inválido']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$ext = preg_replace('/[^a-zA-Z0-9]/', '', $ext);
$allowed_ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if (!in_array(strtolower($ext), $allowed_ext)) {
    echo json_encode(['success' => false, 'error' => 'Extensión no permitida']);
    exit;
}

$newName = 'img_' . bin2hex(random_bytes(8)) . '.' . strtolower($ext);
$destination = $uploadDir . $newName;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode(['success' => true, 'url' => 'images/' . $newName]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al mover el archivo']);
}
