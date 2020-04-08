import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import { loadState } from "./localStorage";
import { apiMiddleware } from "redux-api-middleware";

const persistedState = loadState();

const middlewares = [thunk, apiMiddleware];

const composeEnhancers =
  process.env.NODE_ENV === "development" &&
  typeof window === "object" &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const store = reducers => createStore(
  combineReducers({ ...reducers }),
  persistedState,
  composeEnhancers(applyMiddleware(...middlewares)),
);

export default store;
