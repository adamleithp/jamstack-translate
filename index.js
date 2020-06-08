

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const glob = require("glob")
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

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const getFilesFromSource = async (sourceArray) => {
    const filesArray = []
    for (let i = 0; i < sourceArray.length; i++) {
        const files = glob.sync(sourceArray[i], {})
        filesArray.push(files)
    }
    const filesArrayFlat = [].concat.apply([], filesArray);
    return filesArrayFlat;
}

const getFilesStrings = async (filesArray) => {
    const filesWithStrings = []

    await Promise.all(
        filesArray.map(async (file) => {
            const fileContent = await loadData(file);

            let keys = [];
            const regex = /\<t\>(.*?)\<\/t\>/g
            let match;

            while ((match = regex.exec(fileContent))) {
                const newMatch = match
                    .pop()
                    // .split('\',')[0]
                    // .replace(/['"]+/g, '"') 
                    // .trim()
                // console.log('match :>> ', newMatch);
                keys.push(newMatch);
            }

            // for each string in this file
            for (let i = 0; i < keys.length; i++) {
                const string = keys[i];

                filesWithStrings.push({
                    file: file,
                    en: string,
                })
            }
        })
    )
    return filesWithStrings
}

const mergeObjectsInUnique = (array, property) => {
    const newArray = new Map();
    array.forEach((item) => {
        const propertyValue = item[property];
        newArray.has(propertyValue) ? newArray.set(propertyValue, { ...item, ...newArray.get(propertyValue) }) : newArray.set(propertyValue, item);
    });

    return Array.from(newArray.values());
}  

const getFilesStringsTranslated = async (filesArrayWithStrings, targetLanguages) => {
    const filesWithTranslatedStrings = [];

    await Promise.all(
        filesArrayWithStrings.map(async (file) => {

            await asyncForEach(targetLanguages, async (language) => {
                const translatedString = await translate(file.en, { to: language });
                const object = {
                    file: file.file,
                    en: file.en,
                    [language]: translatedString
                }

                filesWithTranslatedStrings.push(object)
            })            
        })
    )
    const mergedArray = mergeObjectsInUnique(filesWithTranslatedStrings, 'en');
    return mergedArray;
}

const generateTranslatedFiles = async (filesWithTranslatedStrings, targetLanguages, sourceFolder, distFolder) => {
    const uniqueFiles = [...new Set(filesWithTranslatedStrings.map(obj => obj.file))];
    const generatedFiles = []
    await Promise.all(
        uniqueFiles.map(async (filePath) => {
            targetLanguages.map(async (language) => {
                const pathAfterSourceFolder = filePath.split(sourceFolder)[1];
                const newFileDestination = `${distFolder}${language}/${pathAfterSourceFolder}`;
                const newFilePath = path.dirname(newFileDestination);
                let fileContent = await loadData(filePath);
                
                const translatedFile = filesWithTranslatedStrings.map((translatedObject) => {
                    // Build regex, also escape string literals
                    const regex = new RegExp(translatedObject.en.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g"); 

                    fileContent = fileContent
                        // Replace content with trsanslated string
                        .replace(regex, translatedObject[language])
                        // Fix spaced string literals (make this an option)
                        .replace('$ {', '${')
                    return fileContent;
                })

                
                // Get last mapped of array (the fully translated item)
                const newFileContent = translatedFile.pop()
                
                // Create folder if it doesn't exist
                if (!fs.existsSync(`${newFilePath}`)) {
                    fs.mkdirSync(`${newFilePath}`, { recursive: true });
                }

                // Create file with new content
                fs.writeFileSync(newFileDestination, newFileContent, 'utf-8');

                // Build array of created files for output
                generatedFiles.push(newFileDestination)          
            })
        })
    )

    return generatedFiles;
}

module.exports = async (GOOGLEKEY, { targetLanguages, sourceFolder, folderStructure, options }) => {
    translate.key = GOOGLEKEY;
    const src = folderStructure[0].src;
    const dist = folderStructure[1].dist;

    // Get files,
    const files = await getFilesFromSource(src)
    
    // Get strings from file contents
    const filesWithStrings = await getFilesStrings(files)

    // Translate each string
    const filesWithTranslatedStrings = await getFilesStringsTranslated(filesWithStrings, targetLanguages)
    
    // Create file from strings for each language
    const createdFiles = await generateTranslatedFiles(filesWithTranslatedStrings, targetLanguages, sourceFolder, dist)
    
    // Return files created
    return createdFiles;
}

