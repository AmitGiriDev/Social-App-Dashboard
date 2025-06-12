import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import {dummyJsonApi, reqresApi} from '../services/api';

let loggerMiddleware = [];

if (__DEV__) {
  const {createLogger} = require('redux-logger');
  const logger = createLogger({
    collapsed: true,
    diff: true,
  });
  loggerMiddleware.push(logger);
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [dummyJsonApi.reducerPath]: dummyJsonApi.reducer,
    [reqresApi.reducerPath]: reqresApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      dummyJsonApi.middleware,
      reqresApi.middleware,
      ...loggerMiddleware,
    ),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
