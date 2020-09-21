# HousesBot

## Welcome to the Houses Bot

This is a simple bot made by Stefan Cooper to hold Houses scores 
for the esports society. This will be an interactive way for members
to check how many points their house has.

## Using the bot on discord

### Current implemented commands (21/09/2020)

`!verify @NAME to verify members ` <br />
`!ping` to check server latency to the bot <br />
`!purge [verified]` to remove all verified members <br />
`!alumni @NAME` to give a member the Society Alumni role <br />
`!addstreamer @NAME @TWITCHID` to add a streamer to our database to be tracked for stats <br />
`!checkmypoints` to check your current points earned as a streamer <br />

## Setting up .env

To set up this file you'll need to do a couple things.

Firstly, you'll need to create a bot online using discords application process,
once this is done copy and paste the App Token into the "token" section in the config.

For the second half of the config you'll need to create some roles and channels on discord for
the varying IDs needed including a "committee" role which should be used as an admin role. Make these
mentionable in the role permissions. Then get the role IDs by doing `\@ROLE` then copy the 
numbers specifically into the .env.

They should be organised like this in your `.env`

```
token=BLAHBLAHBLAH
prefix=!
committeeID=123456
serverID=123456
mongoAddress=BLAHBLAHurlBLAH
streamDiscord=123456
twitchClientId=123456
```


## Setting up node/dependencies for the bot

After cloning the repository into your own directory, you'll need to make 
sure you have installed node.js and have set up a discord bot online. You 
can find instructions on how to do this online. Once you have set up your 
config.json file with your bots' token and the correct role ids, navigate 
to the cloned directory and complete the following actions.

`npm install` <br />
`node bot.js`

Now if you have correctly installed everything then your bot should be up and 
running on the server you selected.
