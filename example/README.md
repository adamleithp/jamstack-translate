

# Jamstack Translate Example

## Usage
* Create `.env` file from example `.env-example`
* Add your google translate api key to `.env` 
* Open `index.js`
  * `targetLanguages`: array of desired languages (language codes)
  * `sourceFolder`: string of where the package starts from
  * `folderStructure:src`: array of files/folders. You can specify specific file paths, or globs.
  * `folderStructure:dist`: string of generated file structure.
  * `options`: 
    * `translationFile`: file which translations can be saved to.
    * `loadCustomTranslation`: boolean to tell the package to pull translations. **Note**: if set to true, the `translationFile` will be overwritten. 
    * `uniqueIdsForDomElements`: boolean to generate unique classes for each `<t>` once translated. *Example if true: `<t class="Qcs-MPi0VO">Adiós</t>`*
  * `GOOGLEKEY`: string of your google translate api key.

* Run the program with `node index.js`
* Explore `__generated__` folder with your translated source files.