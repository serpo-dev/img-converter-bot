import { parentPort } from "node:worker_threads"
import * as dotenv from "dotenv";

class Updates {
    constructor(last_id) {
        this.last_id = last_id;
    }

    async #request() {
        try {
            return new Promise(async resolve => {
                const url = new URL(REQ_URL)
                const params = {
                    allowed_updates: ["message"]
                }
                for (let p in params) {
                    url.searchParams.append(p, params[p])
                }
                const { result } = await fetch(url, { method: "GET" }).then(response => response.json())

                resolve(result)
            })
        } catch (error) {
            return new Error("Something went wrong while fetching updates", error)
        }
    }

    #synchronize(new_queue) {
        try {
            while (0 < new_queue.length) {
                if (new_queue.length > 0) {
                    const cur_message = new_queue[0].message || new_queue[0].edited_message
                    const cur_id = cur_message.message_id

                    if (cur_id <= this.last_id) {
                        new_queue.shift()
                    } else break;
                } else break;
            }
            return new_queue;
        } catch (error) {
            throw new Error("Something went wrong while comparing old and new arrays or pushing new entities to the old array: Error message: " + error.message)
        }
    }

    async get(queue) {
        try {
            this.queue = queue;
            const new_queue = await this.#request()
            const newEntities = await this.#synchronize(new_queue)
            parentPort.postMessage({ new_messages: newEntities, last_id_saved: this.last_id })
        } catch (error) {
            console.error(error.message)
        }
    }
}



dotenv.config()
const METHOD_NAME = "getUpdates"
const REQ_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${METHOD_NAME}`
const GET_UPDATES_DELAY = process.env.GET_UPDATES_DELAY


parentPort.on("message", getUpdates)


async function getUpdates({ messages, last_id }) {
    setTimeout(async () => {
        const updates = new Updates(last_id);
        await updates.get(messages);
    }, GET_UPDATES_DELAY)
}

