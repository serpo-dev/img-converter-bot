import "./src/const.cjs"
import * as fs from "fs"
import { eventsObserver } from "./src/eventsObserver.js";
import { observeThreads } from "./src/threads.js";

const threadList = observeThreads();
eventsObserver(threadList);

if (!fs.existsSync(__dirname + "/../cache")) {
    fs.mkdirSync(__dirname + "/../cache");
}