# openIMIS frontend assembly

## running

this repository builds:

- a docker image `ghcr.io/openimis/openimis-fe` that can be use in a docker compose
- a minified js application that can be served by any webserver (see release)

the build content is defined by the openimis.json file

more information for:
 
  - [docker Windows](/docs/WINDOWS_DOCKER.md) 
  - [docker Linux](/docs/LINUX_DOCKER.md)
  - [reverse proxy toward other openIMIS services](/docs/reverse_proxy.md)

## Developers setup

### To start working in openIMIS as a (module) developer:

<table align="center"><tr><td>When programming for openIMIS frontend, the shared (with openimis-fe_js) dependencies (react,...) must be declared as *peerDependencies* in your package.json file. You are also highly encouraged to used the features provided in the openimis-fe-core module. This includes (but is not limited to) main menu entries, date handling, user info,... 
Another important point is NOT TO HAVE in backend db table user_Core (managed by Django) user called 'admin' or 'Admin'. This could case defects while running frontend via command `yarn start`.
This issue is related to the link between userCore and tblUser tables.</td></tr></table>

- clone this repo (creates the `openimis-fe_js` directory)
- install node (node V16.x)
- install yarn
- within `openimis-fe_js` directory
  - generate the openIMIS modules dependencies and locales (from openimis.json config): `yarn load-config` or `yarn load-config openimis.json`
  - install openIMIS technical dependencies: `yarn install`
  - start openIMIS frontend (in development mode): `yarn start`

### To start working in openIMIS as a (module) for production with git / shh / urls for dependencies:

- within `openimis-fe_js` directory

  - generate the openIMIS modules dependencies and locales (from openimis.json config): `yarn load-config` or `yarn load-config openimis.json`
  - clean yarn cache in case local directory / git /link are used: `yarn cache clean`
  - install openIMIS technical dependencies: `yarn install`
  - build openIMIS frontend (in development mode): `yarn build`
  - copy the build folder on the webserver

#### using npm

    ```{
    	"name": "CoreModule", // If name is not provided, it will assume the module is exported as the `default` module
    	"npm": "@openimis/fe-core@1.2.0-rc15"
    }```

At this stage, your browser opened on localhost:3000 with current openIMIS frontend.
In developement mode, the frontend connects to the backend via a proxy configuration, expecting to reach the backend on localhost:8000 (cfr. /package.json file, "proxy" entry).

### To edit (modify) an existing openIMIS module (e.g. `@openimis/fe-claim`)

- checkout the module's git repo NEXT TO (not within!) `openimis-fe_js` directory and create a git branch for your changes
- from `openimis-fe-claim_js`
  - install module dependencies: `yarn install`
  - build current (dev) version of the module: `yarn build`
  - prepare a linkable version of your local package: `yarn link`
- from `openimis-fe_js`
  - uninstall the packaged module you want to work on (example @openimis/fe-claim): `yarn remove @openimis/fe-claim`
  - link the local version of the module: `yarn link "@openimis/fe-claim"`

Note:

- It is not necessary to register a linked module in the package.json file
- To unlink a previously linked package: `yarn unlink "@openimis/fe-claim"`
- [OPTIONAL] To enable live reload of the module, from `openimis-fe-claim_js`, activate the watch: `yarn start` (if configured into the `package.json` of the module)

### To create a new openIMIS module (e.g. `@openimis/fe-mymodule`)

- create a (git-enabled) directory next to the other modules: `/openimis-fe-mymodule_js`.
  Note: the module name can be different from the directory/github repo. The npm repo has an @openimis scope to group all openIMIS modules
- to be integrated in openIMIS ecosystem, you module should provide an entry entity (e.g. MyModule) with its contributions (MainMenu entries,...).
- prepare a linkable version of your local package: `yarn link` (from within `/openimis-fe-mymodule_js`)
- from /openimis-fe_js:
  - install the linkable version of your package: `yarn link @openimis/fe-mymodule`
  - add your module (name and entry entiry) in `openimis.json` and regenerate the modules import script: `node module-requirements.js`
    Note: to ease development lifecycle, please consider using the 'rollup' mechanism (see @openimis/fe-core for an example)

