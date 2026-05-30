<?php
require 'db.php';

// Allow OPTIONS requests for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM questions");
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Parse the JSON options string back to an array for the frontend
    foreach ($questions as &$q) {
        $q['options'] = json_decode($q['options_json'], true);
        unset($q['options_json']);
        
        // Convert to frontend's expected keys
        $q['correct'] = (int)$q['correct_index'];
        unset($q['correct_index']);
    }

    echo json_encode(["success" => true, "data" => $questions]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
