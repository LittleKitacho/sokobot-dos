import Express from "express";
import { readFileSync } from "fs";
import { EventEmitter } from "stream";
import { Commands } from "./commands";
import { Logger } from "./debug";

const log = new Logger("IWS");
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
    res.write(renderRes("Saving databases..."));
    res.end();
    log.debug("Recieved database save request");
    internalEvent.emit("savedb");
});

app.get("/shutdown", (req, res) => {
    res.write(renderRes("Stopping bot..."));
    res.end();
    log.info("Recieved request to stop bot.");
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
    log.info(`Internal web server listening at ${HOST}:${PORT}`);
    process.on("exit", () => {
        log.info("Shutting down internal webserver...");
        server.removeAllListeners('close');
        server.on('close', () => {
            log.info("Internal webserver shut down.");
        });
        server.close();
    });
});

server.on('close', () => {
    log.warn("Internal webserver has shut down.");
});
