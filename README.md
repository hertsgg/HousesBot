# HousesBot

## Welcome to the Houses Bot

This is a simple bot made by Stefan Cooper to hold Houses scores 
for the esports society. This will be an interactive way for members
to check how many points their house has.

## Using the bot on discord

### Current implemented commands (12/02/19)

`!verify @NAME [nohouse]` to verify members (use the argument `nohouse` if you specifically don't want this member to be set a house <br />
`!add HOUSE SCORETOBEADDED` to add points to a house <br />
`!leaderboard` to check the leaderboard of the houses <br />
`!ping` to check server latency to the bot <br />
`!purge [verified][houses]` to remove all verified members or all members of houses <br />
`!shuffle` to shuffle all members into randomly assigned houses <br />

## Setting up config.json

To set up this file you'll need to do a couple things.

Firstly, you'll need to create a bot online using discords application process,
once this is done copy and paste the App Token into the "token" section in the config.

For the second half of the config you'll need to create some roles on discord for 
holding scores and a "committee" role which should be used as an admin role. Make these
mentionable in the role permissions. Then get the role IDs by doing `\@ROLE` then copy the 
numbers specifically into the config.json.


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
