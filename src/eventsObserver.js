export function eventsObserver({ getUpdates, sendMessages, converter }) {
    const queue = {
        messages: [],
        convert: [],
    };


    getUpdates.on("online", () => {
        if (queue.messages.length > 0) {
            const last_message = queue.messages[queue.messages.length - 1].message || queue.messages[queue.messages.length - 1].edited_message
            const last_id = last_message.message_id;
            getUpdates.postMessage({ messages: queue.messages, last_id })
        } else {
            getUpdates.postMessage({ messages: queue.messages, last_id: 0 })
        }
    })
    getUpdates.on("message", ({ new_messages, last_id_saved }) => {
        if (new_messages && new_messages.length > 0) {
            queue.messages.push(...new_messages)
            console.log("getUpdates updated the queue.messages! The current number of tasks: ", queue.messages.length)
        }

        if (queue.messages.length > 0) {
            const last_message = queue.messages[queue.messages.length - 1].message || queue.messages[queue.messages.length - 1].edited_message
            const last_id = last_message.message_id;
            getUpdates.postMessage({ messages: queue.messages, last_id })
        } else {
            getUpdates.postMessage({ messages: queue.messages, last_id: last_id_saved })
        }
    })


    sendMessages.on("online", () => {
        if (queue.messages.length > 0) {
            appendToConverter(queue.messages[0])
            sendMessages.postMessage(queue.messages[0])
        } else sendMessages.postMessage("none")
    })
    sendMessages.on("message", (message) => {
        if (queue.messages.length > 0) {
            if (message === "success") {
                // delete the previous message whick is already replied
                queue.messages.shift();
                console.log("sendMessages updated the queue.messages! The current number of tasks: ", queue.messages.length)
            }

            if (queue.messages.length > 0) {
                appendToConverter(queue.messages[0])
                sendMessages.postMessage(queue.messages[0])
            } else {
                sendMessages.postMessage("none")
            }
        } else {
            sendMessages.postMessage("none")
        }
    })


    converter.on("online", () => {
        if (queue.convert.length > 0) {
            converter.postMessage(queue.convert[0])
        } else converter.postMessage("none")
    })
    converter.on("message", (message) => {
        if (queue.convert.length > 0) {
            if (message === "success") {
                // delete the previous convert message whick is already processed
                queue.convert.shift();
                console.log("Сonverter updated the queue.convert! The current number of tasks: ", queue.convert.length)
            }

            if (queue.convert.length > 0) {
                converter.postMessage(queue.convert[0])
            } else {
                converter.postMessage("none")
            }
        } else {
            converter.postMessage("none")
        }
    })



    function appendToConverter({message}) {
        switch (message.caption) {
            case "png" || "jpg" || "bmp" || "/png" || "/jpg" || "/bmp":
                if (message.photo) {
                    queue.convert.push(message)
                }
        }
    }
}


