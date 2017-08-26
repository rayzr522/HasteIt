const fs = require('fs');
const snekfetch = require('snekfetch');
const Discord = require('discord.js');
const client = new Discord.Client();

if (!fs.existsSync('./config.json')) {
    console.error('The config.json file could not be found. Please duplicate config.json.example and rename it to config.json, then fill in the data.');
    process.exit(1);
}

const config = require('./config.json');

console.log('Logging in...');
client.login(config.token);

client.on('ready', () => {
    console.log(`Connected to Discord as ${client.user.tag} (ID: ${client.user.id})`);

    if (!client.user.bot) {
        console.log('Running under a user account, selfbot mode activated.');
    }
});

client.on('message', async message => {
    if (!message.guild || !message.guild.id) {
        return;
    }

    if (message.author.bot) {
        return;
    }

    if (!client.user.bot && message.author.id !== client.user.id) {
        // Work as a selfbot, too.
        return;
    }

    const uploads = [];

    message.content.replace(/\`\`\`(\w*)\n?([\s\S]+?)\n?\`\`\`/g, (_, lang, content) => {
        uploads.push(uploadToHastebin(content));
    });

    let output = '';

    for (let i = 0; i < uploads.length; i++) {
        const url = await uploads[i];
        output += `${url}\n`;
    }

    if (output) {
        message.channel.send(output);
    }
});

function uploadToHastebin(content) {
    return snekfetch.post('https://hastebin.com/documents')
        .send(content)
        .then(res => `https://hastebin.com/${res.body.key}`);
}
