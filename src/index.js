import React from "react";
import ReactDOM from "react-dom";
import { MuiThemeProvider, LinearProgress } from "@material-ui/core";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import theme from "./helpers/theme";
import store from "./helpers/store";
import LocalesManager from "./LocalesManager";
import ModulesManager from "./ModulesManager";
import ModulesManagerProvider from "./ModulesManagerProvider";
import { App, FatalError, baseApiUrl, apiHeaders } from "@openimis/fe-core";
import messages_ref from "./translations/ref.json";
import "./index.css";
import logo from "../public/openIMIS.png";

const fatalError = (resp) => {
    const app = (
        <FatalError error={
            {
                code: resp.status,
                message: resp.statusText
            }
        } />
    );
    ReactDOM.render(app, document.getElementById("root"));
}

const bootApp = (cfg) => {
    const cfgs = cfg.data.coreModuleConfigurations.reduce((cfgs, c) => { 
        cfgs[c.module] = { controls: c.controls,...JSON.parse(c.config)};
        return cfgs 
    }, []);
    const localesManager = new LocalesManager();
    const modulesManager = new ModulesManager(cfgs);
    const reducers = modulesManager
        .getContributions('reducers')
        .reduce((reds, red) => { reds[red.key] = red.reducer; return reds }, []);
    const app = (
        <MuiThemeProvider theme={theme}>
            <Provider store={store(reducers)}>
                <ModulesManagerProvider modulesManager={modulesManager}>
                    <App
                        localesManager={localesManager}
                        messages={messages_ref}
                        logo={logo}
                    />
                </ModulesManagerProvider>
            </Provider>
        </MuiThemeProvider>
    );
    ReactDOM.render(app, document.getElementById("root"));
}



let payload = `
{
    coreModuleConfigurations { module, config, controls{fieldName, usage}}
}
`;
fetch(`${baseApiUrl}/graphql`,
    {
        method: "post",
        headers: apiHeaders(),
        body: JSON.stringify({ "query": payload }),
    }
).then(resp => {
    if (!resp.ok) {
        fatalError(resp);
    } else {
        resp.json().then(cfg => bootApp(cfg));
    }
});


const app = <LinearProgress className="bootstrap" />;

ReactDOM.render(app, document.getElementById("root"));
serviceWorker.register();
