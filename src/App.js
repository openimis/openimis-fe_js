import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import './App.css';
import { CssBaseline } from '@material-ui/core';
import ModulesManager from './ModulesManager';
import { CoreApp } from '@openimis/fe-core';
import modules from './modules';

const styles = theme => ({
  root: {
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  }
});

class App extends Component {
  render() {
    let modulesManager = new ModulesManager(modules);
    return (
      <div className="App">
        <CssBaseline />
        <CoreApp {...this.props} modulesManager={modulesManager} />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(App);

