import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import store from "./store";
import App from "./App";
import { MuiThemeProvider } from "@material-ui/core";
import theme from "./helpers/theme";
import modules from "./modules";

import "./index.css";

const app = (
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <App modules={modules} />
    </Provider>
  </MuiThemeProvider>
);

ReactDOM.render(app, document.getElementById("root"));
serviceWorker.register();
