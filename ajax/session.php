<?php
session_start();
header('Content-Type: application/json');

// Get POST body
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['action'])) {
    if ($data['action'] === 'login') {
        if (!empty($data['uid']) && !empty($data['email'])) {
            // Prevent session fixation
            session_regenerate_id(true);

            $_SESSION['user_uid'] = filter_var($data['uid'], FILTER_SANITIZE_STRING);
            $_SESSION['user_email'] = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
            if (isset($data['displayName'])) {
                $_SESSION['user_name'] = filter_var($data['displayName'], FILTER_SANITIZE_STRING);
            }

            echo json_encode(['status' => 'success', 'message' => 'Session created']);
            exit;
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing credentials']);
        exit;
    } elseif ($data['action'] === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Session destroyed']);
        exit;
    }
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
?>
