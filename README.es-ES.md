

# jamstack-translate (prueba de concepto)

### Genera traducciones estáticas para cualquier proyecto de front end.
Traduce tu carpeta de origen con Google Translate y compílala a directorios estáticos de idiomas sin escribir referencias enredadas a archivos json... No me gustan en absoluto las bibliotecas i18n por la separación de responsabilidades, así que aquí está mi solución personal.


#### ¿Qué hace este paquete?
* Traduce todas las cadenas dentro de `<t>Alguna Cadena</t>`
* Soporta todos los tipos de archivos.
* Copia tus archivos de origen en una carpeta generada/traducida de tu elección.
* Genera un archivo JSON con nombre con todas tus traducciones.
* Carga un archivo JSON especificado para generar archivos.


#### Ejemplo

##### Antes...
```
.
├── src
|   └── components
|   |   └── Header.svelte
|   |   └── NoTranslations.svelte
|   └── helpers.js
|   └── App.svelte
|   └── main.js
```

```html
<!-- ./src/components/Header.svelte -->
<header>
  <t>Welcome</t>
</header>
```
```javascript
// ./src/helpers.js
const string = `<t>Welcome to ${name}</t>`
```



##### Después...
```
.
├── src
|   ├── __generated__
|   |   └── es
|   |   |   └── components
|   |   |   |   └── Header.svelte
|   |   |   |   └── NoTranslations.svelte
|   |   |   └── helpers.js
|   |   |   └── App.svelte
|   |   └── fr
|   |   |   └── components
|   |   |   |   └── Header.svelte
|   |   |   |   └── NoTranslations.svelte
|   |   |   └── helpers.js
|   |   |   └── App.svelte
|   └── components
|   |   └── Header.svelte
|   |   └── NoTranslations.js
|   └── helpers.js
|   └── App.svelte
|   └── main.js
```

```html
<!-- ./src/__generated__/fr/components/Header.svelte -->
<header>
  <t>Bienvenue</t>
</header>
```
```javascript
// ./src/__generated__/fr/helpers.js
const string = `<t>Bienvenue sur ${name}</t>`
```


El paquete también produce un archivo JSON (especificado) con tus traducciones, por lo que puedes cargar desde el archivo, ajustando las traducciones después de la ejecución inicial. 

```json
[
  {
    "_src": "./src/components/Header.svelte",
    "en": "Welcome",
    "es": "Bienvenidos",
    "fr": "Bienvenue"
  },
  {
    "_src": "./src/helpers.js",
    "en": "Welcome to ${name}",
    "es": "Bienvenido a ${name}",
    "fr": "Bienvenue sur ${name}"
  },
]
```

Este archivo permite el control de versiones de tus traducciones, también permite realizar pruebas A/B de tus traducciones de manera bastante sencilla.

Consulta el [Example Svelte.js](./example-svelte) o [Example Vue.js](./example-vue) para ver cómo podría verse tu proyecto.

## Requisitos
* Node.js > 10
* Cuenta de Google Cloud Translate + Clave API

## Primeros pasos

### Instalación
`npm install --save-dev jamstack-translate`

### Uso
Crea un archivo en tu directorio raíz (ej: translate.js)
```javascript
require('dotenv').config()
const translate = require('../index.js');

const GOOGLEKEY = process.env.GOOGLE_API_KEY
const OPTIONS = {
  targetLanguages: [
    'fr',
    'es',
  ],
  targetFiles: [
    './src/App.svelte',
    './src/components/**/*.svelte',
    './src/views/**/*.svelte',
    './src/helpers.js',
    // etc
  ],
  targetDirectory: './src/__generated__/',
  sourceDirectory: './src/',
  translationFile: './translations.json',
  loadTranslationsFromFile: true,
}

const init = async () => {
  const result = await translate(GOOGLEKEY, OPTIONS);
  console.log(result);
}

init();
```

### Ejecución
luego simplemente ejecuta
`node translate.js`

---

## Problemas actuales, mejores prácticas y cómo evitarlos
El paquete realiza una búsqueda y reemplazo básica con expresiones regulares para abordar la mayoría de los problemas (causados en su mayoría por Google Translate), estos son los problemas actualmente activos y observados.

Para la mayoría de los problemas, puedes corregirlos manualmente en tu archivo JSON creado y compilar con las correcciones.

#### Clases CSS BEM (Modificador)
 
Actualmente, esto...
```html
<t><span class="text--green">hello</span> there</t>
```
Se convierte en...
```html
<t><span class="text - green"> bonjour </span> là</t>
```

