// import "react-app-polyfill/ie11";
// import "react-app-polyfill/stable";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider, LinearProgress } from "@mui/material";
import { Provider } from "react-redux";
<<<<<<< HEAD
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
=======
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
>>>>>>> b8bbb3f76ae01cbd997b70eb0df0c24b7cd8a11e
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
<<<<<<< HEAD

=======
>>>>>>> b8bbb3f76ae01cbd997b70eb0df0c24b7cd8a11e
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: "post",
    headers: apiHeaders(),
    body: JSON.stringify({
      query: `{ moduleConfigurations { module, config, controls { field, usage } } }`,
    }),
  });
<<<<<<< HEAD


  if (!response.ok) throw response;
  const { data } = await response.json();
  console.log(data);

=======
  if (!response.ok) throw response;
  const { data } = await response.json();
  console.log(data);
>>>>>>> b8bbb3f76ae01cbd997b70eb0df0c24b7cd8a11e
  const out = data.moduleConfigurations.reduce((acc, c) => {
    try {
      acc[c.module] = { controls: c.controls, ...JSON.parse(c.config) };
    } catch (error) {
      console.error(`Failed to parse module ${c.module} config`, error);
    }
    return acc;
  }, {});
<<<<<<< HEAD

=======
>>>>>>> b8bbb3f76ae01cbd997b70eb0df0c24b7cd8a11e
  return out;
};

const AppContainer = () => {
  const [appState, setAppState] = React.useState({
    isLoading: true,
    config: undefined,
    error: null,
    modulesManager: null,
  });

  const localesManager = new LocalesManager();

  useEffect(() => {
    const initialize = async () => {
      try {
        const config = await loadConfiguration();
        const modulesManager = await ModulesManager.init(config);
        console.log("[openIMIS] ModulesManager initialized:", modulesManager);
        setAppState({
          config,
          error: null,
          isLoading: false,
          modulesManager,
        });
      } catch (error) {
        console.error("[openIMIS] Error during initialization:", error);
        setAppState({
          error,
          isLoading: false,
        });
      }
    };
    initialize();
  }, []);

  const themeColor = appState?.config?.["fe-core"]?.theme;
  const dynamicTheme = createAppTheme(themeColor || {});
  const logo = getConfiguredLogo(appState.config);
  const disableTextLogo = appState?.config?.["fe-core"]?.logo?.disableTextLogo || false;

  if (appState.isLoading) {
    console.log("[openIMIS] App is loading...");
    return (
      <ThemeProvider theme={dynamicTheme}>
        <LinearProgress className="bootstrap" />
      </ThemeProvider>
    );
  }

  if (appState.error) {
    console.error("[openIMIS] Fatal error state:", appState.error);
    return (
      <FatalError
        error={{
          code: appState.error.status,
          message: appState.error.statusText,
        }}
      />
    );
  }

  const { modulesManager } = appState;
  console.log("[openIMIS] Rendering app with modulesManager:", modulesManager);
  const reducers = modulesManager.getContribs("reducers").reduce((acc, r) => {
    acc[r.key] = r.reducer;
    return acc;
  }, {});
  const middlewares = modulesManager.getContribs("middlewares");

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Provider store={store(reducers, middlewares)}>
<<<<<<< HEAD
        <LocalizationProvider dateAdapter={AdapterMoment}>
=======
        <LocalizationProvider dateAdapter={AdapterDayjs}>
>>>>>>> b8bbb3f76ae01cbd997b70eb0df0c24b7cd8a11e
          <ModulesManagerProvider modulesManager={modulesManager}>
            <App
              basename={process.env.PUBLIC_URL}
              localesManager={localesManager}
              messages={messages_ref}
              logo={logo}
              disableTextLogo={disableTextLogo}
            />
          </ModulesManagerProvider>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  );
};

ReactDOM.render(<AppContainer />, document.getElementById("root"));
serviceWorker.register();