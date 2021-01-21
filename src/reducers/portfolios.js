/**
 *  set up the store of portoflio 
 */
import {
  PORTFOLIOS_LOADING,
  PORTFOLIOS_SUCCESS,
  PORTFOLIOS_FAILURE,
  ADD_PORTFOLIO_LOADING,
  ADD_PORTFOLIO_SUCCESS,
  ADD_PORTFOLIO_FAILURE,
  DELETE_PORTFOLIO_LOADING,
  DELETE_PORTFOLIO_SUCCESS,
  DELETE_PORTFOLIO_FAILURE,
  ADD_HOLDING_LOADING,
  ADD_HOLDING,
  DELETE_HOLDING_LOADING,
  DELETE_HOLDING,
  PORTFOLIOS_PERFORMANCE_FAILURE,
  PORTFOLIOS_PERFORMANCE_LOADING,
  PORTFOLIOS_PERFORMANCE_SUCCESS,
  PORTFOLIO_HISTORICAL_PERFORMANCE_FAILURE,
  PORTFOLIO_HISTORICAL_PERFORMANCE_LOADING,
  PORTFOLIO_HISTORICAL_PERFORMANCE_SUCCESS,
  HOLDING_GROUP_HISTORICAL_FAILURE,
  HOLDING_GROUP_HISTORICAL_LOADING,
  HOLDING_GROUP_HISTORICAL_SUCCESS,
  EDIT_PORTFOLIO_LOADING,
  EDIT_PORTFOLIO_SUCCESS,
  EDIT_PORTFOLIO_FAILURE,
  LOGOUT_SUCCESS,
} from '../actions/types';

const initialState = {
  isFetching: false,
  data: [],
  error: null,
  confirmation: null,
  confirmationError: null,
};

const dayPerfInitialState = { isFetching: false, data: {}, error: null };
const histPerfInitialState = {
  isFetching: false,
  data: {},
  error: null,
  isFetchingGroup: false,
};

function dayPerformance(state = dayPerfInitialState, action) {
  switch (action.type) {
    case PORTFOLIOS_PERFORMANCE_LOADING:
      return { ...state, isFetching: true };
    case PORTFOLIOS_PERFORMANCE_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: action.payload,
        error: null,
        receivedAt: Date.now(),
      };
    case PORTFOLIOS_PERFORMANCE_FAILURE:
      return {
        ...state,
        isFetching: false,
        data: {},
        error: action.payload,
        receivedAt: Date.now(),
      };
    case LOGOUT_SUCCESS:
      return dayPerfInitialState;
    default:
      return state;
  }
}

function historicalPerformance(state = histPerfInitialState, action) {
  switch (action.type) {
    case PORTFOLIO_HISTORICAL_PERFORMANCE_LOADING:
      return { ...state, isFetching: true, isFetchingGroup: true };
    case PORTFOLIO_HISTORICAL_PERFORMANCE_SUCCESS:
      const { portfolio_id } = action.payload;
      const { data } = state;
      data[portfolio_id] = action.payload;
      return {
        ...state,
        isFetching: false,
        data: { ...data },
        error: null,
        isFetchingGroup: false,
        receivedAt: Date.now(),
      };
    case PORTFOLIO_HISTORICAL_PERFORMANCE_FAILURE:
      return {
        ...state,
        isFetching: false,
        isFetchingGroup: false,
        error: action.payload,
        receivedAt: Date.now(),
      };
    case HOLDING_GROUP_HISTORICAL_LOADING:
      return { ...state, isFetchingGroup: true };
    case HOLDING_GROUP_HISTORICAL_SUCCESS:
      const { portfolioID, code, payload } = action;
      const newData = { ...state.data };
      const newHoldingPerformance = newData[
        portfolioID
      ].holding_performance.filter((h) => h.code !== code);
      newHoldingPerformance.push(payload);
      newData[portfolioID].holding_performance = newHoldingPerformance;
      return {
        ...state,
        isFetchingGroup: false,
        data: { ...newData },
        error: null,
        receivedAt: Date.now(),
      };
    case HOLDING_GROUP_HISTORICAL_FAILURE:
      return {
        ...state,
        isFetchingGroup: false,
        error: action.payload,
        receivedAt: Date.now(),
      };
    case LOGOUT_SUCCESS:
      return histPerfInitialState;
    default:
      return state;
  }
}

