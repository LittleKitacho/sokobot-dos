import { ColorResolvable, Message, Snowflake } from "discord.js";

export class Game {
    public user: Snowflake;
    public message: Snowflake;
    public channel: Snowflake;
    public guild: Snowflake;
    public score: number;
    public level: number;

    protected player: Player;
    protected grid: Grid;
    protected color: ColorIndex;
    protected height: number;
    protected width: number;
    protected gridHistory: Tile[][][];
    protected playerHistory: Point[];

    constructor(user: Snowflake, level: number) {
        this.height = 5;
        this.width = 8;
        this.level = level;
        this.score = 0;
        this.player = new Player(this.height, this.width);
        this.playerHistory = [];
        for (let i = 1; i < this.level; i++) this.expandGrid();
        this.grid = new Grid(this.height, this.width, this.level, this.player.pos);
        this.gridHistory = [];
        this.user = user;
        this.color = randomColor();
    }

    protected expandGrid(): void {
        if (this.height < 7) {
            this.height += 1;
        }
        if (this.width < 12) {
            this.width += 2;
        }
    }

    public setMessage(message: Message): void {
        this.message = message.id;
        this.channel = message.channelId;
        this.guild = message.guildId;
    }

    public newGame(): void {
        this.expandGrid();
        this.level++;
        this.player = new Player(this.height, this.width);
        this.playerHistory = [];
        this.grid = new Grid(this.height, this.width, this.level, this.player.pos);
        this.gridHistory = [];
        this.color = randomColor();
    }

    public back(restart: boolean): void {
        if (restart) {
            this.grid.fromClone(this.gridHistory.shift());
            this.gridHistory = [];
            this.player.pos = this.playerHistory.shift();
            this.playerHistory = [];
        } else {
            this.grid.fromClone(this.gridHistory.pop());
            this.player.pos = this.playerHistory.pop();
        }
    }

    public canUndo(): boolean {
        return this.gridHistory.length > 0 && this.playerHistory.length > 0;
    }

    public render(): string {
        let text = "";
        for (let i = 0; i <= this.width + 2; i++) {
            text = text.concat(this.color);
        }
        text = text.concat("\n");
        for (let y = 0; y <= this.height; y++) {
            text = text.concat(this.color);
            for (let x = 0; x <= this.width; x++) {
                if (this.player.pos.x == x && this.player.pos.y == y) {
                    text = text.concat(this.player.icon);
                } else {
                    switch (this.grid.tile({x: x, y: y}).state) {
                        case TileState.Empty:
                            text = text.concat(":black_large_square:");
                            break;
                        case TileState.Box:
                            text = text.concat(":brown_square:");
                            break;
                        case TileState.Space:
                            text = text.concat(":negative_squared_cross_mark:");
                            break;
                        case TileState.Wall:
                            text = text.concat(this.color);
                            break;
                    }
                }
            }
            text = text.concat(this.color + "\n");
        }
        for (let i = 0; i <= this.width + 2; i++) {
            text = text.concat(this.color);
        }
        return text;
    }

    public getHexColor(): ColorResolvable {
        switch (this.color) {
            case ColorIndex.Red: return "#de2a43";
            case ColorIndex.Orange: return "#f59105";
            case ColorIndex.Yellow: return "#fdcc56";
            case ColorIndex.Green: return "#7ab259";
            case ColorIndex.Blue: return "#54adef";
            case ColorIndex.Purple: return "#ab8fd7";
            case ColorIndex.White: return "#ffffff";
        }
    }

    public move(dir: MoveDir): string {
        if (!this.legalMove(dir)) return;
        this.gridHistory.push(this.grid.clone());
        this.playerHistory.push(this.player.pos);
        const pos = this.getNewPos(this.player.pos, dir);
        if (this.grid.tile(pos).state == TileState.Box) {
            const boxPos = this.getNewPos(pos, dir);
            if (this.grid.tile(boxPos).state == TileState.Space) {
                this.grid.set(boxPos, TileState.Wall);
                this.grid.set(pos, TileState.Empty);
                this.score += 10 * this.level;
            } else {
                this.grid.set(boxPos, TileState.Box);
                this.grid.set(pos, TileState.Empty);
            }
        }
        this.player.pos = pos;
    }

    public getNewPos(pos: Point, dir: MoveDir): Point {
        const newPos: Point = {
            x: pos.x,
            y: pos.y
        };
        switch (dir) {
            case MoveDir.Up: newPos.y--; break;
            case MoveDir.Down: newPos.y++; break;
            case MoveDir.Left: newPos.x--; break;
            case MoveDir.Right: newPos.x++; break;
        }
        return newPos;
    }

    public legalMove(dir: MoveDir): boolean {
        const newPlayer = this.getNewPos(this.player.pos, dir); // new player position
        if (!this.legalPos(newPlayer)) return false;
        if (this.grid.tile(newPlayer).state == TileState.Box) { // if box is occupying new player position
            const newBox = this.getNewPos(newPlayer, dir); // get new box position
            // if new box position is in bounds and is either empty or a space
            if (!this.legalPos(newBox)) return false;
            return this.grid.tile(newBox).state == TileState.Empty || this.grid.tile(newBox).state == TileState.Space;
        } else return this.grid.tile(newPlayer).state != TileState.Wall; // make sure tile isn't a wall and in bounds.
    }

