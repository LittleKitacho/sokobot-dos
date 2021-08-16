# sokobot-dos

A reimagining of [Sokobot](https://github.com/PolyMarsDev/Sokobot) by
[PolyMars](https://www.youtube.com/channel/UCl7dSJloxuCa9IBFml7sakw), but with
Slash Commands, Buttons, and rewritten in TypeScript (because I have no clue
how Java works).

## What is Sokoban?

Sokoban is a classic puzzle game where you play as a **Sokoban** (the flushed
emoji).  Your objective is to move **boxes** (brown squares) onto
**destinations** (that one X in a green box emoji that makes zero sense for a
'no' sign).  You can move in the 4 cardinal directions, shown as buttons
below the game when using the bot.  The bot also has undo and reset funcitons,
helpful if you accidentally move a box up against a wall.

## Features

- Undo and Restart current level
- Infinite levels w/difficulty curve
- Message Buttons and Slash Commands
- Level Saving
- (TODO) Purchacable game themes and character icons

## How to host

Download the latest [release build](https://github.com/LittleKitacho/sokobot-dos/releases),
install Node.JS, then create a bot in the [Discord Developer Portal](https://discord.com/developers/applications)
and copy the token into a file named `token` (note: no file extension) in the
root directory of the bot.  Install the dependancies with `npm i --only=prod`
and start the bot with `npm start`.  You should see a lot of `Registering
command (command)`, which is normal.  The bot registers all unregistered
commands on startup.

A webserver is automatically opened at `localhost:8000` ([click here to go there](https://localhost:8000)),
which allows you to gracefully shut down, reload commands, and save the
databases.  This webserver is only avaliable to you, and anyone with your IP
that knows where to look.

## Planned features

- Full game saving
- Store
- Purchases
- Icons
- Themes
- Daily chalenges (?)
