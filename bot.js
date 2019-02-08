const Discord = require("discord.js");

// Initialize Discord Bot
const bot = new Discord.Client();
const logger = require('winston');
const config = require("./config.json");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

//Initial setup
bot.on("ready", () => {
   logger.info('Connected');
   console.log(`Bot has started: Users: ${bot.users.size}; Channels: ${bot.channels.size}; Servers: ${bot.guilds.size}`); 
});

//Chat commands, message replies
bot.on("message", async message => {
   if(message.content.indexOf(config.prefix) !== 0) return;
   
   const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
   const command = args.shift().toLowerCase();
   
   switch (command) {
        // Generic PING command
        case "ping":
            const m = await message.channel.send("Ping?");
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
            break;
        // Add scores to houses
        case "add":
            // ensure committee are the only people to add scores to houses
            if (message.member.roles.has(config.committeeID)) {
                let house = args[0];
                let newScoreString = args[1];
                let scoreInt = 0;
                let scoreString = ''; 
                if (house.toUpperCase() === "SLYTHERIN" ) {
                scoreString = message.guild.roles.get(config.slytherinID);
                scoreInt = parseInt(scoreString.name);
                }
                else if (house.toUpperCase() === "SSB" ) {
                scoreString = message.guild.roles.get(config.ssbID);
                scoreInt = parseInt(scoreString.name);
                }
                else if (house.toUpperCase() === "STEFCYKA" ) {
                scoreString = message.guild.roles.get(config.stefcykaID); 
                scoreInt = parseInt(scoreString.name);
                }
                else if (house.toUpperCase() === "DANNISTER" ) {
                scoreString = message.guild.roles.get(config.dannisterID); 
                scoreInt = parseInt(scoreString.name);
                }
                else {
                message.reply(`the house ${house} doesn't exist`);
                break;
                }
                
                let newScoreInt = parseInt(newScoreString);
                newScoreInt += scoreInt;
                let newScore = newScoreInt.toString();
                scoreString.edit({name: newScore});
                message.reply(`added score to ${house}. New score: ${newScoreInt} Old score: ${scoreString.name}`);
                break;
            }
            else {
            message.reply(`Sorry you don't have permission to add scores to houses`);
            break;
            }
        // Leaderboard command to see where each house stands
        case "leaderboard":
            dannisterScore = message.guild.roles.get(config.dannisterID); 
            stefcykaScore= message.guild.roles.get(config.stefcykaID);
            ssbScore = message.guild.roles.get(config.ssbID);
            slytherinScore = message.guild.roles.get(config.slytherinID); 
            message.channel.send(`\n **Slytherin**: *${slytherinScore.name}* \n**Team StefCyka**: *${stefcykaScore.name}* \n**House Dannister** ${dannisterScore.name} \n**SSB Clan** ${ssbScore.name}`);
            break;
        // Verify members
        case "verify":
            if (message.member.roles.has(config.committeeID)) {
                let mem = message.mentions.members.first();
                let verifiedRole = message.guild.roles.find(role => role.name === "✔️ Verified Member");
                if (mem.roles.has(verifiedRole.id)) {
                    message.channel.send(`${mem} is already verified!`);
                }
                else {
                    mem.addRole(verifiedRole.id).catch(console.error);
                    message.channel.send(`Congratulations ${mem}! You're now verified!`);
                }
                break;
            }
            else {
                message.reply(`Sorry you don't have permission to verify members`);
                break;
            }
   }
   });

bot.login(config.token);

