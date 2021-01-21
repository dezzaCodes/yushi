/**
 *  set up the store of companies 
 */
import {
  COMPANIES_LOADING,
  COMPANIES_SUCCESS,
  COMPANIES_FAILURE
} from '../actions/types';

const initialState = {
  isFetching: false,
  data: [],
  error: null
};

export default function companies(state = initialState, action) {
  switch (action.type) {
    case COMPANIES_LOADING:
      return Object.assign({}, state, {
        isFetching: true
      });
    case COMPANIES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload,
        error: null,
        receivedAt: Date.now()
      });
    case COMPANIES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        data: [],
        error: action.payload,
        receivedAt: Date.now()
      });
    default:
      return state;
  }
}
