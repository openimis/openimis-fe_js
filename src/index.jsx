import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { MuiThemeProvider, LinearProgress } from "@material-ui/core";
import { Provider } from "react-redux";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import * as serviceWorker from "./serviceWorker";
import theme from "./helpers/theme";
import store from "./helpers/store";
import LocalesManager from "./LocalesManager";
import ModulesManager from "./ModulesManager";
import ModulesManagerProvider from "./ModulesManagerProvider";
import { App, FatalError, baseApiUrl, apiHeaders } from "@openimis/fe-core";
import messages_ref from "./translations/ref.json";
import "./index.css";
import logo from "./openIMIS.png";

const loadConfiguration = async () => {
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: "post",
    headers: apiHeaders(),
    body: JSON.stringify({ "query": "{ moduleConfigurations { module, config, controls{ field, usage } } }" }),
  });
  if (!response.ok) {
    throw response;
  } else {
    const { data } = await response.json();
    data.moduleConfigurations.unshift({});
    const out = data.moduleConfigurations.reduce((acc, c) => {
      try {
        acc[c.module] = { controls: c.controls, ...JSON.parse(c.config) };
      } catch (error) {
        console.error(`Failed to parse module ${c.module} config`, error);
      }
      return acc;
    });
    return out;
  }
};

const AppContainer = () => {
  const [appState, setAppState] = React.useState({ isLoading: true, config: undefined, error: null });
  const localesManager = new LocalesManager();

  useEffect(() => {
    loadConfiguration().then(
      (config) =>
        setAppState({
          error: null,
          isLoading: false,
          config,
        }),
      (error) =>
        setAppState({
          error,
          isLoading: false,
        }),
    );
  }, []);

  if (appState.isLoading) {
    return (
      <MuiThemeProvider theme={theme}>
        <LinearProgress className="bootstrap" />
      </MuiThemeProvider>
    );
  } else if (appState.error) {
    return (
      <FatalError
        error={{
          code: appState.error.status,
          message: appState.error.statusText,
        }}
      />
    );
  } else {
    const modulesManager = new ModulesManager(appState.config);
    const reducers = modulesManager.getContribs("reducers").reduce((reds, red) => {
      reds[red.key] = red.reducer;
      return reds;
    }, []);

    const middlewares = modulesManager.getContribs("middlewares");

    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store(reducers, middlewares)}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <ModulesManagerProvider modulesManager={modulesManager}>
              <App
                basename={process.env.PUBLIC_URL}
                localesManager={localesManager}
                messages={messages_ref}
                logo={logo}
              />
            </ModulesManagerProvider>
          </MuiPickersUtilsProvider>
        </Provider>
      </MuiThemeProvider>
    );
  }
};

ReactDOM.render(<AppContainer />, document.getElementById("root"));
serviceWorker.register();
