
require('dotenv').config()
const fs = require('fs');
const Promise = require('bluebird');
const shortid = require('shortid');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const translate = require('./lib/translate');
translate.engine = 'google';

var glob = require("glob")

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

    console.log('translations :>> ', translations);

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
    // fs.readdir(inputFolder, (err, files) => {
    //     files.forEach(file => {
    //         console.log(file);
    //     });
    // });

    // Get all files in glob,
    // for each file, get dom,
        // attach class to each <t> tag,
        // translate each file,
        // Add translations to file... (translations.json)
        // replace each dom
        // create file in dist folder (recurively)
    // make translationsfile,
    // return true

    glob(inputFolder, {}, async (er, files) => {      
        // const filesToTranslate = []
        const filesNotGenerated = files.filter(file => !file.includes('__generated__'));
        let translationArray = false || await loadData('./translations.json');
        let virtualDom;

        // Build translation array [{id:asdas,en:'wee'}]
        const newTranslationArray = await Promise.all(
            filesNotGenerated.map(async (thisFile) => {
                const fileContent = await loadData(thisFile);
                const filename = thisFile.replace(/^.*[\\\/]/, '')
        
                // console.log('fileContent :>> ', fileContent);
                virtualDom = new JSDOM(fileContent);
        
                // Get translate tags in virtual dom
                const tTags = virtualDom.window.document.getElementsByTagName('t');
           
                const nodeArray = Array.from(tTags);
    
                const translated = await Promise.all(
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
                            TRANSLATED_STRING = TRANSLATED_STRING.replace(' </a>', '</a>')
                            TRANSLATED_STRING = TRANSLATED_STRING.replace('$ {', '')
        
                            // Build object
                            translatedObject.id = stringObject.className
                            translatedObject._src = thisFile;
                            translatedObject._dist = `${outputFolder}`;
                            translatedObject.en = ENGLISH_STRING
                            translatedObject[language] = TRANSLATED_STRING;
                            return translatedObject
                        }));
        
                        return mainObject[0]
                    })
                );
                return translated
            })
        );
        
        // Merge arrays returned for each file
        const flattenedTranslationArray = [].concat.apply([], newTranslationArray);
        
        // Save translation file
        await storeData(flattenedTranslationArray, 'translations.json');

        // await copyFilesToDistLanguage()

        
        const filesFromTranslationArray = flattenedTranslationArray.map(translationObject => translationObject._src);
        const uniqueSet = new Set(filesFromTranslationArray);
        const newFileArray = [...uniqueSet];


        await Promise.all(
            newFileArray.map(async (thisFile) => {
                const fileContent = await loadData(thisFile);
                const thisTranslationObject = flattenedTranslationArray.filter(object => object._src === thisFile)

                SUPPORTED_LANGUAGES.map(async (language) => {
                    // Get file name from full path
                    const filename = thisFile.replace(/^.*[\\\/]/, '')
                    let folderStructure = ''
                    // Build language directory
                    let fileDestination = `${outputFolder}/${language}/${filename}`

                    // Get folder array for each source file,
                    const folderArray = thisFile.split('/');

                    if (folderArray.length > 2) {
                        folderStructure = `${folderArray[1]}/`
                    }

                    if (folderStructure) {
                        fileDestination = `${outputFolder}/${language}/${folderStructure}/${filename}`;
                    }

                    if (!fs.existsSync(`${outputFolder}/${language}/${folderStructure}`)) {
                        fs.mkdirSync(`${outputFolder}/${language}/${folderStructure}`);
                    }

                    fs.copyFile(thisFile, fileDestination, async (err) => {
                        if (err) throw err;

                        // Copy virtual dom
                        const virtualDom = new JSDOM(fileContent);

                        // Replace text and transalte by classname 
                        const translatedDom = await translateDomCotentsByLanguage(language, virtualDom, flattenedTranslationArray)

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

                // for (let i = 0; i < thisTranslationObject.length; i++) {
                //     const object = thisTranslationObject[i];

                //     console.log('object :>> ', object);
                    
                // }

                // console.log('thisTranslationObject :>> ', thisTranslationObject);
                // const fileDestination = `${thisTranslationObject._dist}`;
                // console.log('fileDestination :>> ', fileDestination);

                

                // // console.log('fileContent :>> ', fileContent);
                // const virtualDom = new JSDOM(fileContent);
            })
        );
       
        return 
        
        // const nodeArray = Array.from(tTags);
        
        nodeArray.map(async (stringObject) => {
            // English string
            const ENGLISH_STRING = stringObject.innerHTML;
            // Build precursor object
            let translatedObject = {}

            console.log('here');

            // For reference....
            // Build object of other lanuages translated. 
            const mainObject = await Promise.all(SUPPORTED_LANGUAGES.map(async (language) => {
                // Translate string, with target translation
                let TRANSLATED_STRING = await translate(ENGLISH_STRING, { to: language });
                TRANSLATED_STRING = TRANSLATED_STRING.replace('$ {', '${')

                // Build object
                translatedObject.id = stringObject.className
                translatedObject._src = thisFile;
                translatedObject._dist = `${outputFolder}/${language}/index.html`;
                translatedObject.en = ENGLISH_STRING
                translatedObject[language] = TRANSLATED_STRING;
                return translatedObject
            }));

            console.log('mainObject :>> ', mainObject);

            return mainObject[0]
        })



        



        console.log('nodeArray :------------------>', nodeArray);
        return;


        
        filesNotGenerated.forEach(thisFile => {
            JSDOM.fromFile(thisFile, {})
                .then(async (virtualDom) => {
                    // Get translate tags in virtual dom
                    const tTags = virtualDom.window.document.getElementsByTagName('t');

                    // Add id to generated virtual dom
                    // Will use this to replace with innerHTML
                    Array.from(tTags).forEach((node) => {
                        node.classList.add(`${shortid.generate()}`)
                    })

                    const nodeArray = Array.from(tTags);
                    // console.log('nodeArray ======================', nodeArray);

                    // Return what's needed in next step...
                    return {
                        virtualDom,
                        nodeArray
                    }
                })
                .then(async ({ virtualDom, nodeArray }) => {
                    
                    console.log('----------------');
                    console.log('----------------', virtualDom.serialize());
                    console.log('----------------');

                    // return;
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

                    console.log(' ====================== translationArray :>> ', translationArray);
                    // Build file of translations
                    await storeData(translationArray, 'translations.json');

                    await copyFilesToDistLanguage(virtualDom, translationArray)
                }).finally(() => {
                    console.log('FINISHED');
                })
        })
    })

    return;
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

