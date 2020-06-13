
# Jamstack Translate Example

## Usage
* Create `.env` file from example `.env-example`
* Add your google translate api key to `.env` 
* Open `index.js`
* Jamstack Translate takes these parameters
  * `GOOGLEKEY`: string of your google translate api key.
  * `OPTIONS`: object
    * `targetLanguages`: array of desired languages (language codes)
    * `targetFiles`: array of files/folders. You can specify specific file paths, or globs.
    * `targetDirectory`: string of generated file structure.
    * `sourceDirectory`: string of where the package starts from
    * `translationFile`: file which translations can be saved to / loaded from (if `loadTranslationsFromFile` is set to true)
    * `loadTranslationsFromFile`: boolean to tell the package to pull translations from `translationFile`. **Note**: if set to `false`, whichever value of `translationFile` will be overwritten. 

* Run the program with `node translate.js`
* Explore your specified `targetDirectory` folder with your translated source files.

---


# vue-starter

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
