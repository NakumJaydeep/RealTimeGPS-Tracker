<?php 
require_once 'includes/header.php'; 

// Redirect if already logged in
if(isset($_SESSION['user_uid'])) {
    header("Location: index.php");
    exit;
}
?>

<div class="auth-container glass">
    <h2 class="auth-title">Create Account</h2>
    
    <div id="signupAlert" class="alert"></div>
    
    <form id="signupForm">
        <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" class="form-control" required placeholder="Jane Doe">
        </div>
        
        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" class="form-control" required placeholder="you@example.com">
        </div>
        
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" required minlength="6" placeholder="Min 6 characters">
            <small id="passwordStrength" class="text-muted">Strength: unknown</small>
        </div>

        <div class="form-group">
            <label for="terms" class="checkbox-label">
                <input type="checkbox" id="terms" required>
                I agree to the <a href="terms.php" target="_blank" rel="noopener">Terms and Conditions</a>
            </label>
        </div>
        
        <button type="submit" class="btn-primary auth-btn" id="signupBtn">Sign Up</button>
    </form>
    
    <div class="auth-links">
        Already have an account? <a href="login.php">Login</a>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