    public legalPos(pos: Point): boolean {
        if (pos.x < 0 || pos.y < 0) return false;
        if (pos.x > this.width || pos.y > this.height) return false;
        return true;
    }

    public win(): boolean {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid.tile({x: x, y: y}).state == TileState.Box) return false;
                if (this.grid.tile({x: x, y: y}).state == TileState.Space) return false;
            }
        }
        return true;
    }
}

class Grid {
    private tiles: Tile[][];

    constructor(height: number, width: number, boxCount: number, player: Point) {
        this.tiles = [];
        // grid setup
        for (let y = 0; y <= height; y++) {
            const row: Tile[] = [];
            for (let x = 0; x <= width; x++) {
                row.push({
                    x: x,
                    y: y,
                    state: TileState.Empty
                });
            }
            this.tiles.push(row);
        }
        // box and space placing
        for (let i = 0; i < boxCount; i++) {
            let pos;
            do {
                pos = this.getRandomSpace(width, height);
            } while (this.tile(Object.assign({}, pos)).state != TileState.Empty || player == pos || !this.emptySurrounding(Object.assign({}, pos), player));
            this.set(pos, TileState.Box);
            do {
                pos = this.getRandomSpace(width, height);
            } while (this.tile(Object.assign({}, pos)).state != TileState.Empty || player == pos || !this.emptySurrounding(Object.assign({}, pos), player));
            this.set(pos, TileState.Space);
        }
    }

    private getRandomSpace(w: number, h: number): Point {
        return {
            x: Math.ceil((Math.random() * (w -2)) + 1),
            y: Math.ceil((Math.random() * (h -2)) + 1)
        };
    }

    private emptySurrounding(pos: Point, player: Point): boolean {
        const n: Point = {
            x: pos.x,
            y: pos.y -1,
        }, ne: Point = {
            x: pos.x -1,
            y: pos.y -1,
        }, e: Point = {
            x: pos.x -1,
            y: pos.y
        }, se: Point = {
            x: pos.x -1,
            y: pos.y +1
        }, s: Point = {
            x: pos.x,
            y: pos.y +1
        }, sw: Point = {
            x: pos.x +1,
            y: pos.y +1
        }, w: Point = {
            x: pos.x +1,
            y: pos.y
        }, nw: Point = {
            x: pos.x +1,
            y: pos.y -1
        };
        if (this.tile(n).state != TileState.Empty) return false;
        if (this.tile(ne).state != TileState.Empty) return false;
        if (this.tile(e).state != TileState.Empty) return false;
        if (this.tile(se).state != TileState.Empty) return false;
        if (this.tile(s).state != TileState.Empty) return false;
        if (this.tile(sw).state != TileState.Empty) return false;
        if (this.tile(w).state != TileState.Empty) return false;
        if (this.tile(nw).state != TileState.Empty) return false;
        if (n == player) return false;
        if (ne == player) return false;
        if (e == player) return false;
        if (se == player) return false;
        if (s == player) return false;
        if (sw == player) return false;
        if (w == player) return false;
        if (nw == player) return false;
        return true;
    }

    public clone(): Tile[][] {
        const returnTiles = [];
        this.tiles.forEach(val => {
            const row = [];
            val.forEach(val2 => row.push(Object.assign([], val2)));
            returnTiles.push(row);
        });
        return returnTiles;
    }
    public fromClone(tiles: Tile[][]): void {
        this.tiles = tiles;
    }
    
    public tile(pos: Point): Tile {
        return this.tiles[pos.y][pos.x];
    }

    public set(pos: Point, state: TileState): void {
        this.tiles[pos.y][pos.x].state = state;
    }
}

class Player {
    icon: string;
    pos: Point;

    constructor(height: number, width: number) {
        this.pos = {
            x: Math.floor(width / 2),
            y: Math.floor(height / 2)
        };
        this.icon = ":flushed:";
    }
}

enum ColorIndex {
    Red = ":red_square:",
    Orange = ":orange_square:",
    Yellow = ":yellow_square:",
    Green = ":green_square:",
    Blue = ":blue_square:",
    Purple = ":purple_square:",
    White = ":white_large_square:"
}

function randomColor(): ColorIndex {
    return getColor(Math.ceil(Math.random() * 7));
}

function getColor(i: number): ColorIndex {
    switch (i) {
        case 1: return ColorIndex.Red;
        case 2: return ColorIndex.Orange;
        case 3: return ColorIndex.Yellow;
        case 4: return ColorIndex.Green;
        case 5: return ColorIndex.Blue;
        case 6: return ColorIndex.Purple;
        case 7: return ColorIndex.White;
    }
}

enum TileState {
    Empty,
    Wall,
    Box,
    Space
}

export enum MoveDir {
    Up,
    Down,
    Left,
    Right
}

interface Point {
    x: number,
    y: number
}

interface Tile extends Point {
    state: TileState
}