#### Comillas simples cuando están dentro de un archivo JS

Actualmente, si traduces una cadena dentro de un archivo JS, como así...
```js
const string = '<t>Please</t>'
```
Se convierte en 
```js
const string = '<t>S'il vous plaît</t>'
```

Lo cual no está escapado y causará un error de compilación/ejecución. 

Es mejor usar comillas invertidas (backticks) en lugar de comillas simples.
```js
const string = `<t>Please</t>`
```

Si no puedes usar comillas invertidas, debes escapar manualmente las comillas simples creadas en tu archivo JSON y compilar con las correcciones. 
```json
[
 {
  _file: "file.html",
  en: "Please",
  fr: "S\\'il vous plaît"
 }
]
```


---

## Uso con frameworks de JS

#### TLDR
Para cada nueva carpeta de idioma que crees, crea un nuevo archivo de entrada (multi entrada) para tu aplicación y dirige las importaciones respectivas a su carpeta de idioma. Luego, en tu archivo `index.html`, carga dinámicamente tu `bundle.js` dependiendo de tu método de selección de idiomas (yo prefiero los parámetros de URL `?lng={language}`).


### Ejemplo completo
*Nota: Lo siguiente es con Rollup/Svelte v3, otra documentación para webpack, etc., estará disponible pronto.*

#### Archivos de entrada
Crea nuevos archivos main.js para cada nuevo idioma,
```
.
├── src
|   └── App.svelte
|   └── main-es.js <<<< New
|   └── main-fr.js <<<< New
|   └── main.js
```

Edita cada nuevo archivo main y apunta a tu nuevo archivo de entrada

`main-fr.js`
```javascript
import App from './__generated__/fr/App.svelte';

const app = new App({
	target: document.body,
	props: {
	  name: 'world'
	}
});

export default app;
```

#### Empaquetador (Rollup.js)

Genera un nuevo bundle para cada archivo main

`Rollup.config.js`
```javascript
//...
import multiInput from 'rollup-plugin-multi-input';

export default {
	input: [{
		bundle_en: 'src/main.js',
		bundle_fr: 'src/main-fr.js',
		bundle_es: 'src/main-es.js',
	}],
	output: {
		sourcemap: true,
		name: 'app',
		format: 'es',
		dir: 'public/build'
	},
	plugins: [
		multiInput(),
		// ...
```


#### Index.html (usando el nuevo bundle)
En tu HTML, en lugar de una etiqueta script para bundle.js, carga dinámicamente tu nuevo bundle dependiendo del parámetro de consulta `?lng={language}`
```html
<!-- <script defer src='/build/bundle.js'></script> -->
<script>
	var urlParams = new URLSearchParams(window.location.search);
	var language = urlParams.get('lng') || 'en';
	language = language.toLowerCase()

	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'module';
	script.src = '/build/bundle_' + language + '.js';
	head.appendChild(script);
</script>

```

#### Probando cada idioma
Y luego úsalo así:

`http://localhost:5000/?lng=es`

## TODO
- [x] Probar archivos HTML estáticos (`index.html` => `fr/index.html`)
- [x] Analizar carpeta de destino (src) en busca de todas las etiquetas <t>.
- [x] Generar archivo JSON de salida.
- [x] Cargar archivo JSON como entrada.
- [x] Copiar `src/` a `src/__generated__/${lang}/`
- [x] Reemplazar cada `src/__generated__/${lang}/` con sus traducciones.
- [x] Limpiar el archivo translation.json, hay duplicados en él.
- [x] Generar carpeta `__generated__` y las carpetas de idioma dentro.
- [x] Refactorizar, listo para pruebas
- [ ] Copia de otras carpetas (no traducidas) en `dist`.
- [ ] Permitir traducciones de `<title>`, ya que esto se analiza como una cadena dentro del html. ¿Hacer reemplazo?
- [ ] Probar inicio de React.js cli
- [x] Independiente del framework
- [x] Probar inicio de Svelte.js cli
- [x] Probar inicio de Vue.js cli
- [ ] Soporte para TypeScript
- [ ] Pruebas

## Metas adicionales
- [ ] Investigar una "palabra clave de escape" para variables. Sin la variable de Handlebars ${var}, Google Translate puede transformar nuestras variables: `{name}` se convierte en `{nombre}`, etc.
  - [ ] Idea de triple guion bajo: `<t>Hello ___{name}___</t>` => `<t>Hola {name}</t>`
