<?php
session_start();
header('Content-Type: application/json');

// Get POST body
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['action'])) {
    if ($data['action'] === 'login') {
        if (isset($data['uid']) && isset($data['email'])) {
            $_SESSION['user_uid'] = $data['uid'];
            $_SESSION['user_email'] = $data['email'];
            if(isset($data['displayName'])) {
                $_SESSION['user_name'] = $data['displayName'];
            }
            echo json_encode(['status' => 'success', 'message' => 'Session created']);
            exit;
        }
    } elseif ($data['action'] === 'logout') {
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Session destroyed']);
        exit;
    }
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
?>
