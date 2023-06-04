import { Worker } from "node:worker_threads"

const getUpdates = new Worker("./src/bot/getUpdates.js")
const sendMessages = new Worker("./src/bot/sendMessages.js")
const converter = new Worker("./src/converter/converter.js")

export const observeThreads = () => ({ getUpdates, sendMessages, converter });