### To create a distinct implementation of an existing openIMIS module (e.g. `@openimis/fe-location-dhis2`)

Unlike backend modules, there is 'shared logical name' between distinct implementations of a same 'module'.
If you want to provide an distinct implementation for locations (example), just create a separate module, with a distinct module name and ensure the packaging (distribution) picks your module (and not the reference implementation).

### To publish (in npm central repo) the modified (or new) module

- adapt your package.json (bump version number, ensure license is mentioned,...)
- commit your changes to the git repo and merge to master
- tag the git repo according to your new version number
- publish to npm central repo: `npm publish` (from within `/openimis-fe-mymodule_js`)
  Note: you'll need to login,... (cfr. https://docs.npmjs.com/cli/publish)

## Distributor setup

Note:
As a distributor, you may want to run an openIMIS version without docker. To do so, follow developers setup here above (up to starting the server with yarn start).

### To create an openIMIS Frontend distribution

- clone this repo (creates the openimis-fe_js directory) and create a git branch (named according to the release you want to bundle)
- adapt the openimis-fe_js/openimis.json to specify the modules (and their versions) to be bundled
- make release candidates docker image from openimis-fe_js/: `docker build . -t openimis-fe-2.3.4`
- run the docker image: `docker run -p 8080:80 openimis-fe-2.3.4` (exposing the 80 port to 8080 port of docker host)

When release candidate is accepted:

- commit your changes to the git repo
- tag the git repo according to your new version number
- upload openimis-be docker image to docker hub

Note: This image only provides the openimis frontend server. The full openIMIS deployment (with the backend,...) is managed from openimis-dist_dck repo and its docker-compose.yml file.

## Developer tools

### To download from repository frontend module and build it locally in single command

- from `/openimis-fe_js`:
  - run this command: `node dev_tools/installModuleLocally.js <repourl> <branch>`
  - for example `node dev_tools/installModuleLocally.js https://github.com/openimis/openimis-fe-contract_js.git develop`
- this command executes every steps to install module locally. Those steps are:

  1. Download module from GitHub repository using git clone.
  2. Go into module directory
  3. Within this directory run `yarn install` , `yarn build` and `yarn link` (according to that provided order)
  4. Within openimis-fe_js:

  - execute `yarn remove @openimis/fe-invoice`

  - In openimis.json openimis add:

    ```json
    {
      "name": "ContractModule",
      "npm": "@openimis/fe-contract@0.1.0"
    }
    ```

  - Edit package.json - in "dependencies" put or update this module that you want to run from local environment:

    ```json
       {
         ...
         "dependencies": {
             ...
             "@openimis/fe-contract": "file:../openimis-fe-contract_js",
             ...
         }
         ...
       }
    ```

  - execute `node modules-config.js`

  - run `yarn link <module>` for example: `yarn link "@openimis/fe-contract"`

  - run `yarn install`

- after this you can execute `yarn start` and you should see local module in your imis application.

### To add github workflows files to the particular module

- from `/openimis-fe_js`:
  - run this command: `node dev_tools/addCIToModule.js <moduleNameDirectory>`
  - for example `node dev_tools/addCIToModule.js openimis-fe-invoice_js`
- this command allows to add files to execute CI on every PR and allows to publish to npm.
- if `.github/workflows` doesn't exist in particular module, this directories are created while running this command
- files to be added through that command based on provided templates:
  - CI_and_build.yml
  - npmpublish.yml
- those files are saved in `.github/workflows`

### To fetch all modules and install them from local directories

- from `/openimis-fe_js`:
  - run this command: `node dev_tools/installModuleLocallyAll.js`. This command will execute all required steps
    to fetch all modules present in `openimis.json` from the git repositories and install them as editable libraries.


## Managing translations/localization

