import * as dotenv from "dotenv"
import { parentPort } from "node:worker_threads"

dotenv.config()

class Message {
    static get start() {
        return 'Hello! This bot was created for converting images (png to jpg, png to bmp, etc.). Now it supports these formats:\n- png;\n- jpg;\n -bmp;\n\n[Creator: Sergey Potapov](https://github.com/yphwd)\n\nAttach an image as a document and send a message with the text of the interesting format (for example "png / jpg / bmp") to get started.'
    }

    static get convert() {
        return 'Your image added to the queue successfully. Please wait...'
    }

    static get unknown() {
        return 'Sorry, I didn\'t understand that command. Try again.'
    }


}

class Command {
    METHOD_NAME = "sendMessage"
    URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${this.METHOD_NAME}`
    RESPONSE_DELAY = process.env.RESPONSE_DELAY

    async #request(data) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(data)
        }
        const response = await fetch(this.URL, options);
        if (response.status === 200) {
            return true;
        } else throw new Error(`The request has failed with status ${response.status}`)
    }

    async run(entity, converter) {
        try {
            const message = entity.message || entity.edited_message;
            const { chat, text, caption } = message;
            switch (text) {
                case "/start":
                    return await this.#request({
                        chat_id: chat.id,
                        text: Message.start
                    })
                case "png" || "jpg" || "bmp" || "/png" || "/jpg" || "/bmp":
                    return await this.#request({
                        chat_id: chat.id,
                        text: Message.convert
                    })
                default:
                    return await this.#request({
                        chat_id: chat.id,
                        text: Message.unknown
                    })
            }
        } catch (error) {
            if (error.message.length < 200) {
                // console.error(error.message, entity)
            } else {
                console.error("Error happened in Command.run() method")
            }
        }
    }
}



parentPort.on("message", sendMessages)

async function sendMessages(message) {
    const command = new Command();

    setTimeout(async () => {
        if (message !== "none") {
            const isSuccess = await command.run(message);
            if (isSuccess) parentPort.postMessage("success");
            else parentPort.postMessage("error");
        } else {
            parentPort.postMessage("pending");
        }
    }, command.RESPONSE_DELAY)
}