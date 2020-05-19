
require('dotenv').config()
const fs = require('fs');
const Promise = require('bluebird');
// const lineReader = require('line-reader');
// const eachLine = Promise.promisify(lineReader.eachLine);
const shortid = require('shortid');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const translate = require('./lib/translate');
translate.engine = 'google';
translate.key = process.env.GOOGLE_API_KEY;


const supportedLanguages = [
    'fr',
    'es',
]

// const REGEX = RegExp(`<t>(.*?)</t>`);
// const StringToTranslate = [];


const loadData = async (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8')
    } catch (err) {
        console.error(err)
        return false
    }
}

const storeData = async (data, path) => {
    try {
        await fs.writeFileSync(path, JSON.stringify(data, null, 4));
        return true;
    } catch (err) { 
        console.error(err)
    }
}



const translateDomCotentsByLanguage = async (language, dom, translationArray) => {
    const translations = translationArray

    translations.map(async (translationObject) => {
        try {
            const element = dom.window.document.getElementsByClassName(translationObject.id)[0];
            
            // Replace parent with translation...
            // element.replaceWith(translationObject[language]);
            // or originally
            element.innerHTML = translationObject[language]
        } catch (err) {
            console.error(err)
        }
    })
    return dom
}



const copyFilesToDistLanguage = async (dom, translationArray) => {
    console.log('dom :>> ', dom.serialize());
    console.log('translationArray :>> ', translationArray);

    try {
        const translations = translationArray

        // Get file names 
        const files = translations.map(translationObject => translationObject._src)

        // Remove duplicate files
        const uniqueSet = new Set(files);
        const newFileArray = [...uniqueSet];

        // Copy files to dist.
        await Promise.all(
            newFileArray.map(async (file) => {
                supportedLanguages.map(async (language) => {
                    // Get file name from full path
                    var filename = file.replace(/^.*[\\\/]/, '')

                    // Build language directory
                    const fileDestination = `./dist/${language}/${filename}`;

                    console.log('translatedDom :>> ', language);
                    fs.copyFile(file, fileDestination, async (err) => {
                        if (err) throw err;

                        const newDom = dom;
                        const translatedDom = await translateDomCotentsByLanguage(language, newDom, translationArray)
                        fs.writeFileSync(fileDestination, translatedDom.serialize(), 'utf-8');
                    });
                })
            })
        );
    } catch (err) {
        console.log('copyFilesToDistLanguage - something went wrong');
        // handle error
    }
}



const FILE = './src/index.html';
// TODO: do all files in src...
JSDOM.fromFile(FILE, {})
    .then((dom) => {
        // Get translate tags in virtual dom
        const tTags = dom.window.document.getElementsByTagName('t');
        
        // Add id to generated virtual dom
        // Will use this to replace with innerHTML
        Array.from(tTags).forEach((node) => {
            node.classList.add(`ii8n-${shortid.generate()}`)
        })

        // Build array from HTML collection
        const array = Array.from(tTags)

        // Return what's needed in next step...
        return {
            dom,
            array
        }
    })
    .then(async ({ dom, array }) => {
        let translationArray = false
        // let translationArray = await loadData('./translations.json');

        if (!translationArray) {
            // Build array of all strings, and their translations.
            translationArray = await Promise.all(
                array.map(async (stringObject) => {
                    // English string
                    const ENGLISH = stringObject.innerHTML;
                    // Build precursor object
                    const translatedObject = {}
                    
                    // For reference....
                    // Build object of other lanuages translated. 
                    const mainObject = await Promise.all(supportedLanguages.map(async (language) => {
                        // Translate string, with target translation
                        const TRANSLATED = await translate(ENGLISH, { to: language });

                        // Build object
                        translatedObject.id = stringObject.className
                        translatedObject._src = FILE;
                        translatedObject._dist = `./dist/${language}/index.html`;
                        translatedObject.en = ENGLISH
                        translatedObject[language] = TRANSLATED;
                        return translatedObject
                    }));
    
                    return mainObject[0]
                })
            );
            // Build file of translations
            await storeData(translationArray, 'translations.json');
        }

        // console.log('translationArray :>> ', translationArray);
        await copyFilesToDistLanguage(dom, translationArray)
    }).finally(() => {
        console.log('FINISHED');
    })



// // For each line in a file, build array of translation and build file
// // (Put this in a for each file in directory.)
// eachLine(FILE, (line) => {
//     let matches = [...line.matchAll(REGEX)];
//     if (matches[0] !== undefined) {
//         // console.log('matches', FILE, matches);
        

//         StringToTranslate.push({
//             file: FILE,
//             en: matches[0][1],
//         })
//     }
// }).then(async () => {
//     await Promise.all(
//         StringToTranslate.map(async (stringObject) => {
//             const FRENCH = await translate(stringObject.en, { to: 'fr' });
//             stringObject.fr = FRENCH;
//         })
//     );

//     await storeData(StringToTranslate, 'translations.json')
// }).catch((err) => {
//     console.error(err);
// });

