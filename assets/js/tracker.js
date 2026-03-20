document.addEventListener('DOMContentLoaded', () => {
    if (!firebase.apps.length || !currentUserUid) return;
    
    // We only want to track if they are logged in and on the site
    startTracking();
});

let watchId = null;
let heartbeatInterval = null;
let lastKnownLocation = null;

function startTracking() {
    if ("geolocation" in navigator) {
        
        // Use watchPosition for continuous tracking of actual movement
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                lastKnownLocation = {lat, lng};
                updateLocationInFirebase(lat, lng);
            },
            (error) => {
                console.error("Error getting location: ", error.message);
                if (error.code === error.PERMISSION_DENIED) {
                    console.warn("Location permission denied by user.");
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 5000
            }
        );
        
        // Heartbeat interval: Every 5 seconds, update Firebase.
        // This keeps the user marked as "Online" perfectly even if they stand still!
        heartbeatInterval = setInterval(() => {
            if (lastKnownLocation) {
                updateLocationInFirebase(lastKnownLocation.lat, lastKnownLocation.lng);
            } else {
                // If watchPosition hasn't fired yet, force a manual fetch
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        lastKnownLocation = {lat, lng};
                        updateLocationInFirebase(lat, lng);
                    },
                    (error) => { console.warn("Heartbeat fetch failed:", error.message); },
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
                );
            }
        }, 5000); // 5 seconds interval
        
        // Also listen for page hidden/unload to properly clean up
        window.addEventListener('beforeunload', () => {
            if(watchId) navigator.geolocation.clearWatch(watchId);
            if(heartbeatInterval) clearInterval(heartbeatInterval);
        });
        
    } else {
        console.error("Geolocation is not supported by this browser.");
        alert("Geolocation is not supported by your browser.");
    }
}

function updateLocationInFirebase(lat, lng) {
    if (!db || !currentUserUid) return;
    
    const locationData = {
        lat: lat,
        lng: lng,
        last_updated: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Note: User profile node exists because of auth.js creation. Just updating location tree.
    db.ref(`users/${currentUserUid}/location`).set(locationData)
        .catch(err => console.error("Firebase update failed:", err));
        
    // Dispatch a custom event in case map.js needs immediate local feedback
    window.dispatchEvent(new CustomEvent('localLocationUpdated', { detail: {lat, lng} }));
}
