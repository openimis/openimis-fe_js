import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import ModulesManager from "./ModulesManager";
import { App } from "@openimis/fe-core";

import "./index.css";

ReactDOM.render(<App modulesManager={new ModulesManager()}/>, document.getElementById("root"));
serviceWorker.register();
