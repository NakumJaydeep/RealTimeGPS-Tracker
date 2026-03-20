<?php 
require_once 'includes/header.php'; 

// Redirect if already logged in
if(isset($_SESSION['user_uid'])) {
    header("Location: index.php");
    exit;
}
?>

<div class="auth-container glass">
    <h2 class="auth-title">Welcome Back</h2>
    
    <div id="loginAlert" class="alert"></div>
    
    <form id="loginForm">
        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" class="form-control" required placeholder="you@example.com">
        </div>
        
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" required placeholder="••••••••">
        </div>
        
        <button type="submit" class="btn-primary auth-btn" id="loginBtn">Login</button>
    </form>
    
    <div class="auth-links">
        Don't have an account? <a href="signup.php">Sign up</a>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
