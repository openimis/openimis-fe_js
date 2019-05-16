import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import history from "./history";
import * as serviceWorker from "./serviceWorker";
import store from "./store";
import App from "./App";
import { MuiThemeProvider } from "@material-ui/core";
import themeColors from "./helpers/themeColors";
import modules from "./modules";

import "./index.css";

const app = (
  <MuiThemeProvider theme={themeColors}>
    <Provider store={store}>
      <Router history={history}>
        <App modules={modules}/>
      </Router>
    </Provider>
  </MuiThemeProvider>
);

ReactDOM.render(app, document.getElementById("root"));
serviceWorker.register();
