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
            message.channel.send(`\n **Slytherin**: *${slytherinScore.name}* \n**Team StefCyka**: *${stefcykaScore.name}* \n**House Dannister** *${dannisterScore.name}* \n**SSB Clan** *${ssbScore.name}*`);
            break;

        // Verify members/Assign them their house
        case "verify":
            let arg = args[1];
            let slytherinID = message.guild.roles.find(role => role.name === "Slytherin");
            let stefcykaID = message.guild.roles.find(role => role.name === "Team StefCyka");
            let ssbID = message.guild.roles.find(role => role.name === "SSB Clan");
            let dannisterID = message.guild.roles.find(role => role.name === "House Dannister");
            let sortingChoice = Math.floor(Math.random()*(4-1+1)+1);
            let sortingHat = [0,slytherinID,stefcykaID,ssbID,dannisterID];
            if (message.member.roles.has(config.committeeID)) {
                let mem = message.mentions.members.first();
                let verifiedRole = message.guild.roles.find(role => role.name === "✔️ Verified Member");
                if (mem.roles.has(verifiedRole.id)) {
                    message.channel.send(`${mem} is already verified!`);
                }
                else {
                    mem.addRole(verifiedRole.id).catch(console.error);
                    if (arg === "nohouse") {
                        message.channel.send(`Congratulations ${mem}! You're now verified!`);
                        break;
                    }
                    mem.addRole(sortingHat[sortingChoice]);
                    message.channel.send(`Congratulations ${mem}! You're now verified! The sorting hat has selected ${sortingHat[sortingChoice]} as your new house!`);
                }
                break;
            }
            else {
                message.reply(`Sorry you don't have permission to verify members`);
                break;
            }
        
        // Quickly remove all members of houses or verified members
        case "purge":
            if (message.member.roles.has(config.committeeID)) {
                let type = args[0];
                let confirm = args[1];
                let count=0;
                const list = bot.guilds.get(config.serverID);
                switch (type) {
                    case "verified":
                        if (confirm === "confirm") {
                            let verifiedRole = message.guild.roles.find(role => role.name === "✔️ Verified Member");
                            list.members.forEach(member => {
                                member.removeRole(verifiedRole);
                            });
                            message.reply("All verified roles' removed");
                        }
                        else {
                            message.reply(`Woah are you sure you want to do this? This will remove all verified members in the server. 
                                           Type '!purge verified confirm' if you're sure!`);
                        }
                        break;
                    case "houses":
                        if (confirm === "confirm") {
                            let slytherinID = message.guild.roles.find(role => role.name === "Slytherin");
                            let stefcykaID = message.guild.roles.find(role => role.name === "Team StefCyka");
                            let ssbID = message.guild.roles.find(role => role.name === "SSB Clan");
                            let dannisterID = message.guild.roles.find(role => role.name === "House Dannister");
                            list.members.forEach(member => {
                                if (member.roles.has(slytherinID.id)) member.removeRole(slytherinID)
                                else if (member.roles.has(stefcykaID.id)) member.removeRole(stefcykaID)
                                else if (member.roles.has(ssbID.id)) member.removeRole(ssbID)
                                else if (member.roles.has(dannisterID.id)) member.removeRole(dannisterID)
                            });
                            message.reply("All house members roles' removed");
                        }
                        else {
                            message.reply(`Woah are you sure you want to do this? This will remove all members in houses on the server. 
                                           Type '!purge houses confirm' if you're sure!`);
                        }
                        break;
                    default:
                        message.reply("You can only purge the following types: `houses` or `verified`");
                        break;
                };
                break;
            }
            else {
                message.reply(`Sorry you don't have permission to purge members' roles `);
                break;
            }

        // Shuffle houses
        case "shuffle":
            if (message.member.roles.has(config.committeeID)) {
                let confirm = args[0];
                if (confirm === "confirm") {
                    let count = 0;
                    const m = await message.channel.send("Sorting...");
                    let slytherinID = message.guild.roles.find(role => role.name === "Slytherin");
                    let stefcykaID = message.guild.roles.find(role => role.name === "Team StefCyka");
                    let ssbID = message.guild.roles.find(role => role.name === "SSB Clan");
                    let dannisterID = message.guild.roles.find(role => role.name === "House Dannister");
                    const list = bot.guilds.get(config.serverID);
                    list.members.forEach(member => {
                        setTimeout(function()
                        {   
                            if (member.roles.has(slytherinID.id)) member.removeRole(slytherinID)
                            else if (member.roles.has(stefcykaID.id)) member.removeRole(stefcykaID)
                            else if (member.roles.has(ssbID.id)) member.removeRole(ssbID)
                            else if (member.roles.has(dannisterID.id)) member.removeRole(dannisterID)
                            setTimeout(function()
                            {
                                let sortingChoice = Math.floor(Math.random()*(4-1+1)+1);
                                let sortingHat = [0,slytherinID,stefcykaID,ssbID,dannisterID];
                                member.addRole(sortingHat[sortingChoice]);
                                count++;
                                m.edit(`${message.author} Members Shuffled: ${count}`);
                            }, 5000);
                        }, 1000);
                    });
                    break;
                }
                else {
                    message.reply(`Woah are you sure you want to do this? This will shuffle everyones houses in the server. Type '!shuffle confirm' if you're sure!`);
                }
            }
            else {
                message.reply(`Sorry you don't have permission to shuffle members`);
                break;
            }
    }
   });

bot.login(config.token);

