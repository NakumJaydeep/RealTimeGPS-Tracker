<?php include 'includes/header.php'; ?>

<?php if (isset($_SESSION['user_uid'])): ?>
    <!-- Logged in State -->
    <div class="page-title">
        <h2>Live Tracking Map</h2>
        <div>
            <?php if (isset($_GET['shared']) && $_GET['shared'] == 'true'): ?>
                <a href="index.php" class="btn-primary"><i class="fa-solid fa-location-crosshairs"></i> My Location View</a>
            <?php
    else: ?>
                <a href="index.php?shared=true" class="btn-primary"><i class="fa-solid fa-users-viewfinder"></i> Show Shared Locations</a>
            <?php
    endif; ?>
        </div>
    </div>
    
    <div style="position: relative;">
        <div class="glass" id="map">
            <!-- Google Map will render here -->
        </div>
        
        <?php if (isset($_GET['shared']) && $_GET['shared'] == 'true'): ?>
        <div id="sharedUsersPanel" class="glass" style="position: absolute; bottom: 30px; left: 30px; padding: 1rem; border-radius: 12px; width: 280px; max-height: 40vh; overflow-y: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h4 style="margin-bottom: 0.8rem; font-size: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;"><i class="fa-solid fa-users"></i> Group Members</h4>
            <div id="sharedUsersList" style="display: flex; flex-direction: column; gap: 0.8rem;">
                <!-- Members will be injected here by map.js -->
                <p style="font-size: 0.85rem; color: var(--text-muted);">Finding members...</p>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <!-- Google Maps JS API -->
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB-y-sB6zRbVJG5c6dK2__60LF-HmLXlfk&libraries=geometry,marker"></script>

    <!-- Map Script Include -->
    <script>
        // Store session UID for JS access
        const currentUserUid = "<?php echo $_SESSION['user_uid']; ?>";
        const currentUserName = "<?php echo isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'User'; ?>";
        const isSharedView = <?php echo(isset($_GET['shared']) && $_GET['shared'] == 'true') ? 'true' : 'false'; ?>;
    </script>
    <script src="assets/js/map.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/tracker.js?v=<?php echo time(); ?>"></script>
    
    <!-- Initialize Map cleanly once styles/scripts are loaded -->
    <script>
        document.addEventListener('DOMContentLoaded', initMap);
    </script>

<?php
else: ?>
    <!-- Guest State -->
    <div class="auth-container glass" style="max-width: 800px; margin-top: 10vh;">
        <h1 class="auth-title" style="font-size: 2.5rem; margin-bottom: 1rem;"><i class="fa-solid fa-earth-americas" style="color: var(--primary);"></i> LiveTrack</h1>
        <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 2rem;">Real-time location sharing with friends and family.</p>
        
        <div style="display: flex; justify-content: center; gap: 1rem;">
            <a href="signup.php" class="btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem;">Get Started</a>
            <a href="login.php" class="btn-login" style="padding: 1rem 2rem; font-size: 1.1rem;">Login</a>
        </div>
    </div>
<?php
endif; ?>

<?php include 'includes/footer.php'; ?>
