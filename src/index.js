import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from "react";
import ReactDOM from "react-dom";
import { MuiThemeProvider, LinearProgress } from "@material-ui/core";
import { Provider } from "react-redux";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import * as serviceWorker from "./serviceWorker";
import history from './helpers/history';
import theme from "./helpers/theme";
import store from "./helpers/store";
import LocalesManager from "./LocalesManager";
import ModulesManager from "./ModulesManager";
import ModulesManagerProvider from "./ModulesManagerProvider";
import { App, FatalError, baseApiUrl, apiHeaders } from "@openimis/fe-core";
import messages_ref from "./translations/ref.json";
import "./index.css";
import logo from "../public/openIMIS.png";
import HistoryProvider from "./HistoryProvider";

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
    const cfgs = cfg.data.moduleConfigurations.reduce((cfgs, c) => {
        try {
            cfg = JSON.parse(c.config)
            cfgs[c.module] = { controls: c.controls, ...cfg };
        } catch (error) {
            console.error(`Failed to parse module ${c.module} config`, error);
        }
        return cfgs
    }, []);
    const localesManager = new LocalesManager();
    const modulesManager = new ModulesManager(cfgs);
    const reducers = modulesManager
        .getContribs('reducers')
        .reduce((reds, red) => { reds[red.key] = red.reducer; return reds }, []);
    const app = (
        <MuiThemeProvider theme={theme}>
            <Provider store={store(reducers)}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <HistoryProvider history={history}>
                        <ModulesManagerProvider modulesManager={modulesManager}>
                            <App
                                localesManager={localesManager}
                                messages={messages_ref}
                                logo={logo}
                            />
                        </ModulesManagerProvider>
                    </HistoryProvider>
                </MuiPickersUtilsProvider>
            </Provider>
        </MuiThemeProvider>
    );
    ReactDOM.render(app, document.getElementById("root"));
}



const payload = `
{
    moduleConfigurations { module, config, controls{field, usage}}
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
