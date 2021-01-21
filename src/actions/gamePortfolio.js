/**
 * the actions of game Portoflio stuff
 * dispatch different actions in different case
 * getConfig would add the headers for post
 */

import axios from 'axios';
import {
  GAME_PORTFOLIOS_LOADING,
  GAME_PORTFOLIOS_SUCCESS,
  GAME_PORTFOLIOS_FAILURE,
  GAME_ADD_PORTFOLIO_SUCCESS,
  GAME_ADD_PORTFOLIO_LOADING,
  GAME_ADD_PORTFOLIO_FAILURE,
  GAME_DELETE_PORTFOLIO_LOADING,
  GAME_DELETE_PORTFOLIO_SUCCESS,
  GAME_DELETE_PORTFOLIO_FAILURE,
  GAME_ADD_HOLDING,
  GAME_ADD_HOLDING_LOADING,
  GAME_DELETE_HOLDING,
  GAME_DELETE_HOLDING_LOADING,
  GAME_SELL_HOLDING_LOADING,
  GAME_SELL_HOLDING,
  GAME_RESET,
} from './types';
import { getConfig } from './auth';

export function loadGamePortfoliosRequest() {
  let type = GAME_PORTFOLIOS_LOADING;
  return { type };
}

export function loadGamePortfoliosSuccess(data) {
  let type = GAME_PORTFOLIOS_SUCCESS;
  return {
    type,
    error: null,
    payload: data
  };
}

export function loadGamePortfoliosFailure(err) {
  let type = GAME_PORTFOLIOS_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    payload: { status, message: data }
  };
}

export function fetchPortfolios() {
  return function(dispatch, getState) {
    dispatch(loadGamePortfoliosRequest());

    return axios
            .get('/portfolios', getConfig(getState))
      .then((res) => dispatch(loadGamePortfoliosSuccess(res.data.game_portfolio)))
      .catch((err) => {
        if (err.response) {
          dispatch(loadGamePortfoliosFailure(err.response));
        } else if (err.request) {
          dispatch(
            loadGamePortfoliosFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          dispatch(loadGamePortfoliosFailure({ status: 500, data: err.message }));
        }
      });
  };
}

/* 

    Add portfolio actions

*/

function addPortfolioRequest(name) {
  let type = GAME_ADD_PORTFOLIO_LOADING;
  return { type, name };
}

function addPortfolioSuccess(portfolio) {
  let type = GAME_ADD_PORTFOLIO_SUCCESS;
  return {
    type,
    error: null,
    portfolio,
    confirmation: `Successfully added portfolio ${
      portfolio.id
    }: "${portfolio.name.toUpperCase()}"!`
  };
}

function addPortfolioFailure(err) {
  let type = GAME_ADD_PORTFOLIO_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    confirmationError: data
  };
}

export function addNewPortfolio(name) {
  return function(dispatch, getState) {
    dispatch(addPortfolioRequest(name));

    return axios
      .post('/gamePortfolios', { name }, getConfig(getState))
      .then(res => dispatch(addPortfolioSuccess(res.data.portfolio)))
      .catch(err => dispatch(addPortfolioFailure(err.response)));
  };
}

/* 

    Delete portfolio actions

*/

function deletePortfolioRequest(portfolioID) {
  let type = GAME_DELETE_PORTFOLIO_LOADING;
  return { type, portfolioID };
}

function deletePortfolioSuccess(portfolio) {
  let type = GAME_DELETE_PORTFOLIO_SUCCESS;
  return {
    type,
    error: null,
    portfolioID: portfolio.id,
    confirmation: `Successfully deleted portfolio ${
      portfolio.id
    }: "${portfolio.name.toUpperCase()}"!`
  };
}

function deletePortfolioFailure(err) {
  let type = GAME_DELETE_PORTFOLIO_FAILURE;
  const { status, data } = err;
  return {
    type,
    error: true,
    confirmationError: data
  };
}

export function deletePortfolio(portfolio) {
  return function(dispatch, getState) {
    dispatch(deletePortfolioRequest(portfolio.id));
    return axios
      .post(`/gamePortfolios/${portfolio.id}/delete`, {}, getConfig(getState))
      .then(res => dispatch(deletePortfolioSuccess(portfolio)))
      .catch(err => dispatch(deletePortfolioFailure(err.response)));
  };
}

/* 

    Add holdings to portfolio

*/

function addGameHoldingLoading() {
  return { type: GAME_ADD_HOLDING_LOADING };
}

export function addGameHolding(
  portfolio,
  stock_code,
  quantity
) {
  return function(dispatch, getState) {
    dispatch(addGameHoldingLoading());
    const type = GAME_ADD_HOLDING;
    return axios
      .post(
        `/game/add`,
        { stock_code, quantity },
        getConfig(getState)
      )
      .then(res => {
        const {
          data: { game_holding }
        } = res;
        dispatch({
          type,
          error: null,
          game_holding,
          confirmation: `Successfully purchased ${
            quantity
          } units of "${game_holding.stock_code.toUpperCase()}"`
        });
      })
      .catch(err => {
        if (err.response.status < 500) {
          dispatch({ type, error: true, confirmationError: err.response.data });
        } else {
          console.error(err.response.data);
          dispatch({
            type,
            error: true,
            confirmationError: 'Internal error: Could not add holding'
          });
        }
      });
  };
}

/* 

    Delete holding from portfolio

*/
function deleteHoldingFromPortfolioLoading() {
  return { type:   GAME_DELETE_HOLDING_LOADING };
}

export function deleteHoldingFromPortfolio(holding, portfolio) {
  const type = GAME_DELETE_HOLDING;
  return function(dispatch, getState) {
    dispatch(deleteHoldingFromPortfolioLoading());
    return axios
      .post(
        `/gamePortfolios/${portfolio.id}/holdings/${holding.id}/delete`,
        {},
        getConfig(getState)
      )
      .then(res => {
        dispatch({
          type,
          error: null,
          holdingID: holding.id,
          portfolioID: portfolio.id,
          confirmation: `Successfully deleted Holding ${
            holding.id
          }: "${holding.stock_code.toUpperCase()}" to Portfolio ${
            portfolio.id
          }: "${portfolio.name.toUpperCase()}"`
        });
      })
      .catch(err => {
        if (err.response.status < 500) {
          dispatch({ type, error: true, confirmationError: err.response.data });
        } else {
          console.error(err.response.data);
          dispatch({
            type,
            error: true,
            confirmationError: 'Internal error: Could not delete holding'
          });
        }
      });
  };
}


function sellGameHoldingLoading() {
  return { type: GAME_SELL_HOLDING_LOADING };
}

export function sellGameHolding(id, quantity) {
  return function(dispatch, getState) {
    dispatch(sellGameHoldingLoading());
    const type = GAME_SELL_HOLDING;
    return axios
      .post(
        `/game/sell`,
        { id, quantity },
        getConfig(getState)
      )
      .then(res => {
        const {
          data: { game_holding }
        } = res;
        dispatch({
          type,
          error: null,
          game_holding,
          confirmation: `Successfully sold ${
            quantity
          } units of "${game_holding.stock_code.toUpperCase()}"`
        });
      })
      .catch(err => {
        if (err.response.status < 500) {
          dispatch({ type, error: true, confirmationError: err.response.data });
        } else {
          console.error(err.response.data);
          dispatch({
            type,
            error: true,
            confirmationError: 'Internal error: Could not add holding'
          });
        }
      });
  };
}

export function resetGame() {
	return { type: GAME_RESET };
}