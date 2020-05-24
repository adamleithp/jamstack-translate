
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

module.exports = async (GOOGLEKEY, { targetLanguages, sourceFolder, folderStructure }) => {
    translate.key = GOOGLEKEY;

    const outputFilesCreated = [];

    const payload = targetLanguages.map(language => {
        const src = folderStructure[0];
        const dist = folderStructure[1];
        const filesArray = src.src.map(fileName => {
            const localArray = []

            if (fileName.includes("*")) {
                const files = glob.sync(sourceFolder + fileName, {})

                const localGlobFileArray = files.map(globFile => {
                    const fileNameReplaced = globFile.replace(/^.*[\\\/]/, '')
                    const filePathJoined = buildFolderPath(globFile.split('/'));

                    const obj = {
                        targetLanguage: language,
                        sourceFileName: fileNameReplaced,
                        sourceFilePath: globFile,
                        distFilePath: sourceFolder + dist.dist.replace('{language}', language),
                        distFileName: filePathJoined
                    }
                    localArray.push(obj) 
                    return obj;
                })
                localArray.push(localGlobFileArray[0])
            } else {
                localArray.push({
                    targetLanguage: language,
                    sourceFileName: fileName,
                    sourceFilePath: sourceFolder + fileName,
                    distFilePath: sourceFolder + dist.dist.replace('{language}', language),
                    distFileName: fileName
                })
            }
            return localArray[0];
        })
        return filesArray
    })

    const flattenedPayload = [].concat.apply([], payload);

    // For each payload object...
        // Load source file into JSDOM
        // Get all <t>,
        // For each <t> in virtual dom
            // generate ID
            // <t class="ID">
            // translate innherHTML
            // create file in dist.
            // push new object for translation.json

    const translationFileArray = [];
            
    await Promise.all(
        flattenedPayload.map(async (payloadObject) => {
            const thisFileContent = await loadData(payloadObject.sourceFilePath);
            const thisVirtualDom = new JSDOM(thisFileContent);
            const thisVirtualNode = thisVirtualDom.window.document.getElementsByTagName('t');
            const thisNodeArray = Array.from(thisVirtualNode);

            await Promise.all(
                thisNodeArray.map(async (thisNode) => {
                    const uniqueId = shortid.generate();
                    const ENGLISH_STRING = thisNode.innerHTML;
                    let TRANSLATED_STRING = await translate(ENGLISH_STRING, { to: payloadObject.targetLanguage });
                    let transaltedStringReplaced = await replaceTranslationData(TRANSLATED_STRING)

                    thisNode.classList.add(uniqueId)
                    thisNode.innerHTML = transaltedStringReplaced

                    const translationFileArrayObject = {}
                    translationFileArrayObject._src = payloadObject.sourceFilePath
                    translationFileArrayObject._dist = `${payloadObject.distFilePath}${payloadObject.distFileName}`
                    translationFileArrayObject.id = uniqueId;
                    translationFileArrayObject.en = ENGLISH_STRING;
                    translationFileArrayObject[payloadObject.targetLanguage] = transaltedStringReplaced;
           
                    let thisVirtualDomString = thisVirtualDom.serialize();
                    let thisVirtualDomStringReplaced = await replaceHTMLData(thisVirtualDomString)
                    
                    let distFolderWithoutFile = getFolderPathWithoutFileNameFromDistString(translationFileArrayObject._dist)
                    if (!fs.existsSync(distFolderWithoutFile)) {
                        fs.mkdirSync(distFolderWithoutFile);
                    }

                    fs.writeFileSync(`${payloadObject.distFilePath}${payloadObject.distFileName}`, thisVirtualDomStringReplaced, 'utf-8');
                    outputFilesCreated.push(`${payloadObject.distFilePath}${payloadObject.distFileName}`)
                    translationFileArray.push(translationFileArrayObject)
                })
            );

        })
    )
        
    const mergeObjectsInUnique = (array, property) => {
        const newArray = new Map();
        array.forEach((item) => {
            const propertyValue = item[property];
            newArray.has(propertyValue) ? newArray.set(propertyValue, { ...item, ...newArray.get(propertyValue) }) : newArray.set(propertyValue, item);
        });

        return Array.from(newArray.values());
    }    

    const mergedArray = mergeObjectsInUnique(translationFileArray, 'en');

    await storeData(mergedArray, 'translations.json');
    
    // Return files created for user
    return `
Files created:
./translations.json
${outputFilesCreated.join('\n')}
    `;
}

