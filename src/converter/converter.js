import { parentPort } from "node:worker_threads"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"
import "../const.cjs"

dotenv.config()

parentPort.on("message", converter);

async function converter(message) {
    const CONVERTER_CHECK_QUEUE_DELAY = process.env.CONVERTER_CHECK_QUEUE_DELAY

    setTimeout(async () => {
        if (message !== "none") {
            const isSuccess = await convert(message);
            if (isSuccess) parentPort.postMessage("success");
            else parentPort.postMessage("error");
        } else {
            parentPort.postMessage("pending");
        }
    }, CONVERTER_CHECK_QUEUE_DELAY)

    async function convert(message) {
        try {
            const file_id = message.photo.pop().file_id;

            const GET_FILE_METHOD = "getFile"
            const GET_FILE_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${GET_FILE_METHOD}?file_id=${file_id}`
            const getFileResponse = await fetch(GET_FILE_URL, { method: "GET" }).then(res => res.json())

            const file_path = getFileResponse.result.file_path;
            const DORNLOAD_FILE_URL = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file_path}`
            const downloadResponse = await fetch(DORNLOAD_FILE_URL, { method: "GET" }).then(res => res.arrayBuffer()).then(ab => new Buffer.from(ab))

            const fn = file_path.split("/").pop();
            const f_path = path.join(__dirname, "../cache", fn)
            fs.writeFileSync(f_path, downloadResponse)

            return true

            // const jimp = new Jump();
            // jimp.read(img_buffer).then(image => null)
        } catch (err) {
            console.error(err)
            return false;
        }
    }
}