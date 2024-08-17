module.exports = (client) => {
    client.user.setPresence({ activities: [{
        name: 'Arya-Bot',
        type: 1,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'idle',
        Timestamp:[{ 
            start: Date.now(),
        }],
        buttons: [{
            label: 'Add bot',
            url: 'https://discord.com/api/oauth2/authorize?client_id=1058301116608000000&permissions=8&scope=bot%20applications.commands',
        }]
        }] });
}