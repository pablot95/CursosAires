<?php
header('Content-Type: application/json');

$allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
$maxSize = 200 * 1024 * 1024; // 200MB
$uploadDir = '../videos/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
    $errCode = isset($_FILES['video']) ? $_FILES['video']['error'] : -1;
    $errMsg = 'No se recibió el video';
    if ($errCode === UPLOAD_ERR_INI_SIZE || $errCode === UPLOAD_ERR_FORM_SIZE) {
        $errMsg = 'El video supera el tamaño máximo permitido';
    }
    echo json_encode(['success' => false, 'error' => $errMsg]);
    exit;
}

$file = $_FILES['video'];

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Formato no permitido. Usá MP4, WEBM u OGG.']);
    exit;
}

if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'error' => 'El video supera los 200MB']);
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
$allowed_ext = ['mp4', 'webm', 'ogg'];
if (!in_array(strtolower($ext), $allowed_ext)) {
    echo json_encode(['success' => false, 'error' => 'Extensión no permitida']);
    exit;
}

$newName = 'vid_' . bin2hex(random_bytes(8)) . '.' . strtolower($ext);
$destination = $uploadDir . $newName;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode(['success' => true, 'url' => 'videos/' . $newName]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al guardar el video']);
}
