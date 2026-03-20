    </div> <!-- End of main-content -->

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; <?php echo date("Y"); ?> LiveTrack Live Location Sharing. All rights reserved.</p>
    </footer>

    <!-- Firebase SDK (v10 modular to compat or v8 classic) -->
    <!-- Using v8 for simpler core logic as requested without a build step -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

    <!-- Custom Scripts -->
    <script src="assets/js/firebase-config.js"></script>
    <script src="assets/js/auth.js?v=<?php echo time(); ?>"></script>
    <script>
        // Hamburger Menu Toggle
        document.getElementById('navToggle').addEventListener('click', function() {
            document.getElementById('navLinks').classList.toggle('active');
        });
    </script>
</body>
</html>
