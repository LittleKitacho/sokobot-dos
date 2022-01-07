const ConfigKeys = [
    "TOKEN"
];

const config = require("dotenv").config();
if (config.error) {
    console.error("An error occoured while initializing Sokobot Dos!  Here's what happened:", config.error);
    process.exit();
} else {
    ConfigKeys.forEach(v => { if (process.env[v] === undefined) { console.error(`Config file was missing key term ${v}, halting!`); process.exit(); } });
}

require('./dist/main.js');
