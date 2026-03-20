<?php 
require_once 'includes/header.php'; 

// Redirect to login if not authenticated
if(!isset($_SESSION['user_uid'])) {
    header("Location: login.php");
    exit;
}
?>

<div class="page-title">
    <h2><i class="fa-solid fa-users"></i> Manage Groups</h2>
    <button class="btn-primary" onclick="toggleCreateGroupModal()"><i class="fa-solid fa-plus"></i> Create Group</button>
</div>

<div class="groups-grid" id="groupsContainer">
    <!-- Groups will be loaded here dynamically by JS -->
    <div class="glass" style="padding: 2rem; border-radius: 12px; grid-column: 1 / -1; text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style="margin-top: 1rem;">Loading your groups...</p>
    </div>
</div>

<!-- Modal Overlay for Creating/Editing Group (Simple hidden div approach without extra CSS for now, inline styles used for speed) -->
<div id="groupModal" class="glass" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; width: 90%; max-width: 500px; padding: 2rem; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
    <h3 id="modalTitle" style="margin-bottom: 1.5rem;">Create New Group</h3>
    <div class="form-group">
        <label>Group Name</label>
        <input type="text" id="groupNameInput" class="form-control" placeholder="e.g., Family, Road Trip">
    </div>
    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="btn-login" onclick="toggleCreateGroupModal()">Cancel</button>
        <button class="btn-primary" id="saveGroupBtn" onclick="createGroup()">Create</button>
    </div>
</div>

<!-- Modal Overlay for Inviting Users -->
<div id="inviteModal" class="glass" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; width: 90%; max-width: 500px; padding: 2rem; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
    <h3 style="margin-bottom: 1.5rem;">Add Member to <span id="inviteGroupName" style="color: var(--primary);"></span></h3>
    <input type="hidden" id="inviteGroupId">
    
    <div class="form-group">
        <label>User's Email Address</label>
        <div style="display: flex; gap: 0.5rem;">
            <input type="email" id="inviteEmailInput" class="form-control" placeholder="friend@example.com">
            <button class="btn-primary" onclick="inviteUser()">Add</button>
        </div>
        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;" id="inviteStatus"></small>
    </div>
    
    <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="btn-login" onclick="toggleInviteModal()">Close</button>
    </div>
</div>

<script>
    const currentUserUid = "<?php echo $_SESSION['user_uid']; ?>";
</script>
<script src="assets/js/groups.js?v=<?php echo time(); ?>"></script>

<?php require_once 'includes/footer.php'; ?>
