import { MessageEmbedOptions } from "discord.js";

export const InfoEmbed: MessageEmbedOptions = {
    title: "About Sokobot Dos",
    description: "Sokobot Dos is a Discord bot based on the original [Sokobot](https://github.com/PolyMarsDev/Sokobot) by [PolyMars](https://www.youtube.com/channel/UCl7dSJloxuCa9IBFml7sakw), but reimagined by LittleKitacho.",
    fields: [{
        name: "What is Sokoban?",
        value: "Sokoban is a puzzle game where you are a **Sokoban** :flushed:, and your goal is to move **boxes** :brown_square: to their **destinations** :negative_squared_cross_mark:."
    }, {
        name: "How to play",
        value: "Start a game with `/play`, and then you can move yourself around by pressing the **directional buttons** (:arrow_up:, :arrow_down:, :arrow_left:, :arrow_right:) below your game.  If you need to, you can **Undo** :leftwards_arrow_with_hook:, **Restart** :arrows_counterclockwise:, and **Stop** :stop_button: your game at any time."
    }, {
        name: "How do I get different themes and icons?",
        value: "Earn **coins** :coin: by playing Sokoban.  You earn 5 coins, plus an additional 5 per level after you complete a level.  Then, you can check your coin total with `/bank`, and coming soon you can purchase things with those coins."
    }, {
        name: "Roadmap:",
        value: "Check out the [GitHub repository](https://github.com/LittleKitacho/sokobot-dos) for planned features."
    }],
    color: "#54adef",
    thumbnail: {
        url: "https://littlekitacho.github.io/sokobot-dos/icon.png"
    },
    footer: {
        text: "Based on Sokobot by Polymars - v1.0.1"
    }
};
