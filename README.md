# openIMIS Frontent Reference Implementation
This repository holds the configuration files for the openIMIS Frontend Reference Implementation.
It serves 2 distinct use cases:
- developers who want to implement new modules or modify existing frontend modules of openIMIS
- distributors who want to assemble modules into a Docker image for delivery

This repo branches, tags,... are maintained by openIMIS official delivery team who use it to build the official openIMIS Docker images containing the official modules (versions) list.

In case of troubles, please consult/contact our service desk via our [ticketing site](https://openimis.atlassian.net/servicedesk/customer).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Developers setup

### To start working in openIMIS as a (module) developer:
<table align="center"><tr><td>When programming for openIMIS frontend, you are highly encouraged to used the features provided in the openimis-fe-core module. This includes (but is not limited to) date handling, user info,...</td></tr></table>

* clone this repo (creates the `openimis-fe_js` directory)
* install node (version 10)
* install yarn
* within `openimis-fe_js` directory
  * install openIMIS technical dependencies: `yarn install`
  * generate the openIMIS modules dependencies (from openimis.json config): `node modules-requirements.js`
  * install openIMIS current modules: `source ./modules-installs.txt`
  * start openIMIS frontend (in development mode): `yarn start`

At this stage, your browser opened on localhost:3000 with current openIMIS frontend.
In developement mode, the frontend connects to the backend via a proxy configuration, expecting to reach the backend on localhost:8000 (cfr. /package.json file, "proxy" entry).

### To edit (modify) an existing openIMIS module (e.g. `@openimis/fe-claim`)
* checkout the module's git repo NEXT TO (not within!) `openimis-fe_js` directory and create a git branch for your changes
* from `openimis-fe-claim_js`
  * install module dependencies: `yarn install`
  * build current (dev) version of the module: `yarn build`
  * prepare a linkable version of your local package: `yarn link`
* from `openimis-fe_js`
  * uninstall the packaged module you want to work on (example @openimis/fe-claim): `yarn remove @openimis/fe-claim`  
  * link the local version of the module: `yarn link "@openimis/fe-claim"`
    Note: this command should add an entry in your `package.json - dependencies section`. If not, add manually `"@openimis/fe-claim": "../openimis-fe-claim_js"` in the package.sjon and run `yarn install` to create the link.
[OPTIONAL]
To enable live reload of the module, from `openimis-fe-claim_js`, activate the watch: `yarn watch` (if configured into the `package.json` of the module)
[----------]
### To create a new openIMIS module (e.g. `openimis-fe-mymodule`)

### To create a distinct implementation of an existing openIMIS module (e.g. `openimis-fe-location-dhis2`)

### To publish (in npm central repo) the modified (or new) module

## Distributor setup

### To create an openIMIS Frontend distribution
