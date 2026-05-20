import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import * as Sentry from "@sentry/react";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { IntlProvider } from "react-intl";
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

Sentry.init({ 
  dsn: process.env.REACT_APP_SENTRY_DSN,
  debug: false,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
});

const loadConfiguration = async () => {
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: "post",
    headers: apiHeaders(),
    body: JSON.stringify({ "query": "{ moduleConfigurations { module, config, controls{ field, usage } } }" }),
  });
  if (!response.ok) {
    Sentry.captureException(new Error(`${response.status} ${response.statusText}`));
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
      (config) => {
        setAppState({
          error: null,
          isLoading: false,
          config,
        });
      },
      (error) => {
        Sentry.captureException(new Error("Failed to load configuration"));
        setAppState({
          error,
          isLoading: false,
        });
      }
    );
  }, []);  

  const themeColor = appState?.config?.["fe-core"]?.theme;
  const dynamicTheme = createAppTheme(themeColor || {});
  const logo = getConfiguredLogo(appState.config);
  const disableTextLogo = appState?.config?.["fe-core"]?.logo?.disableTextLogo || false;

  if (appState.isLoading) {
    return (
      <MuiThemeProvider theme={dynamicTheme}>
        <LinearProgress className="bootstrap" />
      </MuiThemeProvider>
    );
  } else if (appState.error) {
    const localesManager = new LocalesManager();
    const locale = localesManager.getLocale();
    return (
      <IntlProvider locale={locale} messages={messages_ref}>
        <FatalError
          error={{
            code: appState.error.status,
            message: appState.error.statusText,
          }}
        />
      </IntlProvider>
    );
  } else {
    const modulesManager = new ModulesManager(appState.config);
    const reducers = modulesManager.getContribs("reducers").reduce((reds, red) => {
      reds[red.key] = red.reducer;
      return reds;
    }, []);

    const middlewares = modulesManager.getContribs("middlewares");
    
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

ReactDOM.render(
  <Sentry.ErrorBoundary
    fallback={<FatalError error={{ code: 500, message: "An unexpected error occurred" }} />}
    showDialog
  >
    <AppContainer />
  </Sentry.ErrorBoundary>,
  document.getElementById("root")
);

serviceWorker.register();
