export enum Commands {
    Ping = "ping",
    Info = "info",
    Play = "play",
    Stop = "stop",
    Reset = "reset",
    Bank = "bank",
}

export const CommandData = {
    [Commands.Ping]: {
        name: Commands.Ping,
        description: "Ping the bot"
    },
    [Commands.Info]: {
        name: Commands.Info,
        description: "Information about Sokobot Dos"
    },
    [Commands.Play]: {
        name: Commands.Play,
        description: "Start playing a game of Sokoban",
    },
    [Commands.Stop]: {
        name: Commands.Stop,
        description: "Stop your current game of Sokoban."
    },
    [Commands.Reset]: {
        name: Commands.Reset,
        description: "Reset your level, bank, or purchaces.  This action is irreversable."
    },
    [Commands.Bank]: {
        name: Commands.Bank,
        description: "See how many coins you've accumulated."
    }
};
