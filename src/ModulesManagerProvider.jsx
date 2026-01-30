import React from "react";
import PropTypes from "prop-types";
import { modulesManagerCtx } from "@openimis/fe-core";

const ModulesManagerProvider = ({ modulesManager, children }) => (
  <modulesManagerCtx.Provider value={modulesManager}>
    {children}
  </modulesManagerCtx.Provider>
);

ModulesManagerProvider.propTypes = {
  modulesManager: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default ModulesManagerProvider;
