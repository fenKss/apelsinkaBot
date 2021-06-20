import SqDatabase from "./db";

require('dotenv').config();
import fetch from "node-fetch";
import {Telegraf} from "telegraf";

const cheerio = require('cheerio');
const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new SqDatabase();


setInterval(async () => {
    const page = getRandomArbitrary(1, 6);
    const url = `https://datki.net/komplimenti/page/${page}`;
    const response = await fetch(url);
    const $ = cheerio.load(await response.text())
    const posts = $(`article.post.dn-entry-content p`).toArray();
    const random = getRandomArbitrary(0, posts.length - 1);
    const post = posts[random];
    const text = post.children[0].data;

    const users = await db.all('SELECT * FROM user');
    for (const i in users) {
        const user = users[i];
        const user_id = user.user_id;
        await bot.telegram.sendMessage(user_id, text);
    }
}, 3600000)
bot.start(async (ctx) => {
    console.log(ctx.chat.id);
    const isExists = await db.get('SELECT * FROM user WHERE user_id=?', [ctx.chat.id]);
    if (!isExists) {
        await db.run(`INSERT INTO user(user_id)
                      VALUES (${ctx.chat.id})`);
    }

    ctx.reply('Done');
});
bot.hears('/stop', async (ctx) => {
    await db.run(`DELETE
                  FROM user
                  WHERE user_id = ?`, [ctx.chat.id]);

    ctx.reply('Done');
});
bot.hears('hi', async (ctx) => {
    const a = await db.all(`SELECT *
                            FROM user`);
    ctx.reply(JSON.stringify(a));
})
bot.help((ctx) => ctx.reply('/stop - Остановить. /start - Запустить'))
//
function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

bot.launch()