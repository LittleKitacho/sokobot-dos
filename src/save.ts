import { Snowflake } from "discord.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { internalEvent } from "./ws";
import globalLog from "./debug";
import { Logger } from "winston";

const log = globalLog.child({ service: "database" });

enum DataType {
    Map
}
function DbReplacer(k,v) {
    if (v instanceof Map) {
        return {
            dataType: DataType.Map,
            value: Array.from(v.entries())
        };
    }
    return v;
}
function DbReviver(k,v) {
    if (typeof v === "object" && v !== null) {
        if (v.dataType == DataType.Map) {
            return new Map(v.value);
        }
    }
    return v;
}
type FilePath = string;
class Database<K, V> {
    protected file: FilePath;
    protected store: Map<K, V>;
    protected log: Logger;

    constructor(name: string) {
        this.file = "./".concat(name, ".json");
        this.log = log.child({ service: `db-${name}` });
        if (!existsSync(this.file)) {
            this.log.warn(`Database ${this.file} does not exist.  Writing blank database before continuing.`);
            writeFileSync(this.file, JSON.stringify(new Map(), DbReplacer));
        }
        try {
            this.store = JSON.parse(readFileSync(this.file, "utf-8"), DbReviver);
        } catch (e) {
            this.log.error(`Could not read file ${this.file}, continuing with blank database.`, e);
            this.store = JSON.parse(JSON.stringify(new Map(), DbReplacer), DbReviver);
        }
    }

    public has(key: K): boolean {
        return this.store.has(key);
    }
    public get(key: K): V {
        return this.store.get(key);
    }
    public set(key: K, value: V): Map<K,V> {
        return this.store.set(key, value);
    }
    public delete(key: K): boolean {
        return this.store.delete(key);
    }
    public forEach(callback: (value: V, key: K, map: Map<K,V>) => void) {
        this.store.forEach(callback);
    }
    public save(): void {
        try {
            writeFileSync(this.file, JSON.stringify(this.store, DbReplacer));
        } catch (e) {
            this.log.error(`An error occoured while saving database ${this.file}`, e);
            return;
        }
    }
}

export const UserLevelDb = new Database<Snowflake, number>("userlevel");
export const UserBankDb = new Database<Snowflake, number>("userbank");

function saveDatabases() {
    log.debug("Saving databases...");
    UserLevelDb.save();
    UserBankDb.save();
    log.verbose("Databases saved.");
}

process.on("exit", () => { log.info("Saving databases before shutdown..."); saveDatabases(); });

setInterval(saveDatabases, 300000);
internalEvent.on("savedb", saveDatabases);

