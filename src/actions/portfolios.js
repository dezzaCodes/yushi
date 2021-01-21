/**
 * the actions of portfolios stuff
 * dispatch different actions in different case
 * returnErrors send the error massage to the error massge store
 */

import axios from 'axios';
import {
  PORTFOLIOS_LOADING,
  PORTFOLIOS_SUCCESS,
  PORTFOLIOS_FAILURE,
  ADD_PORTFOLIO_SUCCESS,
  ADD_PORTFOLIO_LOADING,
  ADD_PORTFOLIO_FAILURE,
  DELETE_PORTFOLIO_LOADING,
  DELETE_PORTFOLIO_SUCCESS,
  DELETE_PORTFOLIO_FAILURE,
  ADD_HOLDING,
  ADD_HOLDING_LOADING,
  DELETE_HOLDING,
  DELETE_HOLDING_LOADING,
  PORTFOLIOS_PERFORMANCE_LOADING,
  PORTFOLIOS_PERFORMANCE_SUCCESS,
  PORTFOLIOS_PERFORMANCE_FAILURE,
  PORTFOLIO_HISTORICAL_PERFORMANCE_FAILURE,
  PORTFOLIO_HISTORICAL_PERFORMANCE_LOADING,
  PORTFOLIO_HISTORICAL_PERFORMANCE_SUCCESS,
  HOLDING_GROUP_HISTORICAL_FAILURE,
  HOLDING_GROUP_HISTORICAL_LOADING,
  HOLDING_GROUP_HISTORICAL_SUCCESS,
  EDIT_PORTFOLIO_LOADING,
  EDIT_PORTFOLIO_SUCCESS,
  EDIT_PORTFOLIO_FAILURE,
} from './types';

import { getConfig } from './auth';

export function loadPortfoliosRequest() {
  let type = PORTFOLIOS_LOADING;
  return { type };
}

export function loadPortfoliosSuccess(data) {
  let type = PORTFOLIOS_SUCCESS;
  return {
    type,
    error: null,
    payload: data,
  };
}

export function loadPortfoliosFailure(err) {
  let type = PORTFOLIOS_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    payload: { status, message: data },
  };
}

export function fetchPortfolios() {
  return function (dispatch, getState) {
    dispatch(loadPortfoliosRequest());

    return axios
      .get('/portfolios', getConfig(getState))
      .then((res) => dispatch(loadPortfoliosSuccess(res.data.portfolios)))
      .catch((err) => {
        if (err.response) {
          dispatch(loadPortfoliosFailure(err.response));
        } else if (err.request) {
          dispatch(
            loadPortfoliosFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(loadPortfoliosFailure({ status: 500, data: err.message }));
        }
      });
  };
}

/* 

    Add portfolio actions

*/

function addPortfolioRequest(name) {
  let type = ADD_PORTFOLIO_LOADING;
  return { type, name };
}

function addPortfolioSuccess(portfolio) {
  let type = ADD_PORTFOLIO_SUCCESS;
  return {
    type,
    error: null,
    portfolio,
    confirmation: `Successfully added portfolio ${
      portfolio.id
    }: "${portfolio.name.toUpperCase()}"!`,
  };
}

function addPortfolioFailure(err) {
  let type = ADD_PORTFOLIO_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    confirmationError: data,
  };
}

export function addNewPortfolio(name) {
  return function (dispatch, getState) {
    dispatch(addPortfolioRequest(name));

    return axios
      .post('/portfolios', { name }, getConfig(getState))
      .then((res) => dispatch(addPortfolioSuccess(res.data.portfolio)))
      .catch((err) => {
        if (err.response) {
          dispatch(addPortfolioFailure(err.response));
        } else if (err.request) {
          dispatch(
            addPortfolioFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(addPortfolioFailure({ status: 500, data: err.message }));
        }
      });
  };
}

/* 

    Delete portfolio actions

*/

function deletePortfolioRequest(portfolioID) {
  let type = DELETE_PORTFOLIO_LOADING;
  return { type, portfolioID };
}

function deletePortfolioSuccess(portfolio) {
  let type = DELETE_PORTFOLIO_SUCCESS;
  return {
    type,
    error: null,
    portfolioID: portfolio.id,
    confirmation: `Successfully deleted portfolio ${
      portfolio.id
    }: "${portfolio.name.toUpperCase()}"!`,
  };
}

function deletePortfolioFailure(err) {
  let type = DELETE_PORTFOLIO_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    confirmationError: data,
  };
}

