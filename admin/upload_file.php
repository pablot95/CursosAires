<?php
header('Content-Type: application/json');

$allowedTypes = ['application/pdf'];
$maxSize = 50 * 1024 * 1024; // 50MB
$uploadDir = '../files/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errCode = isset($_FILES['file']) ? $_FILES['file']['error'] : -1;
    $errMsg = 'No se recibió el archivo';
    if ($errCode === UPLOAD_ERR_INI_SIZE || $errCode === UPLOAD_ERR_FORM_SIZE) {
        $errMsg = 'El archivo supera el tamaño máximo permitido';
    }
    echo json_encode(['success' => false, 'error' => $errMsg]);
    exit;
}

$file = $_FILES['file'];

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Formato no permitido. Solo se aceptan archivos PDF.']);
    exit;
}

if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'error' => 'El archivo supera los 50MB']);
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
if (strtolower($ext) !== 'pdf') {
    echo json_encode(['success' => false, 'error' => 'Extensión no permitida']);
    exit;
}

$originalName = pathinfo($file['name'], PATHINFO_FILENAME);
$originalName = preg_replace('/[^a-zA-Z0-9_\-áéíóúñÁÉÍÓÚÑ ]/', '', $originalName);
$newName = 'file_' . bin2hex(random_bytes(8)) . '.pdf';
$destination = $uploadDir . $newName;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode([
        'success' => true,
        'url' => 'files/' . $newName,
        'originalName' => $originalName . '.pdf'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al guardar el archivo']);
}
