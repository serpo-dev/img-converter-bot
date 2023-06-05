# img-converter-bot

## Description

A simple telegram bot which is able to convert your images in these formats:  "png", "jpg", or "bmp".
Just send an image to the bot as and attachment and insert a command via caption field.

## Available commands

*To launch a bot:*

- `/start`

*To convert an image:*

- `/png`, `png`, `/jpg`, `/jpg`, `/bmp`, `bmp` and attached image in one of these formats: "png", "jpg", or "bmp"

## .env configuration

```
BOT_TOKEN=your_token
GET_UPDATES_DELAY=1000
RESPONSE_DELAY=50
CONVERTER_CHECK_QUEUE_DELAY=500
CACHE_IMAGES=FALSE
```