/**
 * the actions of company stuff
 * dispatch different actions in different case
 */

import {
  COMPANIES_LOADING,
  COMPANIES_SUCCESS,
  COMPANIES_FAILURE,
} from './types';
import axios from 'axios';

export function loadCompaniesRequest() {
  return {
    type: COMPANIES_LOADING,
  };
}

export function loadCompaniesSuccess(companies) {
  return {
    type: COMPANIES_SUCCESS,
    error: null,
    payload: companies,
  };
}

export function loadCompaniesFailure(err) {
  const { status, data } = err;
  return {
    type: COMPANIES_FAILURE,
    error: true,
    payload: { status, message: data },
  };
}

export function fetchCompanies() {
  return function (dispatch) {
    dispatch(loadCompaniesRequest());

    return axios
      .get('/companies')
      .then((res) => dispatch(loadCompaniesSuccess(res.data.companies)))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          dispatch(loadCompaniesFailure(error.response));
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          dispatch(
            loadCompaniesFailure({
              status: 400,
              data: 'Request was made but no response was received.',
            })
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          dispatch(loadCompaniesFailure({ status: 500, data: error.message }));
        }
      });
  };
}

function shouldFetchCompanies(state) {
  const {
    companies: { data, isFetching, error, receivedAt },
  } = state;
  if (error === null && data.length === 0) {
    return true;
  } else if (isFetching) {
    return false;
  } else if (receivedAt) {
    const diff = Date.now() - receivedAt;
    return diff > 86400000;
  } else if (data.length > 0) {
    return false;
  }
  return true;
}

export function fetchCompaniesIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchCompanies(getState())) {
      return dispatch(fetchCompanies());
    } else {
      return Promise.resolve();
    }
  };
}
