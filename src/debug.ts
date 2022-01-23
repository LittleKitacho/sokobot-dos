import { createLogger, Logger, format, transports, addColors } from "winston";

const levels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "blue",
        verbose: "cyan",
        debug: "green"
    }
};
addColors(levels.colors);

function getFileDate() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}

const isDevelopment = process.env.NODE_ENV === "development";
const isSilent = process.argv.includes("-s") || process.argv.includes("--silent");
const isVerbose = process.argv.includes("-v") || process.argv.includes("--verbose");
const onlyError = process.argv.includes("-e") || process.argv.includes("--only-error");
const noEmit = process.argv.includes("-E") || process.argv.includes("--no-emit");

const globalLog: Logger = createLogger({
    levels: levels.levels,
    defaultMeta: { service: "global" },
    format: format.combine(
        format.errors(),
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console({
            level: isDevelopment ? "debug" : ( isVerbose ? "verbose" : "info"),
            format: format.combine( format.colorize(), format.simple() ),
            silent: isSilent
        })
    ],
    exitOnError: true
});

if (!onlyError && !noEmit) globalLog.add( new transports.File({
    level: "verbose",
    filename: `logs/full-${getFileDate()}.log`
}));

if (!noEmit) globalLog.add( new transports.File({
    level: "warn",
    filename: `logs/error-${getFileDate()}.log`,
    handleExceptions: true,
    handleRejections: true,
}));

export default globalLog;
