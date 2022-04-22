import SqDatabase from "./db";
import Bot from "./bot";

(async () => {
    require('dotenv').config();
    const bot = new Bot(new SqDatabase());
    await bot.run();
})();