function fetchingPortfolios(state = initialState, action) {
  switch (action.type) {
    case PORTFOLIOS_LOADING:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case PORTFOLIOS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload,
        error: null,
        receivedAt: Date.now(),
      });
    case PORTFOLIOS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        data: [],
        error: action.payload,
        receivedAt: Date.now(),
      });
    case ADD_PORTFOLIO_LOADING:
      return Object.assign({}, state, {
        processingAdd: true,
        confirmation: null,
        confirmationError: null,
      });
    case ADD_PORTFOLIO_SUCCESS:
      return Object.assign({}, state, {
        processingAdd: false,
        data: [...state.data, action.portfolio],
        error: null,
        confirmation: action.confirmation,
        receivedAt: Date.now(),
      });
    case ADD_PORTFOLIO_FAILURE:
      return Object.assign({}, state, {
        processingAdd: false,
        confirmation: null,
        confirmationError: action.confirmationError,
        receivedAt: Date.now(),
      });
    case EDIT_PORTFOLIO_LOADING:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: null,
      });
    case EDIT_PORTFOLIO_SUCCESS:
      var newEntry = state.data.find((data) => data.id === action.portfolioID);
      var oldEntry = state.data.filter(
        (data) => data.id !== action.portfolioID
      );
      newEntry.name = action.name;
      var input = [...oldEntry, newEntry];

      return Object.assign({}, state, {
        data: input,
        error: null,
        confirmation: action.confirmation,
        receivedAt: Date.now(),
      });
    case EDIT_PORTFOLIO_FAILURE:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: action.confirmationError,
        receivedAt: Date.now(),
      });
    case DELETE_PORTFOLIO_LOADING:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: null,
      });
    case DELETE_PORTFOLIO_SUCCESS:
      return Object.assign({}, state, {
        data: state.data.filter((data) => data.id !== action.portfolioID),
        confirmation: action.confirmation,
        confirmationError: null,
        receivedAt: Date.now(),
      });
    case DELETE_PORTFOLIO_FAILURE:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: action.confirmationError,
        receivedAt: Date.now(),
      });
    case ADD_HOLDING_LOADING:
      return Object.assign({}, state, {
        processingAdd: true,
        confirmation: null,
        confirmationError: null,
      });
    case ADD_HOLDING:
      if (action.error) {
        return Object.assign({}, state, {
          processingAdd: false,
          confirmation: null,
          confirmationError: action.confirmationError,
          receivedAt: Date.now(),
        });
      } else {
        return Object.assign({}, state, {
          processingAdd: false,
          data: state.data.map((p) =>
            p.id === action.portfolioID
              ? { ...p, holdings: [...p.holdings, action.holding] }
              : p
          ),
          confirmation: action.confirmation,
          confirmationError: null,
          receivedAt: Date.now(),
        });
      }
    case DELETE_HOLDING_LOADING:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: null,
      });
    case DELETE_HOLDING:
      if (action.error) {
        return Object.assign({}, state, {
          confirmation: null,
          confirmationError: action.confirmationError,
          receivedAt: Date.now(),
        });
      } else {
        return Object.assign({}, state, {
          data: state.data.map((p) =>
            p.id === action.portfolioID
              ? {
                  ...p,
                  holdings: p.holdings.filter((h) => h.id !== action.holdingID),
                }
              : p
          ),
          confirmation: action.confirmation,
          confirmationError: null,
          receivedAt: Date.now(),
        });
      }
    case LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}

export default function portfolios(state = initialState, action) {
  if (action.type === LOGOUT_SUCCESS) {
    return {
      ...fetchingPortfolios(state, action),
      dayPerformance: dayPerformance(state.dayPerformance, action),
      historicalPerformance: historicalPerformance(
        state.historicalPerformance,
        action
      ),
    };
  }
  return {
    ...state,
    ...fetchingPortfolios(state, action),
    dayPerformance: dayPerformance(state.dayPerformance, action),
    historicalPerformance: historicalPerformance(
      state.historicalPerformance,
      action
    ),
  };
}

