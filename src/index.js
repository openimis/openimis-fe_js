import React from "react";
import ReactDOM from "react-dom";
<<<<<<< HEAD
import { MuiThemeProvider } from "@material-ui/core";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import theme from "./helpers/theme";
import store from "./helpers/store";
import LocalesManager from "./LocalesManager";
import ModulesManager from "./ModulesManager";
import { App } from "@openimis/fe-core";
import messages_ref from "./translations/ref.json";
=======
import * as serviceWorker from "./serviceWorker";
import ModulesManager from "./ModulesManager";
import { App } from "@openimis/fe-core";

>>>>>>> develop
import "./index.css";
import logo from "../public/openIMIS.png";


const localesManager = new LocalesManager();
const modulesManager = new ModulesManager();
const reducers = modulesManager
    .getContributions('reducers')
    .reduce((reds, red) => { reds[red.key] = red.reducer; return reds }, []);

<<<<<<< HEAD
const app = (
    <MuiThemeProvider theme={theme}>
        <Provider store={store(reducers)}>
            <App
                localesManager={localesManager}
                modulesManager={modulesManager}
                messages={messages_ref}
                logo={logo}
            />
        </Provider>
    </MuiThemeProvider>
);
ReactDOM.render(app, document.getElementById("root"));
=======
ReactDOM.render(<App modulesManager={new ModulesManager()}/>, document.getElementById("root"));
>>>>>>> develop
serviceWorker.register();
