import { STOCK_LOADING, STOCK_SUCCESS, STOCK_FAILURE } from '../actions/types';

const initialState = {
  isFetching: false,
  details: {},
  error: null
};

export default function selectedStocks(state = {}, action) {
  const newState = { ...state };
  if (!newState[action.meta]) {
    newState[action.meta] = initialState;
  }

  switch (action.type) {
    case STOCK_LOADING:
      newState[action.meta] = { ...newState[action.meta], isFetching: true };
      return newState;
    case STOCK_SUCCESS:
      newState[action.meta] = {
        ...newState[action.meta],
        isFetching: false,
        details: action.payload,
        error: null,
        receivedAt: Date.now()
      };
      return newState;
    case STOCK_FAILURE:
      newState[action.meta] = {
        ...newState[action.meta],
        isFetching: false,
        error: action.payload,
        receivedAt: Date.now()
      };
      return newState;
    default:
      return state;
  }
}
