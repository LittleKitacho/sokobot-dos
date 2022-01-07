# sokobot-dos

A reimagining of [Sokobot](https://github.com/PolyMarsDev/Sokobot) by
[PolyMars](https://www.youtube.com/channel/UCl7dSJloxuCa9IBFml7sakw), but with
Slash Commands, Buttons, and rewritten in TypeScript (because I have no clue how
Java works).

## What is Sokoban?

Sokoban is a classic puzzle game where you play as a **Sokoban** (😳). Your
objective is to move **boxes** (🟫) onto **destinations** (❎). You can move in
the 4 cardinal directions, shown as buttons (⬅️, ➡️, ⬆️, ⬇️) below the game when
using the bot. The bot also has undo (↩️) and reset (🔁) functions, which are
helpful if you accidentally move a box up against a wall.

## Features

- Undo and Restart current level
- Infinite levels
- Message Buttons and Slash Commands
- Level saving

## Features coming Soon™️

- Continue your last game
- Daily Challenges
- Purchasable game themes and character icons
- Tournaments - compete for fastest times and lowest moves among other Sokobot
Dos players

## How to host

Step-by-step instructions:

1. Install Node.JS and NPM from the [Node.JS website](https://nodejs.org/)
2. Download the latest
[release build](https://github.com/LittleKitacho/sokobot-dos/releases) from the
GitHub page.
3. Install dependencies with `npm i --only=prod`
4. Go to the
[Discord Developer Portal](https://discord.com/developers/applications) and
create an application.
5. Go to the bot tab, and click the `Add Bot User` button.
6. Click `Yes, do it!`
7. Copy the token and save it for later.
8. Create a file called `.env` in the bot’s folder.
9. Paste this into the file: `TOKEN=XXX`, where `XXX` represents the token you
copied earlier.
10. Set up any other [config options](about:blank#config-options) you wish
11. Start the bot with `npm start`

Sokobot Dos should be running on your computer now. Keep reading for other
options for running the bot, and how to use the internal webserver.

### Config Options

All config options go in the format of `(key)=(value)`, with one option on each
line of the file.

- `TOKEN` - *Required* Bot token.
- `PORT` - *Optional* Port for the internal web-server to open at (defaults to `8000`)
- `NODE_ENV` - *Optional* Environment to run the bot in (either `production` for
everyday use or `development` for development purposes). Also applies to NPM.

### Internal Webserver

The internal web server is located at `http://localhost:XXXX`, where `XXXX`
represents either the port specified in your
[config file](about:blank#config-options) or `8000`, if not specified.

The webserver is simple, with little styling, and includes a few features,
listed below:

- Manually saving databases
- Viewing log file
- Reloading a command
- Shutting down the bot

There are some additional features planned for the dashboard, but those will
come at a later time.
