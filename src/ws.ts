import Express from "express";
import { readFileSync } from "fs";
import { EventEmitter } from "stream";
import { Commands } from "./commands";
import { Logger } from "./debug";

const Debug = new Logger("IWS");
const BasePage = readFileSync("./public/base.html", "utf-8");
const IndexPage = readFileSync("./public/index.html", "utf-8");

const HOST = "localhost";
const PORT = 8000;

export declare interface InternalWsEvents extends EventEmitter {
    on(event: 'reload', listener: (command: Commands) => void);
    on(event: 'savedb', listener: () => void);

    emit(event: 'reload', command: Commands);
    emit(event: 'savedb');
}
export const internalEvent: InternalWsEvents = new EventEmitter();

function renderRes(message: string) {
    return BasePage.replace("<!--BODY-->", message);
}

const app = Express();

app.get("/", (req, res) => {
    res.write(IndexPage);
    res.end();
});

app.get('/save', (req, res) => {
    Debug.info("Recieved database save request");
    res.write(renderRes("Saving databases..."));
    res.end();
    internalEvent.emit("savedb");
});

app.get("/shutdown", (req, res) => {
    Debug.info("Recieved request to stop bot.");
    res.write(renderRes("Stopping bot..."));
    res.end();
    process.exit(0);
});

app.get("/reload/:command", (req, res) => {
    for (const command in Commands) {
        if (req.params.command.toLowerCase() == command.toLowerCase()) {
            res.write(renderRes(`Reloading command ${command}...`));
            res.end();
            internalEvent.emit("reload", Commands[command]);
            return;
        }
    }
    res.write(renderRes(`Could not find command ${req.params.command}.`));
    res.end();
});

app.get("/log", (req, res) => {
    try {
        const log = readFileSync("./log", "utf-8");
        res.write(renderRes(log.split("\n").join("<br>")));
        res.end();
    } catch (e) {
        res.write(renderRes(`Could not retrieve log file: ${e}`));
        res.end();
    }
});

app.get("*", (req, res) => {
    res.status(404);
    res.write(renderRes("Not found!"));
});

const server = app.listen(8000, () => {
    Debug.info(`Internal web server listening at ${HOST}:${PORT}`);
    process.on("exit", () => {
        Debug.info("Shutting down internal webserver...");
        server.removeAllListeners('close');
        server.on('close', () => {
            Debug.info("Internal webserver shut down.");
        });
        server.close();
    });
});

server.on('close', () => {
    Debug.warn("Internal webserver has shut down.");
});
