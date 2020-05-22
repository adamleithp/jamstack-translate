
require('dotenv').config()
const fs = require('fs');
const Promise = require('bluebird');
const shortid = require('shortid');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const translate = require('./lib/translate');
translate.engine = 'google';

let framework = ''
let inputFolder = ''
let outputFolder = ''

// TODO: make this a directory path instead, loop through all files below.
const FILE = './src/index.html';

const SUPPORTED_LANGUAGES = [
    'fr',
    'es',
]

const loadData = async (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8')
    } catch (err) {
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
                SUPPORTED_LANGUAGES.map(async (language) => {
                    // Get file name from full path
                    const filename = file.replace(/^.*[\\\/]/, '')

                    // Build language directory
                    const fileDestination = `${outputFolder}/${language}/${filename}`;

                    fs.copyFile(file, fileDestination, async (err) => {
                        if (err) throw err;

                        // Copy virtual dom
                        const newDom = dom;
                        
                        // Replace text and transalte by classname 
                        const translatedDom = await translateDomCotentsByLanguage(language, newDom, translationArray)
                        
                        // Serialize, make string,
                        let newDomString = String(translatedDom.serialize());

                        // Replace html tags
                        newDomString = newDomString.replace('<html><head>', '')
                        newDomString = newDomString.replace('</head><body>', '')
                        newDomString = newDomString.replace('</body></html>', '')

                        // Write file,
                        fs.writeFileSync(fileDestination, newDomString, 'utf-8');
                    });
                })
            })
        );
    } catch (err) {
        // handle error
        console.log('copyFilesToDistLanguage - something went wrong');
    }
}


const translateFromDirectory = () => {
    // INIT
    // TODO: Create a loop around each file in directory.
    JSDOM.fromFile(inputFolder, {})
        .then(async (dom) => {
            let translationArray = await loadData('./translations.json');

            // Get translate tags in virtual dom
            const tTags = dom.window.document.getElementsByTagName('t');

            // If translationArray exists, find string in DOM, add class to it.
            if (translationArray) {
                let parsedTranslationArray = JSON.parse(translationArray)
                
                Array.from(tTags).forEach((node) => {
                    // Get this ID based on innerHTML to match
                    const thisEnglish = parsedTranslationArray.find(x => x.en === node.innerHTML);
                    // Add id to generated virtual dom
                    node.classList.add(`${thisEnglish.id}`)
                })

            // Else, create ID's and add class to it.
            } else {            
                // Add id to generated virtual dom
                // Will use this to replace with innerHTML
                Array.from(tTags).forEach((node) => {
                    node.classList.add(`${shortid.generate()}`)
                })
            }

            // Build array from HTML collection
            const nodeArray = Array.from(tTags)

            // Return what's needed in next step...
            return {
                dom,
                nodeArray,
                translationArray
            }
        })
        .then(async ({ dom, nodeArray, translationArray }) => {
            // Build array of all strings, and their translations.
            translationArray = await Promise.all(
                nodeArray.map(async (stringObject) => {
                    // English string
                    const ENGLISH_STRING = stringObject.innerHTML;
                    // Build precursor object
                    let translatedObject = {}
                    
                    // For reference....
                    // Build object of other lanuages translated. 
                    const mainObject = await Promise.all(SUPPORTED_LANGUAGES.map(async (language) => {
                        // Translate string, with target translation
                        let TRANSLATED_STRING = await translate(ENGLISH_STRING, { to: language });
                        TRANSLATED_STRING = TRANSLATED_STRING.replace('$ {', '${')

                        // Build object
                        translatedObject.id = stringObject.className
                        translatedObject._src = inputFolder;
                        translatedObject._dist = `${outputFolder}/${language}/index.html`;
                        translatedObject.en = ENGLISH_STRING
                        translatedObject[language] = TRANSLATED_STRING;
                        return translatedObject
                    }));

                    return mainObject[0]
                })
            );
            // Build file of translations
            await storeData(translationArray, 'translations.json');

            await copyFilesToDistLanguage(dom, translationArray)
        }).finally(() => {
            console.log('FINISHED');
        })
}
   

module.exports = async (frameworkType, GOOGLEKEY, input, output) => {
    translate.key = GOOGLEKEY;
    framework = frameworkType
    inputFolder = input
    outputFolder = output

    await translateFromDirectory()
    return true;
}


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

