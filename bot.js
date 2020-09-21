const Discord = require("discord.js");

// Initialize Discord Bot
const bot = new Discord.Client({forceFetchUsers: true});
require('dotenv').config();
const moment = require('moment');

//Connect to Twitch Client
var twitch = require('twitch-api-v5');
twitch.clientID = process.env.twitchClientId;

//Establish connection to MongoDB
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.mongoAddress, {useNewUrlParser: true}, (err, client) => {
    if (err) {
        console.error(err);
        client.close()
        return;
    } else{
        const db = client.db("hertsgg");
        const collection = db.collection("twitch-stats");
        client.close();
    }
});


//Initial setup
bot.on("ready", () => {
   const list = bot.guilds.get(process.env.serverID);
   console.log(`Bot has started: Users: ${list.members.size} ${list.memberCount}; Channels: ${bot.channels.size}; Servers: ${bot.guilds.size}`); 
});

//Chat commands, message replies
bot.on("message", async message => {
   if (message.content.indexOf(process.env.prefix) !== 0) return;
   const list = bot.guilds.get(process.env.serverID);
   await list.fetchMembers();
   console.log(`${list.members.size}`);
   const args = message.content.slice(process.env.prefix.length).trim().split(/ +/g);
   const command = args.shift().toLowerCase();

   switch (command) {
        // Generic PING command
        case "ping":
            const m = await message.channel.send("Ping?");
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
            break;

        // Verify members/Assign them their house
        case "verify":
            if (message.member.roles.has(process.env.committeeID)) {
                let mem = message.mentions.members.first();
                let verifiedRole = message.guild.roles.find(role => role.name === "✔️ Verified Member");
                if (mem.roles.has(verifiedRole.id)) {
                    message.channel.send(`${mem} is already verified!`);
                }
                else {
                    mem.addRole(verifiedRole.id).catch(console.error);
                    message.channel.send(`Congratulations ${mem}! You're now verified!`);
                    message.delete(1000);
                    break;
                }
                break;
            }
            else {
                message.reply(`Sorry, you don't have permission to verify members`);
                break;
            }
        
        // Quickly remove all members of houses or verified members
        case "purge":
            if (message.member.roles.has(process.env.committeeID)) {
                let type = args[0];
                let confirm = args[1];
                let count = 0;
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
                            message.reply(`Woah are you sure you want to do this? This will remove all the verified member roles in the server. 
                                           Type '!purge verified confirm' if you're sure!`);
                        }
                        break;
                    default:
                        message.reply("You can only purge the following types: `verified`");
                        break;
                };
                break;
            }
            else {
                message.reply(`Sorry, you don't have permission to purge members' roles `);
                break;
            }
        
        case "alumni":
            if (message.member.roles.has(process.env.committeeID)) {
                let arg = args[1];
                let alumniRole = message.guild.roles.find(role => role.name === "Society Alumni");
                let mem = message.mentions.members.first();
                if (mem.roles.has(alumniRole.id)) {
                    message.channel.send(`${mem} is already an alumni student!`);
                    break;
                }
                else {
                    mem.addRole(alumniRole.id).catch(console.error);
                    message.channel.send(`Congratulations ${mem}! You're now an official alumni student!`);
                    break;
                }
            } else {
                    message.channel.send(`Sorry, you don't have permission to add alumni students`);
                    break;
            }
        
        case "addstreamer":
            if (message.member.roles.has(process.env.committeeID)) {
                if (!args[1] || !message.mentions.members.first()) {
                    message.reply('Incorrect syntax, try !addstreamer @discordId twitchId');
                    break;
                }
                const m = await message.channel.send("Adding streamer...");
                let member = message.mentions.members.first();
                let twitchId = args[1];
                await addNewStreamer(member, twitchId, m);
                break;
            }
            else {
                message.reply(`Sorry, you don't have permission to add new streamers`)
                break;
            }

        case "checkmypoints":
            const mess = await message.channel.send("Checking points...");
            await checkMyPoints(message.author.id, mess);
            break;

        default:
            message.channel.send(`Sorry, I don't quite understand what you're asking. You can find more information about me here: \n\n https://github.com/hertsgg/HousesBot`); 
    }
   });

async function checkMyPoints(userId, m) {
    await MongoClient.connect(process.env.mongoAddress, {useNewUrlParser: true}, (err, client) => {
        if (err) {
            console.error(err);
            client.close();
            return;
        } else {
            const db = client.db("hertsgg");
            const collection = db.collection("twitch-stats");
            var exists = false;
            collection.find().toArray((err, items) => {
                items.forEach(item => {
                    if (userId === item.userId) {
                        exists = true;
                        m.edit(`So far ${item.twitchId} has earned ${item.streamAllTime} points`);
                    }
                });
            });
        }
        if (!exists) {
            m.edit(`We couldn't find you in the our database, are you a part of our stream team? Sign up at <http://streamteam.herts.gg>`);
        }
        client.close();
    });
}

