<?php 
require_once 'includes/header.php'; 

// Redirect to login if not authenticated
if(!isset($_SESSION['user_uid'])) {
    header("Location: login.php");
    exit;
}
?>

<div class="auth-container glass" style="max-width: 600px;">
    <!-- Profile Header -->
    <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.5rem; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.5);">
            <i class="fa-solid fa-user"></i>
        </div>
        <h2 style="margin-bottom: 0.5rem;"><?php echo isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'User Profile'; ?></h2>
        <p style="color: var(--text-muted);"><?php echo $_SESSION['user_email']; ?></p>
    </div>
    
    <!-- Account Details -->
    <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.5rem; text-align: left; margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Account Information</h3>
        
        <div style="margin-bottom: 1rem;">
            <label style="color: var(--text-muted); font-size: 0.9rem; display: block; margin-bottom: 0.2rem;">User ID (UID)</label>
            <div style="display: flex; gap: 0.5rem;">
                <code style="background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 4px; flex: 1; overflow: hidden; text-overflow: ellipsis;" id="uidText"><?php echo $_SESSION['user_uid']; ?></code>
                <button class="btn-login" style="padding: 0.4rem 0.8rem;" onclick="navigator.clipboard.writeText('<?php echo $_SESSION['user_uid']; ?>'); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 2000);"><i class="fa-regular fa-copy"></i> Copy</button>
            </div>
            <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">You can share this UID with friends so they can add you to their groups.</small>
        </div>
    </div>
    
    <!-- Actions -->
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        <a href="groups.php" class="btn-primary" style="display: block; width: 100%;"><i class="fa-solid fa-users"></i> Manage Groups</a>
        <a href="logout.php" class="btn-danger btn-logout" style="display: block; width: 100%;"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>
    </div>
    
</div>

<?php require_once 'includes/footer.php'; ?>
