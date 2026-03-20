let map;
let markers = {}; // Store marker instances by UID
let currentUserLocation = null;

// Online/Offline threshold (5 minutes)
const OFFLINE_THRESHOLD_MS = 5 * 60 * 1000; 

// Initialized by DOMContentLoaded in index.php
window.initMap = async function() {
    if (typeof google === 'undefined' || !google.maps) {
        // Retry if Google Maps script hasn't loaded yet
        setTimeout(window.initMap, 100);
        return;
    }

    const { Map } = await google.maps.importLibrary("maps");
    
    // Map options with a dark modern theme to match previous CartoDB Dark Matter
    map = new Map(document.getElementById('map'), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
        disableDefaultUI: false,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }]
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }]
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }]
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }]
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }]
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }]
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }]
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }]
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }]
            }
        ]
    });

    if (typeof firebase === 'undefined' || !firebase.apps.length || !currentUserUid) return;
    
    if (isSharedView) {
        startSharedLocationsListener();
    } else {
        startMyLocationListener();
    }
    
    // Periodically re-evaluate online/offline status for existing markers
    setInterval(() => {
        Object.keys(markers).forEach(uid => {
            updateMarkerStatus(uid);
        });
    }, 60000); // Check every minute
};

function startMyLocationListener() {
    db.ref(`users/${currentUserUid}`).on('value', (snapshot) => {
        const user = snapshot.val();
        if(user && user.location) {
            currentUserLocation = user.location;
            updateMarkerOnMap(currentUserUid, user, true);
        }
    });

    // Also fallback if local API fires quicker
    window.addEventListener('localLocationUpdated', (e) => {
        const pos = { lat: e.detail.lat, lng: e.detail.lng };
        currentUserLocation = pos;
        map.panTo(pos);
        map.setZoom(16);
    });
}

function startSharedLocationsListener() {
    // Keep local position updated too so we can measure distance
    db.ref(`users/${currentUserUid}/location`).on('value', (snap) => {
        const loc = snap.val();
        if(loc) currentUserLocation = loc;
    });

    // 1. Find all groups the user is in
    db.ref('groups').on('value', async (groupsSnapshot) => {
        const sharedUids = new Set();
        
        // Always include self in shared view
        sharedUids.add(currentUserUid);

        groupsSnapshot.forEach(groupSnap => {
            const group = groupSnap.val();
            
            // If we own it, or we are a member
            if(group.ownerId === currentUserUid || (group.members && group.members[currentUserUid])) {
                // Add owner
                sharedUids.add(group.ownerId);
                // Add all members
                if(group.members) {
                    Object.keys(group.members).forEach(uid => sharedUids.add(uid));
                }
            }
        });
        
        // 2. Set up listeners for all unique UIDs in our groups
        listenToUsers(Array.from(sharedUids));
        
        // 3. Remove markers for users no longer shared with us
        Object.keys(markers).forEach(uid => {
            if(!sharedUids.has(uid)) {
                if (markers[uid].layer) {
                    markers[uid].layer.map = null; // Remove from map
                }
                delete markers[uid];
            }
        });
    });
}

// Keep track of active Firebase connections to prevent duplicates
let activeListeners = {};

function listenToUsers(uids) {
    uids.forEach(uid => {
        if(!activeListeners[uid]) {
            activeListeners[uid] = db.ref(`users/${uid}`).on('value', (snapshot) => {
                const user = snapshot.val();
                if(user && user.location) {
                    updateMarkerOnMap(uid, user, uid === currentUserUid);
                }
            });
        }
    });
}

function getMarkerHtml(color, labelText, isOnline) {
    return `
    <div style="display: flex; flex-direction: column; align-items: center; width: 150px; margin-left: -75px; margin-top: -10px;">
        <div style="background-color: ${color}; border: 2px solid white; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>
        <div class="marker-label" style="color: #f8fafc; font-size: 12px; font-weight: 500; margin-top: 4px; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 6px; text-align: center; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">${labelText}</div>
    </div>`;
}

