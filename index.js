const idiom = require('./idiom.json');
let words = idiom.map(i => i.word).filter(i => i.length === 4);
const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const result = require('./result.json');
const { setTimeout } = require('timers/promises');
const urls = require('./urls.json');

(async () => {
    let browser = await puppeteer.launch({
        headless: false
    });
    let page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=123`);
    const index = words.indexOf('半生半熟');
    words = words.slice(index);
    for (const word of words) {
        const handle = async () => {
            await page.waitForSelector('button[type="submit"]')
            await page.waitForSelector('#tsf > div:nth-child(1) > div > div > div > div > input')
            let el = await page.$('#tsf > div:nth-child(1) > div > div > div > div > input');
            await page.$eval('#tsf > div:nth-child(1) > div > div > div > div > input', e => e.value = "");
            await el.type('"' + word + '"');
            el = await page.$('button[type="submit"]');
            el.click();
            await page.waitForResponse(response =>
                response.url().includes('https://www.google.com/search') && response.status() === 200)
            await page.waitForSelector('#result-stats');
            const text = await page.$eval('#result-stats', e => e.innerText);
            text.match(/找到约 ([\d\,]+) 条结果/);
            const count = RegExp.$1.replace(/\,/g, '');
            result[word] = count;
            console.log(word, ':', count);
            await setTimeout((Math.random() * 10 + 2) * 1000);
        }
        await handle();
    }
})();

setInterval(async () => {
    fs.writeFile('./result.json', JSON.stringify(result));
}, 60 * 1000)