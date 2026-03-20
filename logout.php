<?php
session_start();
session_destroy();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Logging out...</title>
</head>
<body>
    <script>
        // We will bridge this to clear Firebase Auth in the auth.js logic on the login page,
        // but for now, we just redirect. 
        // We should actually let JS handle logout then redirect.
        window.location.href = "index.php";
    </script>
</body>
</html>
