document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.querySelector('.btn-logout');
    
    const signupAlert = document.getElementById('signupAlert');
    const loginAlert = document.getElementById('loginAlert');
    
    // Auth State Observer - to ensure PHP session stays in sync with Firebase Auth
    // Only run if we are NOT on login/signup pages to prevent infinite redirects if session is messy
    const isAuthPage = window.location.pathname.includes('login.php') || window.location.pathname.includes('signup.php');
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Auto-repair missing database profiles (in case signup writes failed previously due to rules)
            try {
                if (typeof db !== 'undefined') {
                    const userRef = db.ref('users/' + user.uid);
                    const snap = await userRef.once('value');
                    const userData = snap.val() || {};
                    if (!userData.email || !userData.name) {
                        await userRef.update({
                            email: user.email,
                            name: user.displayName || user.email.split('@')[0],
                            last_login: firebase.database.ServerValue.TIMESTAMP
                        });
                        console.log("Auto-repaired missing user profile data in Realtime Database.");
                    }
                }
            } catch(e) { console.error("Profile sync error:", e); }

            // If they are logged into Firebase, but on guest pages, they need a PHP session and redirect
            if (isAuthPage || window.location.pathname === '/' || window.location.pathname.includes('index.php')) {
                // Let's ensure the PHP session exists. If it does, session.php just overwrites it safely.
                await createPHPSession(user.uid, user.email, user.displayName);
                if (isAuthPage || document.querySelector('.btn-login')) { // '.btn-login' implies guest nav is showing
                    window.location.href = 'index.php';
                }
            }
        } else {
            // Not logged in to Firebase
            if (!isAuthPage && window.location.pathname !== '/index.php' && window.location.pathname !== '/') {
                window.location.href = 'login.php';
            }
        }
    });

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('signupBtn');
            const alertBox = signupAlert;
            
            btn.disabled = true;
            btn.innerText = 'Creating Account...';
            hideAlert(alertBox);
            
            try {
                // 1. Create User in Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // 2. Update Auth Profile
                await user.updateProfile({ displayName: name });
                
                // 3. Save User Data to Realtime Database
                try {
                    await db.ref('users/' + user.uid).set({
                        name: name,
                        email: email,
                        created_at: firebase.database.ServerValue.TIMESTAMP,
                        last_login: firebase.database.ServerValue.TIMESTAMP
                    });
                    console.log("Database write successful");
                } catch (dbError) {
                    console.error("Database write error on signup:", dbError);
                    showAlert(alertBox, "Account created, but database write failed: " + dbError.message, 'warning');
                }
                
                // 4. Set PHP Session via AJAX
                await createPHPSession(user.uid, email, name);
                
                // 5. Redirect (Removed here because onAuthStateChanged handles it safely now)
                
            } catch (error) {
                showAlert(alertBox, error.message, 'error');
                btn.disabled = false;
                btn.innerText = 'Sign Up';
            }
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            const alertBox = loginAlert;
            
            btn.disabled = true;
            btn.innerText = 'Logging in...';
            hideAlert(alertBox);
            
            try {
                // 1. Login to Firebase Auth
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // 2. Update user's details and last login in Realtime Database
                try {
                    await db.ref('users/' + user.uid).update({
                        email: email,
                        name: user.displayName || email.split('@')[0],
                        last_login: firebase.database.ServerValue.TIMESTAMP
                    });
                    console.log("Database update successful");
                } catch (dbError) {
                    console.error("Database update error on login:", dbError);
                    showAlert(alertBox, "Logged in, but database update failed: " + dbError.message, 'warning');
                }

                // 3. Set PHP Session via AJAX
                await createPHPSession(user.uid, email, user.displayName);
                
                // 3. Redirect (Removed here because onAuthStateChanged handles it safely now)
                
            } catch (error) {
                showAlert(alertBox, error.message, 'error');
                btn.disabled = false;
                btn.innerText = 'Login';
            }
        });
    }
    
    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging out...';
            try {
                // 1. Sign out of Firebase
                await auth.signOut();
                
                // 2. Destroy PHP Session via AJAX
                await destroyPHPSession();
                
                // 3. Redirect to login
                window.location.href = 'login.php';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out.');
                window.location.href = 'logout.php'; // Fallback
            }
        });
    }

    // Helper Functions
    async function createPHPSession(uid, email, displayName) {
        const response = await fetch('ajax/session.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                uid: uid,
                email: email,
                displayName: displayName
            })
        });
        return response.json();
    }
    
    async function destroyPHPSession() {
        const response = await fetch('ajax/session.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' })
        });
        return response.json();
    }
    
    function showAlert(element, message, type) {
        element.textContent = message;
        element.className = `alert alert-${type}`;
        element.style.display = 'block';
    }
    
    function hideAlert(element) {
        element.style.display = 'none';
        element.textContent = '';
    }
});
