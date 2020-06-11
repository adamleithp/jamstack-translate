

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const glob = require("glob")
const myJsonAbc = require("jsonabc");
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
            const regex = /\<t\>(.*?)\<\/t\>/g // everything inside <t></t>
            let match;

            while ((match = regex.exec(fileContent))) {
                const newMatch = match
                    .pop()
                    // .split('\',')[0]
                    // .replace(/['"]+/g, '"') 
                    // .trim()
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

// Find all words inside {}, add 'X' at substring 2, 
const changeVariables = (stringToReplace) => {
    const regex = /{([^}]*)}/g;
    let matches = stringToReplace.matchAll(regex);

    for (let match of matches) {
        const newMatch = match[0]
        stringToReplace = stringToReplace.replace(newMatch, newMatch.substring(0, 2) + 'X' + newMatch.substring(2))
    }
    return stringToReplace;
}

// Find all words inside {}, remove 'X' at substring 2, 
const restoreVariables = (stringToReplace) => {
    const regex = /{([^}]*)}/g;
    let matches = stringToReplace.matchAll(regex);

    for (let match of matches) {
        const newMatch = match[0]
        stringToReplace = stringToReplace.replace(newMatch, newMatch.substring(0, 2) + newMatch.substring(3))
    }
    return stringToReplace;
}

// Find common google translation HTML errors
const fixHtmlInTranslation = (stringToReplace) => {
    const regexes = [
        // From: <span class = "className">
        // To: <span class="className">
        {
            from: / = /g,
            to: '='
        },
        // From: <Span class="className">
        // To: <span class="className">
        {
            from: /<Span/g,
            to: '<span'
        },
        // TODO
        // From: <Span class="green - text">
        // To: <span class="green--text">
        // {}
    ];

    for (let regex of regexes) {
        let matches = stringToReplace.matchAll(regex.from);
    
        for (let match of matches) {
            const newMatch = match[0]
            stringToReplace = stringToReplace.replace(newMatch, regex.to)
        }
    }
    return stringToReplace;
}


const getFilesStringsTranslated = async (filesArrayWithStrings, targetLanguages) => {
    const filesWithTranslatedStrings = [];

    await Promise.all(
        filesArrayWithStrings.map(async (file) => {

            await asyncForEach(targetLanguages, async (language) => {

                // Temporarily obfuscate strings inside {}, so they're not translated,
                // make {name} => {nXame}
                const englishStringWithChangedVariables = changeVariables(file.en);
                
                // translate obfuscate strings
                let translatedString = await translate(englishStringWithChangedVariables, { to: language });

                // then reverse
                // make {nXame} => {name}
                const translatedStringWithRestoredVariables = restoreVariables(translatedString);
                translatedString = translatedStringWithRestoredVariables

                // Fix HTML inconsistencies in html
                const fixedHTMLString = fixHtmlInTranslation(translatedString)
                translatedString = fixedHTMLString

                console.log('translatedString :>> ', translatedString);

                const object = {
                    _file: file.file,
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
    const uniqueFiles = [...new Set(filesWithTranslatedStrings.map(obj => obj._file))];
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
                    // const regex = new RegExp(translatedObject.en.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g"); 

                    // Find matching string with wrapping <t> only. Fixes bug where all instances of a word would be replaced (not wrapped)
                    let englishString = `<t>${translatedObject.en}</t>`;

                    fileContent = fileContent
                        // Replace content with trsanslated string
                        // TODO: create option to remove wrapping tags here.
                        .replace(englishString, `<t>${translatedObject[language]}</t>`)
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


module.exports = async (GOOGLEKEY, { targetLanguages, targetFiles, targetDirectory, sourceDirectory, translationFile, loadTranslationsFromFile }) => {
    translate.key = GOOGLEKEY;

    // Defaults
    const TARGET_LANGUAGES = targetLanguages;
    const TARGET_FILES = targetFiles;
    const TARGET_DIRECTORY = targetDirectory;
    const SOURCE_DIRECTORY = sourceDirectory;
    const TRANSLATION_FILE = translationFile ? translationFile : './translations.json';
    const LOAD_TRANSLATIONS_FROM_FILE = loadTranslationsFromFile ? loadTranslationsFromFile : false;

    // Get files,
    const files = await getFilesFromSource(TARGET_FILES)

    // Get strings from file contents
    const filesWithStrings = await getFilesStrings(files)

    // Get translations array
    let filesWithTranslatedStrings;
    if (LOAD_TRANSLATIONS_FROM_FILE) {
        // Load existing translation JSON file
        const fileContent = await loadData(TRANSLATION_FILE)
        filesWithTranslatedStrings = JSON.parse(fileContent)
    } else {
        // Get translation array
        filesWithTranslatedStrings = await getFilesStringsTranslated(filesWithStrings, TARGET_LANGUAGES)
    }

    if (!filesWithTranslatedStrings && LOAD_TRANSLATIONS_FROM_FILE) return 'Please choose a translation file to load.' 

    // Create file from strings for each language
    const createdFiles = await generateTranslatedFiles(filesWithTranslatedStrings, TARGET_LANGUAGES, SOURCE_DIRECTORY, TARGET_DIRECTORY)

    // Create JSON file, only if we don't load an existing translation file
    if (!LOAD_TRANSLATIONS_FROM_FILE) {
        var sortedJson = myJsonAbc.sortObj(filesWithTranslatedStrings, false);
        await storeData(sortedJson, TRANSLATION_FILE);
    }

    // Return files created
    return createdFiles;
}