async function addNewStreamer(member, twitchID, m) {
    await MongoClient.connect(process.env.mongoAddress, {useNewUrlParser: true}, (err, client) => {
        if (err) {
            console.error(err);
            client.close();
            return;
        } else {
            const db = client.db("hertsgg");
            const collection = db.collection("twitch-stats");
            var exists = false;
            collection.find().toArray((err, items) => {
                items.forEach(item => {
                    if (item.userId === member.id || item.twitchId === twitch) {
                        exists = true;
                    }
                });
                if (!exists) {
                    twitch.users.usersByName({ users: twitchID }, (err, res) => {
                        if(err) {
                            console.log(err);
                            m.edit(`We couldn't find ${twitchID} in the twitch database. Make sure it is spelt correctly.`);
                        } else {
                            if (res.users.length === 1) {
                                collection.insertOne({userId: member.id, twitchId: twitchID, twitchChannelId: res.users[0]._id, streamingNow: false, streamStreakTime: 0, streamAllTime: 0, recentStreamStart: null, recentStreamEnd: null}, (err, res) => {
                                    if (err) {
                                        console.log(err);
                                        m.edit(`This user already exists in our database or there has been some sort of error.`);
                                        client.close();
                                    } else {
                                        m.edit(`Welcome ${member} to the herts.gg stream team! We will track your streaming hours for your twitch rewards for you :)`);
                                        client.close();
                                    }
                                });
                            } else {
                                m.edit(`We couldn't find ${twitchID} in the twitch database. Make sure it is spelt correctly.`);
                                client.close();
                            }
                        }
                    });
                } else {
                    m.edit(`This user already exists in our database or there has been some sort of error.`);
                    client.close();
                } 
            });
        }
    });
}

async function checkResetStreamStreakTime(streamer,collection) {
    if (streamer.recentStreamEnd !== null) {
        var timeSinceLastStream = moment.duration(moment(moment().format()).diff(moment(streamer.recentStreamEnd))).asDays();
        if (timeSinceLastStream >= 28) {
            await collection.updateOne({twitchId: streamer.twitchId}, {'$set': {'streamStreakTime': 0}});
        }
    }
}

async function updateChannelStatus(streamer, collection, message) {
    await collection.updateMany({twitchId: streamer.twitchId}, {'$set': {'streamingNow': true, 'recentStreamStart': moment().format(), 'streamMessage': message.id}});
}

async function updateChannelStatusHosted(streamer, collection, message) {
    await collection.updateMany({twitchId: streamer.twitchId}, {'$set': {'recentStreamStart': moment().format(), 'streamMessage': message.id}});
}

async function updateChannelStatsPostStream(channel, collection, durationOfStream) {
    var newStreak = channel.streamStreakTime + durationOfStream;
    var newAllTime = channel.streamAllTime + durationOfStream;
    await collection.updateMany({twitchId: channel.twitchId}, {'$set': {'recentStreamEnd': moment().format(), 'streamStreakTime': newStreak, 'streamAllTime': newAllTime}}); 
}

async function deleteStreamAlert(item) {
    var messageId = await item.streamMessage;
    await bot.channels.get(process.env.streamDiscord).fetchMessage(messageId).then(message => message.delete());
}

async function updateHertsGGInfo(streamer, hertsgg, collection, message) {
    const newStreamer = {
        ...streamer,
        streamMessage: message.id
    }
    await collection.updateMany({twitchId: hertsgg.twitchId}, {'$set': {'streamingNow': true, 'streamMessage': message.id, 'recentStreamStart': moment().format(), 'hostingNow': newStreamer}});
}

async function checkStreamTeamOnHertsgg(items, hertsgg, status, collection) {
    for (var streamers = 0; streamers < items.length; streamers++) {
        streamer = items[streamers]
        if (status.includes("<"+streamer.twitchId+">")) {
            let message = await bot.channels.get(process.env.streamDiscord).send(streamer.twitchId + ` has gone live on hertsgg! Check them out here: https://www.twitch.tv/hertsgg`);
            await checkResetStreamStreakTime(streamer,collection)
            await updateChannelStatusHosted(streamer, collection, message)
            await updateHertsGGInfo(streamer, hertsgg, collection, message)
            return true
        }
    }
    return false
}

