import { eventsObserver } from "./src/eventsObserver.js";
import { observeThreads } from "./src/threads.js";

const threadList = observeThreads();
eventsObserver(threadList);