### To add new translation/localisations:
- create separate new module based on [frontend template module](https://github.com/openimis/openimis-fe-template_js). 
- this module should be named like: `openimis-fe-language_{lang}_js` for example `openimis-fe-language_es_js` (Spanish language)
- add to this module such files as: `.babelrc`, `.gitignore`, `.estlintrc`
- within `src/translation` add `{lang}.json` file for example `es.json`
- in `index.js` within `src` modified (for example we want to have 'es' Spanish language):
```js
       import messages_es from "./translations/es.json";

       const DEFAULT_CONFIG = {
           "translations": [{ key: "es", messages: messages_es }],
       }

       export const LanguageEsModule = (cfg) => {
           return { ...DEFAULT_CONFIG, ...cfg };
       }
```
- build your new module with translations by typing within this module `yarn build`, `yarn install` and `yarn link` commands.
- in `tblLanguages` on database level add new language for example 'es' (Spanish language)
- within assembly frontend module `openimis-fe_js` in `openimis.json` add language key for new language/localization for example:
```json
      ...
       "locales": [
       {
          "languages": [
            "es",
            "es-ES"
          ],
          "intl": "es-ES",
          "fileNames": "es"
       },
       {
          "languages": [
            "en",
            "en-GB"
          ],
          "intl": "en-GB",
          "fileNames": "en"
        },
        {
          "languages": [
            "fr",
            "fr-FR"
          ],
          "intl": "fr-FR",
          "fileNames": "fr"
        }
      ],
      ...
```
- in `openimis.json` add also this newly created module with translations
- within `openimis-fe_js/src` in `locales.js` add new language like below:
```js
      export const locales = ["es-ES","en-GB","fr-FR"]
      export const fileNamesByLang = {"es":"es", "es-ES":"es","en":"en","en-GB":"en","fr":"fr","fr-FR":"fr"}
      export default {"es":"es-ES", "es-ES": "es-ES","en":"en-GB","en-GB":"en-GB","fr":"fr-FR","fr-FR":"fr-FR"}  
```
- type `yarn build` and if success - type `yarn start` and you should see this translation in your app (go to 'users' page, select user, change language into the newly provided, refresh page and you should see texts in changed language)
- if you encounter any problems by that point, run `yarn load-config` in the main module
- there is also possibility to overwrite particular language for example 'English' into 'Gambian English' (without changes on database level). In your new translation module in index.js (for example new module called `openimis-fe-language_en_gm_js`):
 ```js
       import messages_en from "./translations/en.json";

       const DEFAULT_CONFIG = {
           "translations": [{ key: "en", messages: messages_en }],
       }

       export const LanguageEnGmModule = (cfg) => {
           return { ...DEFAULT_CONFIG, ...cfg };
       }
```
- this approach overwrites default `en` language translations into `en-gm` (Gambian English) translations without adding new language on database level and without changing 'locales' in 'openimis.json' and 'locales.js' file both on assembly frontend module (openimis-fe_js). 


## Handling errors while running openIMIS app - the most common ones

### Handling error with ` no content display` after running frontend
Based on error reported on that [ticket](https://openimis.atlassian.net/browse/OSD-176)

Description of error: 
* after `yarn start` the page loads but no content is display
* sometimes it just keeps spinning the loader
* web console doesn't show any errors

How to solve this? 
* double check if you use proper versions of backend/frontend modules (assembly and core ones)
* make sure you have the latest version of dockerized database

Conclusions:
* The reason of this error is usually using not up-to-date assembly and core modules (both backend and frontend ones)


### Handling error with `400 error` after running frontend
Based on error reported on that [ticket](https://openimis.atlassian.net/browse/OSD-181)

Description of error: 
* modular openIMIS deployed on server
* backend is set on port 8000, frontend is set on port 3000
* backend works fine, no errors
* it is not possible to reach both login and home page due to 400 error
* web console doesn't show any errors

How to solve this? 
* double check if you use proper versions of backend/frontend modules (assembly and core ones)
* make sure you added env variables on backend side (site root/sire url)
* double check value for `proxy` key in package.json (IMPORTANT: be careful with this setting on production environment) 

Conclusions:
* The reason of this error is usually not setting up env variables on backend side and wrong value for `proxy` key


### How to report another issues? 
If you face another issues not described in that section you could use our [ticketing site](https://openimis.atlassian.net/servicedesk/customer/portal/1). 
Here you can report any bugs/problems you faced during setting up openIMIS app. 
