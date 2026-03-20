<?php
header('Content-Type: application/json');

$response = [
    'status' => 'ok',
    'name' => 'RealTimeGPS-Tracker Backend API',
    'version' => '1.0.0',
    'timestamp' => time()
];

echo json_encode($response);
