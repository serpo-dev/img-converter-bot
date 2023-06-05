import { parentPort } from "node:worker_threads"
import * as dotenv from "dotenv"
import * as fs from "fs"
import path from "path"
import "../const.cjs"
import Jimp from "jimp"
import { lookup } from "mime-types"

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

            const extension = message.caption.replace("/", "");
            const filename = fn.split(".").shift() + "_" + "processed" + "." + extension;
            const p_path = path.join(__dirname, "../cache", filename)
            Jimp.read(f_path, (err, lenna) => {
                if (err) return console.log(err);
                lenna.write(p_path, async (err, _) => {
                    await sendResult(message, { processed_path: p_path, origin_path: f_path })
                })
            })

            return true
        } catch (err) {
            console.error(err)
            return false;
        }
    }
}

async function sendResult(message, { processed_path, origin_path }) {
    const METHOD_NAME = "sendDocument"
    const URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${METHOD_NAME}`
    const RESPONSE_DELAY = process.env.RESPONSE_DELAY

    const { chat, caption } = message;
    const data = {
        chat_id: chat.id,
        caption: `All done! Image has been processed to ${caption.replace("/", "").toUpperCase()} successfully.`
    }

    const formData = new FormData()
    for (const key in data) {
        formData.append(key, data[key])
    }

    const file = new Blob([fs.readFileSync(processed_path)])
    const fn = processed_path.split("/").pop()
    formData.append("document", file, fn)

    const options = {
        method: "POST",
        // headers: {
        //     "Content-Type": "application/x-www-form-urlencoded",
        // },
        body: formData
    }
    setTimeout(async () => {
        const response = await fetch(URL, options);

        if (response.status === 200) {
            try {
                if (String(process.env.CACHE_IMAGES).toLowerCase() === "false") {
                    deleteFile(processed_path)
                    deleteFile(origin_path)
                }
            } finally {
                return true;
            }

        } else throw new Error(`The request has failed with status ${response.status}`)
    }, RESPONSE_DELAY)
}


function deleteFile(file_path) {
    if (fs.existsSync(file_path)) {
        fs.unlinkSync(file_path, (err) => {
            if (err) {
                console.error("Cannot delete file: ", file_path, err)
            }
        })
    }
}