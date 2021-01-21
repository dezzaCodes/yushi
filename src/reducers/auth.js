/**
 *  set up the store of accounts 
 */

import {
  USER_LOADING,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REG_SUCCESS,
  REG_FAILURE,
  GUEST_USER,
} from '../actions/types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  isLoading: false,
  email: null,
  id: localStorage.getItem('id'),
};

export default function (state = initialState, action) {
  switch (action.type) {
    case USER_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case USER_LOADED:
      return {
        ...state,
        email: action.payload.email,
        id: action.payload.id,
        isAuthenticated: true,
        isLoading: false,
      };
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('id', action.payload.id);
      return {
        token: localStorage.getItem('token'),
        isAuthenticated: true,
        isLoading: false,
        email: action.payload.email,
        id: localStorage.getItem('id'),
      };
    case REG_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('id', action.payload.id);
      return {
        token: localStorage.getItem('token'),
        isAuthenticated: true,
        isLoading: false,
        email: action.payload.email,
        id: localStorage.getItem('id'),
      };
    case LOGOUT_SUCCESS:
      localStorage.clear();
      return {
        token: localStorage.getItem('token'),
        isAuthenticated: false,
        isLoading: false,
        email: null,
        id: null,
      };
    case LOGIN_FAILURE:
    case REG_FAILURE:
    case AUTH_ERROR:
      localStorage.clear();
    case GUEST_USER:
      return {
        ...state,
        email: null,
        id: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}
