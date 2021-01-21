import axios from 'axios';
import { STOCK_LOADING, STOCK_SUCCESS, STOCK_FAILURE } from './types';

export const loadStockRequest = stockCode => {
  return { type: STOCK_LOADING, payload: stockCode, meta: stockCode };
};

export const loadStockSuccess = (res, stockCode) => {
  const {
    data: { stock }
  } = res;
  return {
    type: STOCK_SUCCESS,
    payload: stock,
    error: false,
    meta: stockCode
  };
};

export const loadStockFailure = (err, stockCode) => {
  let status, data;
  if (err.data.error) {
    data = err.data.error;
    status = err.status;
  } else {
    status = err.status;
    data = err.data;
  }

  return {
    type: STOCK_FAILURE,
    payload: { status, message: data },
    error: true,
    meta: stockCode
  };
};

export const fetchStockDetails = stockCode => {
  return function(dispatch) {
    dispatch(loadStockRequest(stockCode));

    return axios
      .get(`/stocks/${stockCode}`)
      .then(res => dispatch(loadStockSuccess(res, stockCode)))
      .catch(err => dispatch(loadStockFailure(err.response, stockCode)));
  };
};

function shouldFetchStockDetails(stockState) {
  if (!stockState) return true;
  const { details, isFetching, error, receivedAt } = stockState;
  if (error === null && Object.keys(details).length === 0) {
    return true;
  } else if (isFetching) {
    return false;
  } else if (receivedAt) {
    const diff = Date.now() - receivedAt;
    return diff > 86400000;
  }
  return false;
}

export function fetchStockDetailsIfNeeded(stockCode) {
  return (dispatch, getState) => {
    const { selectedStocks } = getState();
    if (shouldFetchStockDetails(selectedStocks[stockCode])) {
      return dispatch(fetchStockDetails(stockCode));
    } else {
      return Promise.resolve();
    }
  };
}
