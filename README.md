# openIMIS Frontend Reference Implementation : Windows Docker

This repository holds the configuration files for the openIMIS Frontend Reference Implementation:

- Legacy web application
- Modular front end

Please look for the direction on the openIMIS Wiki: https://openimis.atlassian.net/wiki/spaces/OP/pages/963182705/MO1.1+Install+the+modular+openIMIS+using+Docker

Note: the modular frontend is part of the release ZIP of the legacy webapp, if the modular frontend need to be changed then new modular frontend static files need to be placed in /inetroot/www/openIMIS/front

Note 2: The docker file can be change to build first the frontend by uncommenting the "downloader" related lines.

This repo branches, tags,... are maintained by openIMIS official delivery team who use it to build the official openIMIS Docker images containing the official modules (versions) list.

In case of troubles, please consult/contact our service desk via our [ticketing site](https://openimis.atlassian.net/servicedesk/customer).

# openIMIS Frontend Reference Implementation : Linux

This repository holds the configuration files for the openIMIS Frontend Reference Implementation.
It serves 2 distinct use cases:

- developers who want to implement new modules or modify existing frontend modules of openIMIS
- distributors who want to assemble modules into a Docker image for delivery

Note: please, refer to [openIMIS Frontend localisation](i18n.md) to provide translations and bind user's language to a locale for data format (dates, numbers,...)

This repo branches, tags,... are maintained by openIMIS official delivery team who use it to build the official openIMIS Docker images containing the official modules (versions) list.

In case of troubles, please consult/contact our service desk via our [ticketing site](https://openimis.atlassian.net/servicedesk/customer).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Developers setup

### To start working in openIMIS as a (module) developer:

<table align="center"><tr><td>When programming for openIMIS frontend, the shared (with openimis-fe_js) dependencies (react,...) must be declared as *peerDependencies* in your package.json file. You are also highly encouraged to used the features provided in the openimis-fe-core module. This includes (but is not limited to) main menu entries, date handling, user info,... 
Another important point is NOT TO HAVE in backend db table user_Core (managed by Django) user called 'admin' or 'Admin'. This could case defects while running frontend via command `yarn start`.
This issue is related to the link between userCore and tblUser tables.</td></tr></table>

- clone this repo (creates the `openimis-fe_js` directory)
- install node
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
