// src/helpers/store.jsx
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { apiMiddleware } from 'redux-api-middleware';
import { loadState, saveState } from './localStorage';

const persistedState = loadState();

const store = (reducers = {}, extraMiddlewares = []) => {
  return configureStore({
    reducer: combineReducers(reducers),
    preloadedState: persistedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiMiddleware, ...extraMiddlewares),
    devTools: process.env.NODE_ENV === 'development',
  });
};

export default store;