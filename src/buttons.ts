import { MessageActionRow, MessageButton } from "discord.js";
import { Game, MoveDir } from "./game";

export enum Button {
    Up = "move_up",
    Down = "move_down",
    Left = "move_left",
    Right = "move_right",
    Undo = "undo",
    Restart = "restart",
    PlayAgain = "keep_playing",
    Stop = "stop_playing",
    Reset = "reset",
    ResetCancel = "rcancel"
}

export function getGameControls(game: Game): MessageActionRow[] {
    if (game.win()) {
        return[new MessageActionRow().addComponents([
            new MessageButton({
                label: "Continue",
                customId: Button.PlayAgain,
                style: "SUCCESS"
            }),
            new MessageButton({
                label: "Quit",
                customId: Button.Stop,
                style: "DANGER"
            })
        ])];
    }

    const directions = new MessageActionRow();
    const actions = new MessageActionRow();

    directions.addComponents([new MessageButton({
        customId: Button.Up,
        style: game.legalMove(MoveDir.Up) ? "PRIMARY" : "SECONDARY",
        disabled: !game.legalMove(MoveDir.Up),
        emoji: '⬆️'
    }), new MessageButton({
        customId: Button.Down,
        style: game.legalMove(MoveDir.Down) ? "PRIMARY" : "SECONDARY",
        disabled: !game.legalMove(MoveDir.Down),
        emoji: '⬇️'
    }), new MessageButton({
        customId: Button.Left,
        style: game.legalMove(MoveDir.Left) ? "PRIMARY" : "SECONDARY",
        disabled: !game.legalMove(MoveDir.Left),
        emoji: '⬅️'
    }), new MessageButton({
        customId: Button.Right,
        style: game.legalMove(MoveDir.Right) ? "PRIMARY" : "SECONDARY",
        disabled: !game.legalMove(MoveDir.Right),
        emoji: '➡️'
    })]);

    actions.addComponents([
        new MessageButton({
            label: "Undo",
            customId: Button.Undo,
            style: game.canUndo() ? "SUCCESS" : "SECONDARY",
            disabled: !game.canUndo(),
            emoji: '↩️'
        }), new MessageButton({
            label: "Restart",
            customId: Button.Restart,
            style: "SECONDARY",
            disabled: !game.canUndo(),
            emoji: '🔄'
        }), new MessageButton({
            label: "Stop",
            customId: Button.Stop,
            style: "DANGER",
            emoji: '⏹️'
        })
    ]);

    return [directions, actions];
}

export const ResetButtons = new MessageActionRow().addComponents(
    new MessageButton({
        label: "Reset my data.",
        customId: Button.Reset,
        style: "DANGER",
        emoji: "🗑️"
    }), new MessageButton({
        label: "Cancel",
        customId: Button.ResetCancel,
        style: "SECONDARY",
        emoji: "🚫"
    })
);
