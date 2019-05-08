import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import { saveState, loadState } from "./helpers/localStorage";
import { apiMiddleware } from "redux-api-middleware";

import rootReducer from "./reducers/index";

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

const store = createStore(
  combineReducers({ ...rootReducer }),
  persistedState,
  composeEnhancers(applyMiddleware(...middlewares)),
);

store.subscribe(() => {
  saveState({
    auth: store.getState().auth,
  });
});

export default store;
