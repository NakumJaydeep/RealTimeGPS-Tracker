const admin = require('firebase-admin');

// We don't have a service account key, so we'll use the REST API to just GET the public (rules=true) data
const fetch = require('node-fetch');

async function dumpDB() {
    try {
        const groupsRes = await fetch('https://gps-traking-pro-default-rtdb.asia-southeast1.firebasedatabase.app/groups.json');
        const groups = await groupsRes.json();
        console.log("--- GROUPS ---");
        console.log(JSON.stringify(groups, null, 2));

        const usersRes = await fetch('https://gps-traking-pro-default-rtdb.asia-southeast1.firebasedatabase.app/users.json');
        const users = await usersRes.json();
        console.log("\n--- USERS ---");
        
        // Just print user keys and emails to avoid huge dump
        for(let uid in users) {
             console.log(`UID: ${uid}, Email: ${users[uid].email}, Name: ${users[uid].name}`);
        }
        
    } catch(e) {
        console.error(e);
    }
}

dumpDB();
