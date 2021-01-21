/**
 *  set up the store of anaytics 
 */

import {
  TOP_GAINERS_LOADING,
  TOP_GAINERS_SUCCESS,
  TOP_GAINERS_FAILURE,
  TOP_DECLINES_LOADING,
  TOP_DECLINES_SUCCESS,
  TOP_DECLINES_FAILURE,
  TOP_COMPANIES_LOADING,
  TOP_COMPANIES_SUCCESS,
  TOP_COMPANIES_FAILURE,
  INDUSTRY_INDICES_LOADING,
  INDUSTRY_INDICES_SUCCESS,
  INDUSTRY_INDICES_FAILURE
} from '../actions/types';

const initialState = {
  isFetching: false,
  data: [],
  error: null
};

function features(state = initialState, action) {
  switch (action.type) {
    case TOP_GAINERS_LOADING:
    case TOP_DECLINES_LOADING:
    case TOP_COMPANIES_LOADING:
    case INDUSTRY_INDICES_LOADING:
      return Object.assign({}, state, {
        isFetching: true
      });
    case TOP_GAINERS_SUCCESS:
    case TOP_DECLINES_SUCCESS:
    case TOP_COMPANIES_SUCCESS:
    case INDUSTRY_INDICES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload.data,
        receivedAt: action.payload.receivedAt,
        error: null
      });
    case TOP_GAINERS_FAILURE:
    case TOP_DECLINES_FAILURE:
    case TOP_COMPANIES_FAILURE:
    case INDUSTRY_INDICES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        data: [],
        error: {
          status: action.payload.status,
          message: action.payload.message
        },
        receivedAt: action.payload.receivedAt
      });
    default:
      return state;
  }
}

export default function analytics(
  state = {
    topGainers: initialState,
    topDeclines: initialState,
    topCompanies: initialState,
    industryIndices: initialState
  },
  action
) {
  switch (action.type) {
    case TOP_GAINERS_LOADING:
    case TOP_GAINERS_SUCCESS:
    case TOP_GAINERS_FAILURE:
      return { ...state, topGainers: features(state.topGainers, action) };
    case TOP_DECLINES_LOADING:
    case TOP_DECLINES_SUCCESS:
    case TOP_DECLINES_FAILURE:
      return { ...state, topDeclines: features(state.topDeclines, action) };
    case TOP_COMPANIES_LOADING:
    case TOP_COMPANIES_SUCCESS:
    case TOP_COMPANIES_FAILURE:
      return { ...state, topCompanies: features(state.topCompanies, action) };
    case INDUSTRY_INDICES_LOADING:
    case INDUSTRY_INDICES_SUCCESS:
    case INDUSTRY_INDICES_FAILURE:
      return {
        ...state,
        industryIndices: features(state.industryIndices, action)
      };
    default:
      return state;
  }
}
