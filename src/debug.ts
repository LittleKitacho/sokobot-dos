import { appendFileSync } from "fs";

enum MessageType {
    Info = "INFO",
    Success = "SUCCESS",
    Warning = "WARN",
    Error = "ERROR"
}

export class Logger {
    private module: string;

    constructor (module: string) {
        this.module = module.toUpperCase();
    }

    private logMessage(type: MessageType, ...args: unknown[]): string {
        const message =  `[${this.module}: ${new Date().toISOString()}] ${type}: ${args.join(" ")}`;
        try {
            appendFileSync(LogFile, `\n${message}`);
        } catch (e) {
            console.error("Could not write to log file!");
        }
        return message;
    }

    public createSubModule(submodule: string): Logger {
        return new Logger(this.module.concat("/", submodule));
    }

    public info(...args: unknown[]): void { console.log(this.logMessage(MessageType.Info, args)); }
    public success(...args: unknown[]): void { console.log(this.logMessage(MessageType.Success, args)); }
    public warn(...args: unknown[]): void { console.warn(this.logMessage(MessageType.Warning, args)); }
    public error(...args: unknown[]): void { console.error(this.logMessage(MessageType.Error, args)); }
}

const LogFile = "./log";
