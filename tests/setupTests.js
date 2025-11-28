import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

jest.mock('react-redux', () => ({
  connect: () => (x) => x,
  Provider: ({ children }) => children,
  useDispatch: () => jest.fn(),
  useSelector: () => ({}),
}));

jest.mock('@material-ui/core', () => ({
  MuiThemeProvider: ({ children }) => children,
  LinearProgress: () => null,
  MuiPickersUtilsProvider: ({ children }) => children,
}));

jest.mock('../src/helpers/logo', () => () => 'mockLogo');
jest.mock('../src/translations/ref.json', () => ({}));
jest.mock('../src/helpers/store', () => () => ({
  getState: () => ({}),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
}));

import { configure, render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import messages from '../src/translations/ref.json';
configure({ testIdAttribute: 'data-testid' });

const TestProvider = ({ children }) => (
  <IntlProvider locale="en" messages={messages}>
    {children}
  </IntlProvider>
);

import { createStore } from 'redux';
import rootReducer from '../src/helpers/store.js';
const renderWithRedux = (
  component,
  { initialState, store = createStore(rootReducer, initialState) } = {}
) => {
  return {
    ...render(<TestProvider><component store={store} /></TestProvider>),
    store,
  };
};

export * from '@testing-library/react';
export { renderWithRedux, TestProvider };
