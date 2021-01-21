/**
 * the actions of account stuff
 * dispatch different actions in different case
 * returnErrors send the error massage to the error massge store
 */

import axios from 'axios';
import { returnErrors } from './errors.js';

import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_SUCCESS,
  REG_SUCCESS,
  REG_FAILURE,
  GUEST_USER,
} from './types';

const LOGIN_URL = '/api/auth/login';
const REGISTRATION_URL = '/api/auth/register';
const GET_USER_URL = '/api/auth/user';

export const loadUser = () => (dispatch, getState) => {
  dispatch({ type: USER_LOADING });

  const token = getState().auth.token;
  if (!token) {
    dispatch({ type: GUEST_USER });
    return;
  }

  // load user
  axios
    .post(GET_USER_URL, {}, getConfig(getState))
    .then((res) => {
      dispatch({
        type: USER_LOADED,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
      dispatch({
        type: AUTH_ERROR,
      });
    });
};

export const login = (email, password) => (dispatch) => {
  // request body
  const body = JSON.stringify({ email, password });

  axios
    .post(LOGIN_URL, body, getConfig())
    .then((res) => {
      console.log(res.data)
      if (res.data.msg === LOGIN_FAILURE) {
        dispatch(returnErrors(res.data.msg, res.status));
        dispatch({
          type: LOGIN_FAILURE,
        });
      } else if (res.data.msg === LOGIN_SUCCESS) {
        dispatch(returnErrors({},null));
        dispatch({
          type: LOGIN_SUCCESS,
          payload: res.data,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export const logout = () => (dispatch) => {
  dispatch(returnErrors({},null));
  dispatch({
    type: LOGOUT_SUCCESS,
  });
};

export const register = (email, password) => (dispatch) => {
  // request body
  const body = JSON.stringify({ email, password });

  axios
    .post(REGISTRATION_URL, body, getConfig())
    .then((res) => {
      if (res.data.msg === REG_SUCCESS) {
        dispatch(returnErrors({},null));
        dispatch({
          type: REG_SUCCESS,
          payload: res.data,
        });
      } else if (res.data.msg === REG_FAILURE) {
        dispatch(returnErrors(res.data.msg, res.status));
        dispatch({
          type: REG_FAILURE,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// Setup a http request with content-type header, and token if needed
export const getConfig = (getState) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (!getState) return config;

  // get the token from authentication state
  const token = getState().auth.token || localStorage.getItem('token');

  // Add the authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  return config;
};
