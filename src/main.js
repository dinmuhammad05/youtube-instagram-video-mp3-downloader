import { Telegraf, Markup } from "telegraf";
import { exec } from "child_process";
import { config } from "dotenv";
import fs from "fs";
import DBModel from "./model/index.model.js";
import { connectdb } from "./db/index.js";

config();
await connectdb();

const bot = new Telegraf(process.env.BOT_TOKEN);

const userLinks = new Map();

bot.on("text", async (ctx) => {
    const url = ctx.message.text;
    try {
        const botUser = ctx.from;
        const user = await DBModel.findOne({ id: botUser.id });
        if (!user) {
            await DBModel.create(botUser);
        }
    } catch (error) {
        console.log(error.message);
    }

    if (
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("instagram.com")
    ) {
        userLinks.set(ctx.from.id, url);

        await ctx.reply(
            "Qaysi formatda yuklab olmoqchisiz?",
            Markup.inlineKeyboard([
                [Markup.button.callback("🎧 MP3 (audio)", "download_mp3")],
                [Markup.button.callback("🎬 Video (MP4)", "download_video")],
            ])
        );
    } else {
        ctx.reply("🔗 Iltimos, YouTube yoki Instagram havolasini yuboring.");
    }
});

bot.action("download_mp3", async (ctx) => {
    const url = userLinks.get(ctx.from.id);
    if (!url) return ctx.reply("⛔ Avval link yuboring.");

    const fileName = `audio.mp3`;
    await ctx.reply("🎧 MP3 yuklanmoqda...");

    exec(
        `yt-dlp -x --audio-format mp3 -o ${fileName} ${url}`,
        async (error) => {
            if (error) return ctx.reply("❌ Audio yuklab bo'lmadi.");

            await ctx.replyWithAudio({ source: fileName });
            fs.unlinkSync(fileName);
        }
    );
});

bot.action("download_video", async (ctx) => {
    const url = userLinks.get(ctx.from.id);
    if (!url) return ctx.reply("⛔ Avval link yuboring.");

    const fileName = `video.mp4`;
    await ctx.reply("🎬 Video yuklanmoqda...");

    exec(`yt-dlp -f best -o ${fileName} ${url}`, async (error) => {
        if (error) {
          console.log(error)
            return ctx.reply("❌ Video yuklab bolmadi.");
        }

        await ctx.replyWithVideo({ source: fileName });
        fs.unlinkSync(fileName);
    });
});

bot.launch();
console.log("🤖 Format tanlovli bot ishga tushdi");