export function deletePortfolio(portfolio) {
  return function (dispatch, getState) {
    dispatch(deletePortfolioRequest(portfolio.id));
    return axios
      .post(`/portfolios/${portfolio.id}/delete`, {}, getConfig(getState))
      .then((res) => dispatch(deletePortfolioSuccess(portfolio)))
      .catch((err) => {
        if (err.response) {
          dispatch(deletePortfolioFailure(err.response));
        } else if (err.request) {
          dispatch(
            deletePortfolioFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(deletePortfolioFailure({ status: 500, data: err.message }));
        }
      });
  };
}

/* 

    Add holdings to portfolio

*/

function addHoldingFromPortfolioLoading() {
  return { type: ADD_HOLDING_LOADING };
}

export function addHoldingToPortfolio(
  portfolio,
  stock_code,
  price,
  quantity,
  date
) {
  return function (dispatch, getState) {
    dispatch(addHoldingFromPortfolioLoading());
    const type = ADD_HOLDING;
    return axios
      .post(
        `/portfolios/${portfolio.id}`,
        { stock_code, price, quantity, date },
        getConfig(getState)
      )
      .then((res) => {
        const {
          data: { holding },
        } = res;
        dispatch({
          type,
          error: null,
          holding,
          portfolioID: portfolio.id,
          confirmation: `Successfully added Holding ${
            holding.id
          }: "${holding.stock_code.toUpperCase()}" to Portfolio ${
            portfolio.id
          }: "${portfolio.name.toUpperCase()}"`,
        });
      })
      .catch((err) => {
        if (err.response.status < 500) {
          dispatch({ type, error: true, confirmationError: err.response.data });
        } else {
          console.error(err.response.data);
          dispatch({
            type,
            error: true,
            confirmationError: 'Internal error: Could not add holding',
          });
        }
      });
  };
}

/* 

    Delete holding from portfolio

*/
function deleteHoldingFromPortfolioLoading() {
  return { type: DELETE_HOLDING_LOADING };
}

export function deleteHoldingFromPortfolio(holding, portfolio) {
  const type = DELETE_HOLDING;
  return function (dispatch, getState) {
    dispatch(deleteHoldingFromPortfolioLoading());
    return axios
      .post(
        `/portfolios/${portfolio.id}/holdings/${holding.id}/delete`,
        {},
        getConfig(getState)
      )
      .then((res) => {
        dispatch({
          type,
          error: null,
          holdingID: holding.id,
          portfolioID: portfolio.id,
          confirmation: `Successfully deleted Holding ${
            holding.id
          }: "${holding.stock_code.toUpperCase()}" to Portfolio ${
            portfolio.id
          }: "${portfolio.name.toUpperCase()}"`,
        });
      })
      .catch((err) => {
        if (err.response.status < 500) {
          dispatch({ type, error: true, confirmationError: err.response.data });
        } else {
          console.error(err.response.data);
          dispatch({
            type,
            error: true,
            confirmationError: 'Internal error: Could not delete holding',
          });
        }
      });
  };
}

/* 
    PORTFOLIO performance actions
*/

function getPortfoliosPerformanceLoading() {
  return { type: PORTFOLIOS_PERFORMANCE_LOADING };
}

function getPortfolioPerformanceSuccess(data) {
  return { type: PORTFOLIOS_PERFORMANCE_SUCCESS, payload: data };
}

function getPortfoliosPerformanceFailure(err) {
  const { status, data } = err;
  return {
    type: PORTFOLIOS_PERFORMANCE_FAILURE,
    payload: { status, message: data },
    error: true,
  };
}

export function fetchPortfoliosPerformance() {
  return function (dispatch, getState) {
    dispatch(getPortfoliosPerformanceLoading());

    return axios
      .get('/portfolios/performance', getConfig(getState))
      .then((res) => dispatch(getPortfolioPerformanceSuccess(res.data)))
      .catch((err) => {
        if (err.response) {
          dispatch(getPortfoliosPerformanceFailure(err.response));
        } else if (err.request) {
          dispatch(
            getPortfoliosPerformanceFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(
            getPortfoliosPerformanceFailure({ status: 500, data: err.message })
          );
        }
      });
  };
}

function getPortfolioHistoricalLoading(portfolioID) {
  return {
    type: PORTFOLIO_HISTORICAL_PERFORMANCE_LOADING,
    portfolioID,
  };
}

function getPortfolioHistoricalSuccess(data) {
  return { type: PORTFOLIO_HISTORICAL_PERFORMANCE_SUCCESS, payload: data };
}

function getPortfolioHistoricalFailure(err) {
  const { status, data } = err;
  return {
    type: PORTFOLIO_HISTORICAL_PERFORMANCE_FAILURE,
    payload: { status, message: data },
    error: true,
  };
}

export function fetchPortfolioHistoricalPerformance(portfolioID) {
  return function (dispatch, getState) {
    dispatch(getPortfolioHistoricalLoading(portfolioID));

    return axios
      .get(
        `/portfolios/${portfolioID}/historical-performance`,
        getConfig(getState)
      )
      .then((res) => dispatch(getPortfolioHistoricalSuccess(res.data)))
      .catch((err) => {
        if (err.response) {
          dispatch(getPortfolioHistoricalFailure(err.response));
        } else if (err.request) {
          dispatch(
            getPortfolioHistoricalFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(
            getPortfolioHistoricalFailure({ status: 500, data: err.message })
          );
        }
      });
  };
}

export function fetchPortfolioHistoricalPerformanceIfNeeded(portfolioID) {
  return function (dispatch, getState) {
    /// check if need to fetch...
    const {
      portfolios: {
        historicalPerformance: { data, isFetching },
      },
    } = getState();

    if (data[portfolioID] && isFetching === true) {
      return;
    }

    dispatch(getPortfolioHistoricalLoading(portfolioID));

    return axios
      .get(
        `/portfolios/${portfolioID}/historical-performance`,
        getConfig(getState)
      )
      .then((res) => dispatch(getPortfolioHistoricalSuccess(res.data)))
      .catch((err) => {
        if (err.response) {
          dispatch(getPortfolioHistoricalFailure(err.response));
        } else if (err.request) {
          dispatch(
            getPortfolioHistoricalFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(
            getPortfolioHistoricalFailure({ status: 500, data: err.message })
          );
        }
      });
  };
}

function getHoldingGroupHistoricalLoading(portfolioID) {
  return {
    type: HOLDING_GROUP_HISTORICAL_LOADING,
    portfolioID,
  };
}

function getHoldingGroupHistoricalSuccess(data, portfolioID, code) {
  return {
    type: HOLDING_GROUP_HISTORICAL_SUCCESS,
    payload: data,
    portfolioID,
    code,
  };
}

function getHoldingGroupHistoricalFailure(err) {
  const { status, data } = err;
  return {
    type: HOLDING_GROUP_HISTORICAL_FAILURE,
    payload: { status, message: data },
    error: true,
  };
}

export function fetchHoldingGroupHistoricalPerformance(portfolioID, code) {
  return function (dispatch, getState) {
    dispatch(getHoldingGroupHistoricalLoading(portfolioID));

    return axios
      .get(
        `/portfolios/${portfolioID}/holding-group/${code}/historical-performance`,
        getConfig(getState)
      )
      .then((res) =>
        dispatch(getHoldingGroupHistoricalSuccess(res.data, portfolioID, code))
      )
      .catch((err) => {
        if (err.response) {
          dispatch(getHoldingGroupHistoricalFailure(err.response));
        } else if (err.request) {
          dispatch(
            getHoldingGroupHistoricalFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(
            getHoldingGroupHistoricalFailure({ status: 500, data: err.message })
          );
        }
      });
  };
}
// Edit portfolio

function editPortfolioRequest(portfolioID, name) {
  let type = EDIT_PORTFOLIO_LOADING;
  return { type, portfolioID, name };
}

function editPortfolioSuccess(portfolio) {
  let type = EDIT_PORTFOLIO_SUCCESS;
  return {
    type,
    error: null,
    portfolioID: portfolio.id,
    name: portfolio.name,
    confirmation: `Successfully edited portfolio ${
      portfolio.id
    }: "${portfolio.name.toUpperCase()}"!`,
  };
}

function editPortfolioFailure(err) {
  let type = EDIT_PORTFOLIO_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    confirmationError: data,
  };
}

export function editPortfolio(name, portfolio) {
  return function (dispatch, getState) {
    dispatch(editPortfolioRequest(portfolio.id, name));
    return axios
      .post(`/portfolios/${portfolio.id}/edit`, { name }, getConfig(getState))
      .then((res) => dispatch(editPortfolioSuccess(res.data.portfolio)))
      .catch((err) => {
        if (err.response) {
          dispatch(editPortfolioFailure(err.response));
        } else if (err.request) {
          dispatch(
            editPortfolioFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(editPortfolioFailure({ status: 500, data: err.message }));
        }
      });
  };
}
