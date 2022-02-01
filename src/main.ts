import { Client, Intents, Interaction, Message, MessageEmbed, Snowflake } from "discord.js";
import { promisify } from "util";
import { Button, getGameControls, ResetButtons } from "./buttons";
import { Commands, CommandData } from "./commands";
import { Game, MoveDir } from "./game";
import { internalEvent } from "./ws";
import globalLog from "./debug";
import { InfoEmbed } from "./embeds";
import { UserBankDb, UserLevelDb } from "./save";

const wait = promisify(setTimeout);

const log = globalLog.child({ service: "main" });
const bot = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ] });
const games: Map<Snowflake, Game> = new Map();

bot.on("ready", async () => {
    log.verbose("Logged in, performing command sanity check...");
    await bot.user.setPresence({ status: "dnd", activities: [{ name: "Starting up...", type: "PLAYING" }] });
    await bot.application.commands.fetch();
    const registeredCommands = [];
    await bot.guilds.fetch();
    await bot.guilds.cache.forEach(async g => {
        await g.commands.fetch();
        await g.commands.cache.forEach(async c => {
            log.debug(`Deleting extranious command ${c.name}`);
            await c.delete();
        });
    });
    await bot.application.commands.fetch();
    await bot.application.commands.cache.forEach(async (command) => {
        if (!Object.values(Commands).includes(command.name as Commands)) {
            log.debug(`Extra command '${command.name}' discarded.`);
            await command.delete();
        } else {
            registeredCommands.push(command.name);
        }
    });
    for (const name in CommandData) {
        if (!registeredCommands.includes(name)) {
            log.debug(`Registering command '${name}'`);
            await bot.application.commands.create(CommandData[name]);
        }
    }
    log.verbose("All commands registered.");
    await bot.user.setPresence({ status: "online", activities: [{ name: `a round of Sokoban | /info`, type: "PLAYING" }] });
    log.info("Logged in and commands ready!");
});

bot.on('interactionCreate', async interaction => {
    if (!interaction.inGuild()) {
        return;
    }
    if (interaction.isCommand()) {
        switch (interaction.commandName) {
            case Commands.Ping: {
                const heartbeat = Date.now() - interaction.createdTimestamp;
                log.debug(`Heartbeat ${heartbeat.toString()}`);
                await interaction.reply(`:ping_pong: Pong!\nHeartbeat: **${heartbeat.toString()}**ms`);
                break;
            }

            case Commands.Info: 
                await interaction.reply({ embeds: [InfoEmbed] });
                break;

            case Commands.Reset:
                await interaction.reply({ content: ":bangbang: **Hey!  You are about to delete all your data!** This includes:\n- Current Level\n- All coins in your bank\n- Purchaced themes\n- Purchaced icons\n**Press 'Reset all my data.' to confirm deleting your data.  Otherwise, press 'Cancel'", components: [ResetButtons], ephemeral: true });
                return;

            case Commands.Bank: {
                if (!UserBankDb.has(interaction.user.id)) UserBankDb.set(interaction.user.id, 0);
                const bank = UserBankDb.get(interaction.user.id);
                const embed = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.avatarURL())
                    .setTitle("Bank")
                    .setDescription("Keep playing Sokoban to get more coins, soon you can use them to purchase items!")
                    .setColor("#54adef")
                    .addField("Current total:", `:coin: ${bank}`);
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case Commands.Play: {
                if (games.has(interaction.user.id)) {
                    const game = games.get(interaction.user.id);
                    deleteExistingMessage(game);
                    const message = await interaction.reply({ components: getGameControls(game), embeds: getGameEmbed(interaction, game), fetchReply: true });
                    game.setMessage(message as Message);
                    games.set(interaction.user.id, game);
                } else {
                    if (!UserLevelDb.has(interaction.user.id)) UserLevelDb.set(interaction.user.id, 1);
                    const game = new Game(interaction.user.id, UserLevelDb.get(interaction.user.id));
                    const message = await interaction.reply({ components: getGameControls(game), embeds: getGameEmbed(interaction, game), fetchReply: true });
                    game.setMessage(message as Message);
                    games.set(interaction.user.id, game);
                }
                break;
            }

            case Commands.Stop: {
                if (!games.has(interaction.user.id)) {
                    await interaction.reply({ content: "You are not playing a game!  Start a game with `/play`.", ephemeral: true });
                    return;
                }
                await interaction.deferReply({ ephemeral: true });
                const game = games.get(interaction.user.id);
                deleteExistingMessage(game);
                games.delete(interaction.user.id);
                await interaction.editReply({ content: "Current game stopped.  Start a new game with `/play`." });
                return;
            }
        }
    } else if (interaction.isButton()) {
        switch (interaction.customId) {
            case Button.Reset:
                UserLevelDb.delete(interaction.user.id);
                UserBankDb.delete(interaction.user.id);
                log.debug(`Deleted data for user ${interaction.user.id}`);
                await interaction.update({ content: "All your content has been deleted.", components: [] });
                return;
            case Button.ResetCancel: {
                await interaction.update({ content: "Data reset canceled.", components: [] });
                return;
            }
        }
        if (!games.has(interaction.user.id)) {
            await interaction.reply({ content: "Either that's not your game, or an error has occurred internally.  Please try again later or start a new game with `/play`.", ephemeral: true });
            return;
        }
        const game = games.get(interaction.user.id);
        if (interaction.message.id != game.message) {
            await interaction.reply({ content: "That is not your game.  Start your own game with `/play`.", ephemeral: true });
            return;
        }
        switch (interaction.customId) {
            case Button.Up:
                game.move(MoveDir.Up);
                break;
            case Button.Down:
                game.move(MoveDir.Down);
                break;
            case Button.Left:
                game.move(MoveDir.Left);
                break;
            case Button.Right:
                game.move(MoveDir.Right);
                break;
            case Button.Restart:
                game.back(true);
                break;
            case Button.Undo:
                game.back(false);
                break;
            case Button.PlayAgain:
                game.newGame();
                break;
            case Button.Stop:
                games.delete(interaction.user.id);
                await interaction.update({ content: "Thanks for playing!  You can start a new game with `/play`.", components: [], embeds: [] });
                await wait(3000);
                await interaction.deleteReply();
                return;
        }
        games.set(interaction.user.id, game);
        if (UserLevelDb.get(interaction.user.id) !== game.level) UserLevelDb.set(interaction.user.id, game.level);
        if (game.win()) {
            if (!UserBankDb.has(interaction.user.id)) UserBankDb.set(interaction.user.id, 0);
            const coins = UserBankDb.get(interaction.user.id);
            UserBankDb.set(interaction.user.id, coins + 5 + (game.level * 5));
        }
        await interaction.update({ embeds: getGameEmbed(interaction, game), components: getGameControls(game)});
    }
});

