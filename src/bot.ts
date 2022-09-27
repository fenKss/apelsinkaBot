import fetch from "node-fetch";
import cheerio from "cheerio";
import SqDatabase from "./db";
import {Context, Telegraf} from "telegraf";

type Action = {
    name: string,
    func: (ctx: Context) => Promise<string>
}

class Bot {
    private readonly _db: SqDatabase;
    private readonly _interval: number;
    private readonly _adminChatId: number;
    private readonly bot: Telegraf<Context>;
    private readonly actions: Array<Action>;

    constructor(db: SqDatabase) {
        this._db = db;
        this._interval = Number(process.env?.INTERVAL || 3600000);
        this._adminChatId = Number(process.env?.ADMIN_CHAT_ID || 0);
        this.bot = new Telegraf(process.env.BOT_TOKEN);
        this.actions = [
            {
                name: '/start',
                func: async (ctx: Context): Promise<string> => {
                    const isExists = await this._db.get('SELECT * FROM user WHERE user_id=?', [ctx.chat.id]);
                    if (isExists) {
                        return 'Already started';
                    }
                    await this._db.run(`INSERT INTO user(user_id)
                                        VALUES (${ctx.chat.id})`);
                    return 'Done';
                }
            },
            {
                name: '/help',
                func: async (ctx: Context): Promise<string> => {
                    return '/stop - Остановить. /start - Запустить';

                }
            },
            {
                name: '/get',
                func: async (ctx) => {
                    return await this.getRandomText();

                }
            },
            {
                name: '/stop',
                func: async (ctx) => {
                    await this._db.run(`DELETE FROM user WHERE user_id = ?`, [ctx.chat.id]);
                    return 'Done';
                }
            },
            {
                name: '/hi',
                func: async (ctx) => {
                    const all = await this._db.all(`SELECT * FROM user`);
                    return JSON.stringify(all);
                }
            },
            {
                name: '/count',
                func: async (ctx) => {
                    const count = await this._db.all(`SELECT count(1) as count FROM user`);
                    return count[0].count;
                }
            },
        ]
    }

    getRandomText = async (): Promise<string> => {
        const page = this.getRandomArbitrary(1, 6);
        const url = `https://datki.net/komplimenti/page/${page}`;
        const response = await fetch(url);
        const $ = cheerio.load(await response.text());
        const posts = $(`article.post.dn-entry-content p`).toArray();
        const random = this.getRandomArbitrary(0, posts.length - 1);
        console.log(posts, random);
        const post = posts[random];
        //@ts-ignore
        return post.children[0]?.data || '';
    }
    getRandomArbitrary = (min, max) => {
        return Math.round(Math.random() * (max - min) + min);
    }

    run = async () => {

        this.startInterval();
        this.actions.forEach(action => {
            this.bot.hears(action.name, async (ctx) => {
                try {
                    const answer = await action.func(ctx);
                    ctx.reply(answer);

                } catch (e) {
                    if (this._adminChatId) {
                        await this.bot.telegram.sendMessage(this._adminChatId, e.message);
                    }
                    ctx.reply("Что-то пошло не так!");
                }

            });
        });

        await this.bot.launch();
    }

    private startInterval() {
        setInterval(async () => {
            const text = await this.getRandomText();
            const users = await this._db.all('SELECT * FROM user');
            for (const i in users) {
                const user = users[i];
                const user_id = user.user_id;
                await this.bot.telegram.sendMessage(user_id, text);
            }
        }, this._interval)
    }
}

export default Bot;