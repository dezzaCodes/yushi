import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import thunk from 'redux-thunk';
import rootReducer from './reducers';

// relevant article
//https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60
/**
 * create the store of redux
 */
const initialState = {};
const middleware = [thunk];
const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
