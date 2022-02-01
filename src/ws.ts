import Express from "express";
import { readFileSync } from "fs";
import { EventEmitter } from "stream";
import { Commands } from "./commands";
import globalLog from "./debug";

const log = globalLog.child({ service: "webserver" });
const BasePage = readFileSync("./public/base.html", "utf-8");
const IndexPage = readFileSync("./public/index.html", "utf-8");

const HOST = "localhost";
const PORT = process.env.PORT ? process.env.PORT : 8000;

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
    res.send(IndexPage);
});

app.get('/save', (req, res) => {
    log.debug("Recieved database save request");
    res.send(renderRes("Saving databases..."));
    internalEvent.emit("savedb");
});

app.get("/shutdown", (req, res) => {
    log.verbose("Recieved request to stop bot.");
    res.send(renderRes("Stopping bot..."));
    process.exit(0);
});

app.get("/reload/:command", (req, res) => {
    for (const command in Commands) {
        if (req.params.command.toLowerCase() == command.toLowerCase()) {
            res.send(renderRes(`Reloading command ${command}...`));
            internalEvent.emit("reload", Commands[command]);
            return;
        }
    }
    res.send(renderRes(`Could not find command ${req.params.command}.`));
});

//// FIXME logging rewrite breaks viewing log from webserver
// app.get("/log", (req, res) => {
//     try {
//         const log = globalLog.read();
//         res.send(renderRes(log.replace("\n","<br>")));
//     } catch (e) {
//         res.send(renderRes(`Could not retrieve log file:<br>${e}`));
//     }
// });

app.get("*", (req, res) => {
    res.status(404);
    res.send(renderRes("Not found!"));
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
    log.warn("Internal webserver has shut down unexpectedly!");
});
