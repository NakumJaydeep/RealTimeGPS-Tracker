// Global Modal Functions
function toggleCreateGroupModal() {
    const modal = document.getElementById('groupModal');
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    if(modal.style.display === 'block') document.getElementById('groupNameInput').focus();
}

function toggleInviteModal(groupId = null, groupName = null) {
    const modal = document.getElementById('inviteModal');
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    
    if (modal.style.display === 'block') {
        document.getElementById('inviteGroupId').value = groupId;
        document.getElementById('inviteGroupName').textContent = groupName;
        document.getElementById('inviteEmailInput').value = '';
        document.getElementById('inviteStatus').textContent = '';
        document.getElementById('inviteEmailInput').focus();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure Firebase is initialized
    if (!firebase.apps.length) return;
    
    loadUserGroups();
});

// Load Groups Current User is a Member Of (or Owns)
function loadUserGroups() {
    const container = document.getElementById('groupsContainer');
    
    // We query all groups. In a production app with thousands of nodes, we would use rules or a join table.
    // For this demo, we'll fetch groups and filter where member list has our UID.
    db.ref('groups').on('value', (snapshot) => {
        container.innerHTML = '';
        let hasGroups = false;
        
        snapshot.forEach((childSnapshot) => {
            const groupCode = childSnapshot.key;
            const group = childSnapshot.val();
            
            // Check if current user is owner or member
            if (group.ownerId === currentUserUid || (group.members && group.members[currentUserUid])) {
                hasGroups = true;
                renderGroupCard(group, groupCode, container);
            }
        });
        
        if (!hasGroups) {
            container.innerHTML = `
                <div class="glass" style="padding: 3rem; border-radius: 12px; grid-column: 1 / -1; text-align: center;">
                    <i class="fa-regular fa-folder-open fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 0.5rem;">No Groups Yet</h3>
                    <p style="color: var(--text-muted);">Create a group to start sharing your location with friends and family.</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("Firebase read error:", error);
        container.innerHTML = `
            <div class="glass" style="padding: 3rem; border-radius: 12px; grid-column: 1 / -1; text-align: center; border-color: var(--danger);">
                <i class="fa-solid fa-triangle-exclamation fa-3x" style="color: var(--danger); margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 0.5rem; color: var(--danger);">Database Permission Error</h3>
                <p style="color: var(--text-muted);">Please set your Firebase Realtime Database Security Rules to true for testing, or check console.</p>
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; font-family: monospace; font-size: 0.8rem; text-align: left; color: #fca5a5;">
                    {<br>
                    &nbsp;&nbsp;"rules": {<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;".read": true,<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;".write": true<br>
                    &nbsp;&nbsp;}<br>
                    }
                </div>
            </div>
        `;
    });
}

function renderGroupCard(group, groupId, container) {
    const isOwner = group.ownerId === currentUserUid;
    const membersCount = group.members ? Object.keys(group.members).length : 0;
    
    // Create Card HTML synchronously to prevent race conditions from Firebase .on triggered multiple times
    const cardNode = document.createElement('div');
    cardNode.className = 'group-card glass';
    cardNode.id = `group-${groupId}`;
    // Temporary loading state for members
    cardNode.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3 class="group-name"><i class="fa-solid fa-layer-group" style="color: var(--primary);"></i> ${group.name}</h3>
            ${isOwner ? `<button onclick="deleteGroup('${groupId}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer;"><i class="fa-solid fa-trash hover-danger"></i></button>` : ''}
        </div>
        
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            <i class="fa-solid fa-users"></i> ${membersCount} Members
        </p>
        
        ${isOwner ? `<button class="btn-primary" style="width: 100%; margin-bottom: 1rem; padding: 0.6rem; font-size: 0.9rem;" onclick="toggleInviteModal('${groupId}', '${group.name}')"><i class="fa-solid fa-user-plus"></i> Add Member</button>` : ''}
        
        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;" id="members-list-${groupId}">
            <p style="font-size: 0.85rem; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading members...</p>
        </div>
    `;
    
    container.appendChild(cardNode);
    
    // Create an array of member promises to fetch details
    const memberPromises = [];
    if(group.members) {
        Object.keys(group.members).forEach(memberUid => {
            const memberPromise = db.ref(`users/${memberUid}`).once('value')
                .then(snap => {
                    return { uid: memberUid, data: snap.val() };
                })
                .catch(err => {
                    console.warn(`Could not fetch data for member ${memberUid}`, err);
                    return { uid: memberUid, data: { name: 'Unknown User', email: 'hidden' } };
                });
            memberPromises.push(memberPromise);
        });
    }

    // After fetching all members details, render the card
    Promise.all(memberPromises).then(members => {
        let membersListHTML = '<div class="member-list">';
        members.forEach(member => {
            if(!member.data) return; // User deleted
            
            const isMe = member.uid === currentUserUid;
            const isOwnerMember = member.uid === group.ownerId;
            
            let badge = '';
            if (isOwnerMember) badge = '<span style="font-size: 0.7rem; background: var(--primary); padding: 2px 6px; border-radius: 4px; margin-left: 5px;">Owner</span>';
            if (isMe) badge += '<span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; margin-left: 5px;">You</span>';
            
            let removeBtn = '';
            // Owner can remove anyone except themselves right here (they can delete group)
            if (isOwner && !isMe) {
                 removeBtn = `<button onclick="removeMember('${groupId}', '${member.uid}')" style="background: none; border: none; color: var(--danger); cursor: pointer;"><i class="fa-solid fa-user-xmark"></i></button>`;
            } 
            // Members can leave
            else if (isMe && !isOwner) {
                 removeBtn = `<button onclick="removeMember('${groupId}', '${member.uid}')" style="background: none; border: none; color: var(--danger); cursor: pointer;" title="Leave Group"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>`;
            }

            membersListHTML += `
                <div class="member-item">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-user" style="font-size: 0.8rem;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem;">${member.data.name || 'Unknown User'} ${badge}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${member.data.email || 'No email set'}</div>
                        </div>
                    </div>
                    ${removeBtn}
                </div>
            `;
        });
        
        membersListHTML += '</div>';

        const membersContainer = document.getElementById(`members-list-${groupId}`);
        if(membersContainer) {
            membersContainer.innerHTML = `<h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-muted);">Members</h4>${membersListHTML}`;
        }
    });
}

// Create Group
window.createGroup = async function() {
    const nameInput = document.getElementById('groupNameInput');
    const name = nameInput.value.trim();
    const btn = document.getElementById('saveGroupBtn');
    
    if(!name) {
        alert('Please enter a group name');
        return;
    }
    
    btn.disabled = true;
    btn.innerText = 'Creating...';
    
    try {
        console.log("Creating group with name: ", name, " for owner: ", currentUserUid);
        const newGroupRef = db.ref('groups').push();
        await newGroupRef.set({
            name: name,
            ownerId: currentUserUid,
            members: {
                [currentUserUid]: true
            },
            created_at: firebase.database.ServerValue.TIMESTAMP
        });
        console.log("Group creation successful");
        
        nameInput.value = '';
        toggleCreateGroupModal();
    } catch (error) {
        console.error("Group creation error:", error);
        alert('Error creating group: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Create';
    }
}

// Delete Group entirely
window.deleteGroup = async function(groupId) {
    if(!confirm('Are you sure you want to delete this group completely?')) return;
    
    try {
        await db.ref(`groups/${groupId}`).remove();
    } catch (error) {
        console.error(error);
        alert('Error deleting group');
    }
}

// Remove Member (or Leave)
window.removeMember = async function(groupId, memberUid) {
    const isMe = memberUid === currentUserUid;
    const msg = isMe ? 'Are you sure you want to leave this group?' : 'Remove this user from the group?';
    
    if(!confirm(msg)) return;
    
    try {
        await db.ref(`groups/${groupId}/members/${memberUid}`).remove();
    } catch (error) {
        console.error(error);
        alert('Error removing member');
    }
}

// Invite Member by Email (Finds UID by email lookup - requires querying users list)
window.inviteUser = async function() {
    const emailInput = document.getElementById('inviteEmailInput').value.trim().toLowerCase();
    const groupId = document.getElementById('inviteGroupId').value;
    const statusTxt = document.getElementById('inviteStatus');
    
    if(!emailInput) return;
    
    statusTxt.style.color = 'var(--text-main)';
    statusTxt.textContent = 'Searching for user...';
    
    try {
        // Query users by email to find UID
        // Note: Realtime database needs indexing in rules for production `".indexOn": ["email"]`
        let usersSnapshot = null;
        try {
            usersSnapshot = await db.ref('users').orderByChild('email').equalTo(emailInput).once('value');
        } catch (idxErr) {
            console.warn("Indexed query failed, falling back to full fetch for search", idxErr);
        }
        
        // Extract UID
        let targetUid = null;
        
        if(usersSnapshot && usersSnapshot.exists()) {
            usersSnapshot.forEach(child => {
                targetUid = child.key;
            });
        } else {
            // Fallback: If indexing is missing on the database structure, orderByChild will fail to return data.
            // Let's do a client-side filter as a fallback for this demo environment.
            console.log("Attempting fallback client-side search...");
            const allUsersSnap = await db.ref('users').once('value');
            if (allUsersSnap.exists()) {
                allUsersSnap.forEach(child => {
                    const u = child.val();
                    if (u && u.email && u.email.toLowerCase() === emailInput) {
                        targetUid = child.key;
                    }
                });
            }
        }
        
        if(!targetUid) {
            statusTxt.style.color = 'var(--danger)';
            statusTxt.textContent = 'User not found. Ensure they have signed up first and logged in recently.';
            return;
        }
        
        if(targetUid === currentUserUid) {
             statusTxt.style.color = 'var(--danger)';
             statusTxt.textContent = "You are already in this group as the owner.";
             return;
        }
        
        // Add to group
        await db.ref(`groups/${groupId}/members/${targetUid}`).set(true);
        
        statusTxt.style.color = 'var(--secondary)';
        statusTxt.textContent = 'User added successfully!';
        document.getElementById('inviteEmailInput').value = '';
        
        setTimeout(toggleInviteModal, 1500);
        
    } catch (error) {
        console.error(error);
        statusTxt.style.color = 'var(--danger)';
        statusTxt.textContent = 'An error occurred. Make sure database rules allow reading users.';
    }
}
