<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['score'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing score parameter"]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO test_attempts (score) VALUES (:score)");
    $stmt->bindParam(':score', $input['score'], PDO::PARAM_INT);
    $stmt->execute();
    
    echo json_encode(["success" => true, "attempt_id" => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
