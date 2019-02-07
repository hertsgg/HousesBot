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



bot.on("ready", () => {
   logger.info('Connected');
   logger.info('Logged in as: ');
   console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 
});

bot.on("message", async message => {

  // let myRole = message.guild.roles.find(role => role.name === "testrole");

   if(message.author.bot) return;
   

   if(message.content.indexOf(config.prefix) !== 0) return;
   

   const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
   const command = args.shift().toLowerCase();
   
   switch (command) {
      case "ping":
         const m = await message.channel.send("Ping?");
         m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
         break;
      case "edit":
         let myRole = message.guild.roles.find(role => role.name === "testrole");
         myRole.edit({ color: 'GREEN'});
         
         console.log(`Edited ${myRole.name} colour ${s}`);
         break;
      case "add":
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
      case "leaderboard":
         dannisterScore = message.guild.roles.get(config.dannisterID); 
         stefcykaScore= message.guild.roles.get(config.stefcykaID);
         ssbScore = message.guild.roles.get(config.ssbID);
         slytherinScore = message.guild.roles.get(config.slytherinID); 
         message.channel.send(`\n **Slytherin**: *${slytherinScore.name}* \n**Team StefCyka**: *${stefcykaScore.name}* \n**House Dannister** ${dannisterScore.name} \n**SSB Clan** ${ssbScore.name}`);
         break;
   }

   });

bot.login(config.token);

