import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { MuiThemeProvider, LinearProgress } from "@material-ui/core";
import { Provider } from "react-redux";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import * as serviceWorker from "./serviceWorker";
import createAppTheme from "./helpers/theme";
import store from "./helpers/store";
import LocalesManager from "./LocalesManager";
import ModulesManager from "./ModulesManager";
import ModulesManagerProvider from "./ModulesManagerProvider";
import { App, FatalError, baseApiUrl, apiHeaders } from "@openimis/fe-core";
import getConfiguredLogo from "./helpers/logo";
import messages_ref from "./translations/ref.json";
import "./index.css";
import "./rc-cascader.css";


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

export function isKeycloakEnabled(config) {
  return config?.["fe-core"]?.isKeycloakEnabled === true;
}

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

  const themeColor = appState?.config?.["fe-core"]?.theme;
  const dynamicTheme = createAppTheme(themeColor || {});
  const logo = getConfiguredLogo(appState.config);
  const disableTextLogo = appState?.config?.["fe-core"]?.logo?.disableTextLogo || false

  // ...existing code...


  if (appState.isLoading) {
    return (
      <MuiThemeProvider theme={dynamicTheme}>
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
    
    // Ensure window.keycloakConfig is populated from ModuleConfiguration so legacy code
    // and compiled packages depending on this global keep working. Preference order:
    // ModuleConfiguration (fe-core.keycloak) -> sensible defaults
    if (typeof window !== 'undefined') {
      try {
        const moduleKeycloak = modulesManager.getConf('fe-core', 'keycloak', null);
        const keycloakEnabled = modulesManager.getConf('fe-core', 'isKeycloakEnabled', false);
        if (moduleKeycloak && moduleKeycloak.serverUrl && moduleKeycloak.realm && moduleKeycloak.clientId && moduleKeycloak.redirectUri) {
          window.keycloakConfig = {
            enabled: keycloakEnabled === true,
            serverUrl: moduleKeycloak.serverUrl,
            realm: moduleKeycloak.realm,
            clientId: moduleKeycloak.clientId,
            redirectUri: moduleKeycloak.redirectUri,
          };
        } else {
          window.keycloakConfig = { enabled: false };
          if (keycloakEnabled) console.error('[Keycloak] Bad backend configuration: fe-core.keycloak missing or incomplete. The Keycloak button is disabled.');
        }
      } catch (e) {
        console.warn('Could not populate window.keycloakConfig from modulesManager:', e);
      }
    }

    return (
      <MuiThemeProvider theme={dynamicTheme}>
        <Provider store={store(reducers, middlewares)}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <ModulesManagerProvider modulesManager={modulesManager}>
              <App
                basename={process.env.PUBLIC_URL}
                localesManager={localesManager}
                messages={messages_ref}
                logo={logo}
                disableTextLogo={disableTextLogo}
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

