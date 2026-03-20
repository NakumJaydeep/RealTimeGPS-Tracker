<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Location Sharing</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- Main Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.php" class="nav-logo">
                <i class="fa-solid fa-location-dot"></i> LiveTrack
            </a>
            
            <button class="nav-toggle" id="navToggle">
                <i class="fa-solid fa-bars"></i>
            </button>
            
            <div class="nav-links" id="navLinks">
                <a href="index.php" class="nav-link"><i class="fa-solid fa-house"></i> Home</a>
                
                <?php if(isset($_SESSION['user_uid'])): ?>
                    <a href="index.php?shared=true" class="nav-link"><i class="fa-solid fa-map-location-dot"></i> Shared Locations</a>
                    <a href="account.php" class="nav-link"><i class="fa-solid fa-user"></i> My Account</a>
                    <a href="groups.php" class="nav-link"><i class="fa-solid fa-users"></i> Groups</a>
                    <a href="logout.php" class="nav-link btn-logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                <?php else: ?>
                    <a href="login.php" class="nav-link btn-login"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
                    <a href="signup.php" class="nav-link btn-signup"><i class="fa-solid fa-user-plus"></i> Sign Up</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>
    
    <div class="main-content">
