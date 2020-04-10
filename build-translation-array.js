
require('dotenv').config()
const fs = require('fs');
const Promise = require('bluebird');
const lineReader = require('line-reader');
const eachLine = Promise.promisify(lineReader.eachLine);

const FILE = './src/index.html';
const REGEX = RegExp(`<t>(.*?)</t>`);
const StringToTranslate = [];
const translate = require('./lib/translate');

translate.engine = 'google';
translate.key = process.env.GOOGLE_API_KEY;

const storeData = async (data, path) => {
    try {
        await fs.writeFileSync(path, JSON.stringify(data, null, 4));
        return true;
    } catch (err) {
        console.error(err)
    }
}

// const loadData = async (path) => {
//     try {
//         return fs.readFileSync(path, 'utf8')
//     } catch (err) {
//         console.error(err)
//         return false
//     }
// }


// Put this in a for each file in directory.
eachLine(FILE, function (line) {
    let matches = [...line.matchAll(REGEX)];
    if (matches[0] !== undefined) {
        StringToTranslate.push({
            file: FILE,
            en: matches[0][1],
        })
    }
}).then(async function () {
    await Promise.all(
        StringToTranslate.map(async (stringObject) => {
            const FRENCH = await translate(stringObject.en, { to: 'fr' });
            stringObject.fr = FRENCH;
        })
    );

    await storeData(StringToTranslate, 'translations.json')
}).catch(function (err) {
    console.error(err);
});



// console.log(StringToTranslate);
// (async () => {
// })();
