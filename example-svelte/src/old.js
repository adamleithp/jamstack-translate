
require('dotenv').config()
const fs = require('fs');
const Promise = require('bluebird');
const glob = require("glob")
const shortid = require('shortid');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const translate = require('translate');
translate.engine = 'google';


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

const buildFolderPath = (array) => {
    const path = array.slice(2).join('/')
    return path;
}

const getFolderPathWithoutFileNameFromDistString = (string) => {
    let stringSplit = string.split('/');
    let directory = stringSplit.slice(0, stringSplit.length - 1);
    return directory.join('/')
}

const replaceTranslationData = async (string) => {
    let newString = string
    newString = newString.replace('"> ', '">')
    newString = newString.replace(' </a>', '</a>')
    newString = newString.replace('$ {', '${')
    return newString
}

const replaceHTMLData = async (string) => {
    let newString = string
    newString = newString.replace('<html><head>', '')
    newString = newString.replace('</head><body>', '')
    newString = newString.replace('</body></html>', '')
    
    return newString
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const getFilesWithStrings = async (array) => {
    // console.log('array :>> ', array);
    
    const filesWithStrings = []
    await Promise.all(
        array.map(async (payloadObject) => {
            const thisFileContent = await loadData(payloadObject.sourceFilePath);

            let keys = [];
            const regex = /\<t\>(.*?)\<\/t\>/g
            let match
            while ((match = regex.exec(thisFileContent))) {
                keys.push(
                    match
                        .pop()
                        .split(',')[0]
                        .replace(/['"]+/g, '')
                        .trim()
                );
            }
            filesWithStrings.push({
                file: payloadObject.sourceFilePath,
                strings: keys,
            })
        })
    )
    return filesWithStrings;
}

const getFilesWithLanguageObjects = async (filesWithStringsArray, targetLanguagesArray) => {
    console.log('array, targetLanguagesArray :>> ', filesWithStringsArray, targetLanguagesArray);
    const filesWithStrings = []
    await Promise.all(
        filesWithStringsArray.map(async (fileAndStringsObject) => {
            // console.log('fileAndStringsObject :>> ', fileAndStringsObject);
            fileAndStringsObject.strings.map(async (englishString) => {

                targetLanguagesArray.map(async (language) => {
                    const translatedString = await translate(englishString, { to: language });
                    const object = {}
                    object.en = englishString
                    object[language] = translatedString
                    console.log('object :>> ', object);
                    // return object;
                })
            })

            // console.log('translatedObject :>> ', await translatedObject);
            return;
        })
    )
    return filesWithStrings;
}

module.exports = async (GOOGLEKEY, { targetLanguages, sourceFolder, folderStructure, options }) => {
    translate.key = GOOGLEKEY;

    const uniqueIdsForDomElements = options.uniqueIdsForDomElements ? true : false;
    const translationFile = options.translationFile ? options.translationFile : './translations.json';
    const loadCustomTranslations = options.loadCustomTranslation ? options.loadCustomTranslation : false;
    let stringNotFound = false;
    const src = folderStructure[0];
    const dist = folderStructure[1];
    let existingTranslationFile = null;

    if (loadCustomTranslations) {
        try {
            existingTranslationFile = await loadData(translationFile);
            existingTranslationFile = JSON.parse(existingTranslationFile);
        } catch (error) {
            console.log(`${translationFile} has invalid JSON.`);
        }
    }

    const outputFilesCreated = [];

    const payload = targetLanguages.map(language => {
        const filesArray = src.src.map(fileName => {
            const localArray = []

            if (fileName.includes("*")) {
                const files = glob.sync(sourceFolder + fileName, {})

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileNameReplaced = file.replace(/^.*[\\\/]/, '')
                    const filePathJoined = buildFolderPath(file.split('/'));

                    const obj = {
                        targetLanguage: language,
                        sourceFileName: fileNameReplaced,
                        sourceFilePath: file,
                        distFilePath: `${sourceFolder}${dist.dist}${language}`,
                        distFileName: filePathJoined
                    }
                    localArray.push(obj)
                }
            } else {
                localArray.push({
                    targetLanguage: language,
                    sourceFileName: fileName,
                    sourceFilePath: sourceFolder + fileName,
                    distFilePath: `${sourceFolder}${dist.dist}${language}`,
                    distFileName: fileName
                })
            }
            return localArray;
        })
        return filesArray
    })

    const flattenedPayload = [].concat.apply([], payload);
    const flattenedAgainPayload = [].concat.apply([], flattenedPayload);
    // const translationFileArray = [];
            
    const filesWithStrings = await getFilesWithStrings(flattenedAgainPayload);
    
    // const thisObject = array.filter(object => object.sourceFileName === payloadObject.sourceFilePath)[0];
    // thisObject.strings = {}
    // thisObject 

    const filesWithLanguageObjects = await getFilesWithLanguageObjects(filesWithStrings, targetLanguages)

    // await asyncForEach(filesWithStrings, async ({file, strings}) => {
    //     console.log('file, strings :>> ', file, strings);

    //     const thisPayloadObject = flattenedAgainPayload.filter(object => object.sourceFilePath === file)[0];
    //     console.log('thisPayloadObject :>> ', thisPayloadObject);

    //     filesWithLanguageObjects.push({
    //         file, 
    //         strings
    //     })
    //     // await waitFor(50);
    //     // console.log(num);
    // });

    // const filesWithLanguageObjects = await getFilesWithLanguageObjects(filesWithStrings)
    
    
    // console.log('filesWithStrings :>> ', filesWithStrings);
    // console.log('filesWithLanguageObjects :>> ', filesWithLanguageObjects);
    return;


    // await Promise.all(
    //     flattenedAgainPayload.map(async (payloadObject) => {

    //         // Create __generated__ if it doesn't exist
    //         if (!fs.existsSync(`${sourceFolder}${dist.dist}`)) {
    //             fs.mkdirSync(`${sourceFolder}${dist.dist}`);
    //         }

    //         // Create __generated__/{language} if it doesn't exist
    //         if (!fs.existsSync(`${sourceFolder}${dist.dist}${payloadObject.targetLanguage}/`)) {
    //             fs.mkdirSync(`${sourceFolder}${dist.dist}${payloadObject.targetLanguage}/`);
    //             outputFilesCreated.push(`${sourceFolder}${dist.dist}${payloadObject.targetLanguage}/`)
    //         }

    //         const thisFileContent = await loadData(payloadObject.sourceFilePath);

    //         const thisVirtualDom = new JSDOM(thisFileContent);
    //         const thisVirtualNode = thisVirtualDom.window.document.getElementsByTagName('t');
    //         const thisNodeArray = Array.from(thisVirtualNode);

    //         await Promise.all(
    //             thisNodeArray.map(async (thisNode) => {
    //                 const ENGLISH_STRING = thisNode.innerHTML;

    //                 let transaltedStringReplaced;

    //                 if (existingTranslationFile) {
    //                     const thisTranslationObject = existingTranslationFile.filter(translationFileObject => {
    //                         return translationFileObject.en === ENGLISH_STRING;
    //                     })[0]
                        
    //                     // TODO: Add duplicate detection here... remove [0] above...

    //                     // Error handling
    //                     // If English string is not found, generate
    //                     if (!thisTranslationObject) {
    //                         console.log(`String was not found, translating: ${ENGLISH_STRING}`);
    //                         const TRANSLATED_STRING = await translate(ENGLISH_STRING, { to: payloadObject.targetLanguage });
    //                         transaltedStringReplaced = await replaceTranslationData(TRANSLATED_STRING)
    //                         stringNotFound = true;
    //                     } else {
    //                         transaltedStringReplaced = thisTranslationObject[payloadObject.targetLanguage]
    //                     }
    //                 } else {
    //                     const TRANSLATED_STRING = await translate(ENGLISH_STRING, { to: payloadObject.targetLanguage });
    //                     transaltedStringReplaced = await replaceTranslationData(TRANSLATED_STRING)
    //                 }

    //                 let uniqueId = uniqueIdsForDomElements ? shortid.generate() : null;

    //                 if (uniqueIdsForDomElements) {
    //                     thisNode.classList.add(uniqueId)
    //                 }
    //                 thisNode.innerHTML = transaltedStringReplaced

    //                 const translationFileArrayObject = {}
    //                 translationFileArrayObject._src = payloadObject.sourceFilePath
    //                 translationFileArrayObject._dist = `${payloadObject.distFilePath}${payloadObject.distFileName}`
    //                 if (uniqueIdsForDomElements) {
    //                     translationFileArrayObject.id = uniqueId
    //                 }
    //                 translationFileArrayObject.en = ENGLISH_STRING;
    //                 translationFileArrayObject[payloadObject.targetLanguage] = transaltedStringReplaced;
           
    //                 let thisVirtualDomString = thisVirtualDom.serialize();
    //                 let thisVirtualDomStringReplaced = await replaceHTMLData(thisVirtualDomString)
                    
    //                 let distFolderWithoutFile = getFolderPathWithoutFileNameFromDistString(translationFileArrayObject._dist)
    //                 if (!fs.existsSync(distFolderWithoutFile)) {
    //                     fs.mkdirSync(distFolderWithoutFile);
    //                 }

    //                 fs.writeFileSync(`${payloadObject.distFilePath}${payloadObject.distFileName}`, thisVirtualDomStringReplaced, 'utf-8');
    //                 outputFilesCreated.push(`${payloadObject.distFilePath}${payloadObject.distFileName}`)
    //                 translationFileArray.push(translationFileArrayObject)
    //             })
    //         );

    //     })
    // )
        
    const mergeObjectsInUnique = (array, property) => {
        const newArray = new Map();
        array.forEach((item) => {
            const propertyValue = item[property];
            newArray.has(propertyValue) ? newArray.set(propertyValue, { ...item, ...newArray.get(propertyValue) }) : newArray.set(propertyValue, item);
        });

        return Array.from(newArray.values());
    }    

    const mergedArray = mergeObjectsInUnique(translationFileArray, 'en');

    if (stringNotFound || !existingTranslationFile) {
        await storeData(mergedArray, translationFile);
    }
    
    // Return files created for user
    return `
Files/Folders created:
./translations.json
${outputFilesCreated.join('\n')}
    `;
}