function fitMapToBounds() {
    const markerKeys = Object.keys(markers);
    if (markerKeys.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    let hasValidPositions = false;

    markerKeys.forEach(k => {
        const marker = markers[k].layer;
        if (marker && marker.position) {
            bounds.extend(marker.position);
            hasValidPositions = true;
        }
    });
    
    if (hasValidPositions) {
        if (markerKeys.length === 1) {
            map.panTo(markers[markerKeys[0]].layer.position);
            map.setZoom(15);
        } else {
            map.fitBounds(bounds);
        }
    }
}

async function updateMarkerOnMap(uid, userData, isSelf) {
    if (!userData.location || !userData.location.lat) return;
    
    const pos = { lat: userData.location.lat, lng: userData.location.lng };
    const lastUpdate = userData.location.last_updated || 0;
    
    // Calculate if offline based on timestamp
    const now = Date.now();
    const isOffline = (now - lastUpdate) > OFFLINE_THRESHOLD_MS;
    
    // Determine Color
    let markerColor = '#10b981'; // Green (Online)
    if (isSelf) {
        markerColor = '#3b82f6'; // Blue (Self)
    } else if (isOffline) {
        markerColor = '#ef4444'; // Red (Offline)
    }

    // Determine Distance
    let distanceTextHTML = "";
    let rawDistanceText = "";
    if (!isSelf && currentUserLocation) {
        const p1 = new google.maps.LatLng(currentUserLocation.lat, currentUserLocation.lng);
        const p2 = new google.maps.LatLng(pos.lat, pos.lng);
        const distanceMeters = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        
        if (distanceMeters > 1000) {
            rawDistanceText = `📍 ${(distanceMeters / 1000).toFixed(1)} km`;
        } else {
            rawDistanceText = `📍 ${Math.round(distanceMeters)} m`;
        }
        distanceTextHTML = `<br><span style="color: #93c5fd; font-weight: bold; font-size: 11px;">${rawDistanceText} away</span>`;
    }

    // Label Text
    let labelText = userData.name || 'User';
    let rawName = labelText;
    if(isSelf) labelText += ' (You)';
    labelText += distanceTextHTML;

    const iconHtml = getMarkerHtml(markerColor, labelText, !isOffline);
    
    // Create DOM element for AdvancedMarkerElement
    const el = document.createElement('div');
    el.innerHTML = iconHtml;

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    if (markers[uid]) {
        // Update existing
        markers[uid].layer.position = pos;
        markers[uid].layer.content = el;
        
        // Store timestamp for interval checking
        markers[uid].last_updated = lastUpdate;
        markers[uid].isSelf = isSelf;
        markers[uid].color = markerColor;
        markers[uid].labelText = labelText;
        markers[uid].rawName = rawName;
        markers[uid].rawDistanceText = rawDistanceText;
        
    } else {
        // Create new
        const newMarker = new AdvancedMarkerElement({
            map: map,
            position: pos,
            content: el
        });
        
        markers[uid] = {
            layer: newMarker,
            last_updated: lastUpdate,
            isSelf: isSelf,
            color: markerColor,
            labelText: labelText,
            rawName: rawName,
            rawDistanceText: rawDistanceText
        };
    }
    fitMapToBounds();
    updateSharedUsersList();
}

function updateMarkerStatus(uid) {
    const markerData = markers[uid];
    if(!markerData || markerData.isSelf) return;
    
    const now = Date.now();
    const isOffline = (now - markerData.last_updated || 0) > OFFLINE_THRESHOLD_MS;
    
    let newColor = isOffline ? '#ef4444' : '#10b981';
    
    if (markerData.color !== newColor) {
        markerData.color = newColor;
        
        // Distance is already embedded in labelText from the last update
        const iconHtml = getMarkerHtml(newColor, markerData.labelText, !isOffline);
        const el = document.createElement('div');
        el.innerHTML = iconHtml;
        
        markerData.layer.content = el;
        updateSharedUsersList();
    }
}

function updateSharedUsersList() {
    const listContainer = document.getElementById('sharedUsersList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    const uids = Object.keys(markers);
    if (uids.length === 0) {
        listContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No members sharing location.</p>';
        return;
    }
    
    // Sort to put self first, then online, then offline
    uids.sort((a, b) => {
        const mA = markers[a];
        const mB = markers[b];
        if (mA.isSelf) return -1;
        if (mB.isSelf) return 1;
        if (mA.color === '#10b981' && mB.color === '#ef4444') return -1;
        if (mA.color === '#ef4444' && mB.color === '#10b981') return 1;
        return 0;
    });

    uids.forEach(uid => {
        const m = markers[uid];
        
        let statusText = "Online";
        if (m.isSelf) statusText = "You";
        else if (m.color === '#ef4444') statusText = "Offline";
        
        listContainer.innerHTML += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${m.color}; box-shadow: 0 0 5px ${m.color};"></div>
                <div>
                    <div style="font-size: 0.9rem; font-weight: 500; color: var(--text-main); line-height: 1.2;">${m.rawName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${statusText} ${m.rawDistanceText || ''}</div>
                </div>
            </div>
            <button onclick="panToUser('${uid}')" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-main); cursor: pointer; border-radius: 6px; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; transition: var(--transition);" onmouseover="this.style.background='var(--primary)'; this.style.borderColor='var(--primary)';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='var(--border-color)';">
                <i class="fa-solid fa-crosshairs"></i>
            </button>
        </div>
        `;
    });
}

window.panToUser = function(uid) {
    if (markers[uid] && markers[uid].layer && markers[uid].layer.position) {
        map.panTo(markers[uid].layer.position);
        map.setZoom(16);
    }
};