internalEvent.on("reload", (command) => {
    if (!bot.isReady()) { return; }
    bot.application.commands.cache.forEach(async rcommand => {
        if (rcommand.name == command) {
            await bot.application.commands.edit(rcommand.id, CommandData[command]);
            log.verbose(`Reloaded command ${command}`);
        }
    });
});

function getGameEmbed(interaction: Interaction, game: Game): MessageEmbed[] {
    const embed = new MessageEmbed()
        .setTitle(game.win() ? "You win!" : `Level ${game.level}`)
        .setDescription(game.render())
        .setColor(game.win() ? "#3ba55d" : game.getHexColor())
        .setFooter("Based off of Sokobot by PolyMars")
        .setAuthor(interaction.user.username, interaction.user.avatarURL());
    if (game.win()) {
        embed.addField("You won, congratulations!", "Press Continue to keep playing, or Stop to stop playing.  Your current level is saved after each level.");
        embed.addField(`Coins gained: :coin: ${5 + (game.level * 5)}`, `Total coins: :coin: ${UserBankDb.get(interaction.user.id)}`);
    }
    return [embed];
}

async function deleteExistingMessage(game: Game) {
    await bot.guilds.fetch();
    const guild = bot.guilds.resolve(game.guild);
    if (guild) {
        await guild.channels.fetch();
        const channel = guild.channels.resolve(game.channel);
        if (channel) {
            if (channel.isText()) {
                await channel.messages.fetch();
                const message = channel.messages.resolve(game.message);
                if (message) {
                    if (message.deletable) {
                        await message.delete();
                    }
                }
            }
        }
    }
}

setInterval(async () => {
    await bot.user.setActivity({ name: `a round of Sokoban | /info`, type: "PLAYING" });
}, 300000);

bot.login(process.env.TOKEN).catch(error => {log.error("Could not log in.", error); process.exit(); });

process.on("exit", () => {
    bot.user.setStatus("invisible");
});

const createExitHandler = (signal) => { return () => { log.debug(`Handling terminate signal ${signal}`); process.exit(); }; };
process.on("SIGTERM", createExitHandler("SIGTERM"));
process.on("SIGINT", createExitHandler("SIGINT"));
process.on("SIGKILL", createExitHandler("SIGKILL"));
process.on("SIGUSR1", createExitHandler("SIGUSR1"));
process.on("SIGUSR2", createExitHandler("SIGUSR2"));