async function setupHertsggStream(hertsgg, collection) {
    let message = await bot.channels.get(process.env.streamDiscord).send(`We just went live! Check us out here: https://www.twitch.tv/hertsgg`);
    await checkResetStreamStreakTime(hertsgg, collection)
    await updateChannelStatus(hertsgg, collection, message)
}

async function updateHostedChannelStatsPostStream(hertsgg, collection) {
    await collection.updateMany({twitchId: hertsgg.twitchId}, {'$set': {'streamingNow': false, 'recentStreamEnd': moment().format(), 'hostingNow': null}});
    var durationOfStream = Math.floor(moment.duration(moment(moment().format()).diff(moment(hertsgg.recentStreamStart))).asHours()*3);
    await updateChannelStatsPostStream(hertsgg.hostingNow, collection, durationOfStream)
    await updateStreamerStatusPostStream(hertsgg.hostingNow, collection)
}

async function updateStreamerStatusPostStream(item, collection) {
    await collection.updateMany({twitchId: item.twitchId}, {'$set': {'streamingNow': false, 'streamMessage': null, 'hostingNow': null}});
}

function isHertsgg(channelId) {
    hertsggChannelId = '166854915'
    hertsggDevChannelId ='584968891'
    return (channelId === hertsggDevChannelId || channelId === hertsggChannelId)
}

function finishedStreaming(stream, streamingNow) {
    return (stream === null && streamingNow === true)
}

function goneLive(stream, streamingNow) {
    return (stream !== null && streamingNow === false)
}

// Does not delete message when stream team finishes streaming on hertsgg
async function checkHertsggLive(items, collection) {
    items.forEach(item => {
        twitch.streams.channel({ channelID: item.twitchChannelId }, async (err, res) => {
            if (err) console.error(err);
            else {
                if (goneLive(res.stream,item.streamingNow) && isHertsgg(item.twitchChannelId)) {
                    hertsgg = item
                    if (hertsgg.hostingNow === null) {
                        var streamTeamIsStreaming = await checkStreamTeamOnHertsgg(items, hertsgg, res.stream.channel.status, collection)
                        if (!streamTeamIsStreaming) 
                            setupHertsggStream(hertsgg,collection)
                    }
                } else if (finishedStreaming(res.stream,item.streamingNow) && isHertsgg(item.twitchChannelId)) {
                    hertsgg = item
                    if (hertsgg.hostingNow !== null) 
                        await updateHostedChannelStatsPostStream(hertsgg, collection)
                    else {
                        var durationOfStream = Math.floor(moment.duration(moment(moment().format()).diff(moment(hertsgg.recentStreamStart))).asHours());
                        await updateChannelStatsPostStream(hertsgg, collection, durationOfStream)
                    }
                    await deleteStreamAlert(hertsgg)
                    await updateStreamerStatusPostStream(hertsgg, collection)
                }
            }
        });
    });
}

async function checkStreamTeamLive(items, collection) {
    items.forEach(streamer => {
        twitch.streams.channel({ channelID: streamer.twitchChannelId }, async (err, res) => {
            if(err) {
                console.log(err);
            } else {
                if (goneLive(res.stream, streamer.streamingNow) && !isHertsgg(streamer.twitchChannelId)) {
                    let message = await bot.channels.get(process.env.streamDiscord).send(`${streamer.twitchId} has gone live! Check them out here: https://www.twitch.tv/${streamer.twitchId}`);
                    await checkResetStreamStreakTime(streamer,collection)
                    await updateChannelStatus(streamer, collection, message)
                } else if (finishedStreaming(res.stream, streamer.streamingNow) && !isHertsgg(streamer.twitchChannelId)) {
                    var durationOfStream = Math.floor(moment.duration(moment(moment().format()).diff(moment(streamer.recentStreamStart))).asHours());
                    await deleteStreamAlert(streamer)
                    await updateChannelStatsPostStream(streamer, collection, durationOfStream)
                    await updateStreamerStatusPostStream(streamer, collection)
                }
            }
        });
    });
}

/* 
* This method is used to check the status of our twitch streamers once every minute, this method is also used
* for connecting to our MongoDB database to track our streamer statistics.
*/
async function pollLive() {
    await MongoClient.connect(process.env.mongoAddress, {useNewUrlParser: true}, (err, client) => {
        setInterval (async function () {
            const db = client.db("hertsgg");
            const collection = db.collection("twitch-stats");
            collection.find().toArray(async (err, items) => {
                await checkHertsggLive(items, collection)
                await checkStreamTeamLive(items, collection)
            });
        }, 1 * 6000);
    });
}

bot.login(process.env.token);
pollLive();