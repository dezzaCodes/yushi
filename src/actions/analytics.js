/**
 * the actions of analytics stuff
 * dispatch different actions in different case
 */
import axios from 'axios';
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
} from './types';

export const AnalyticsFeatures = {
  TOP_GAINERS: 'TOP_GAINERS',
  TOP_DECLINES: 'TOP_DECLINES',
  TOP_COMPANIES: 'TOP_COMPANIES',
  INDUSTRY_INDICES: 'INDUSTRY_INDICES'
};

export function loadAnalyticsFeatureRequest(feature) {
  let type = '';
  switch (feature) {
    case AnalyticsFeatures.TOP_GAINERS:
      type = TOP_GAINERS_LOADING;
      break;
    case AnalyticsFeatures.TOP_DECLINES:
      type = TOP_DECLINES_LOADING;
      break;
    case AnalyticsFeatures.TOP_COMPANIES:
      type = TOP_COMPANIES_LOADING;
      break;
    case AnalyticsFeatures.INDUSTRY_INDICES:
      type = INDUSTRY_INDICES_LOADING;
      break;
    default:
      return;
  }
  return { type };
}

export function loadAnalyticsFeatureSuccess(feature, data) {
  let type = '';
  switch (feature) {
    case AnalyticsFeatures.TOP_GAINERS:
      type = TOP_GAINERS_SUCCESS;
      break;
    case AnalyticsFeatures.TOP_DECLINES:
      type = TOP_DECLINES_SUCCESS;
      break;
    case AnalyticsFeatures.TOP_COMPANIES:
      type = TOP_COMPANIES_SUCCESS;
      break;
    case AnalyticsFeatures.INDUSTRY_INDICES:
      type = INDUSTRY_INDICES_SUCCESS;
      break;
    default:
      return;
  }
  return {
    type,
    error: null,
    payload: { data, receivedAt: Date.now() }
  };
}

export function loadAnalyticsFeatureFailure(feature, err) {
  let type = '';
  switch (feature) {
    case AnalyticsFeatures.TOP_GAINERS:
      type = TOP_GAINERS_FAILURE;
      break;
    case AnalyticsFeatures.TOP_DECLINES:
      type = TOP_DECLINES_FAILURE;
      break;
    case AnalyticsFeatures.TOP_COMPANIES:
      type = TOP_COMPANIES_FAILURE;
      break;
    case AnalyticsFeatures.INDUSTRY_INDICES:
      type = INDUSTRY_INDICES_FAILURE;
      break;
    default:
      return;
  }
  const { status, data } = err;
  return {
    type,
    error: true,
    payload: { status, message: data, receivedAt: Date.now() }
  };
}

export function fetchTopGainers() {
  return function(dispatch) {
    const feature = AnalyticsFeatures.TOP_GAINERS;
    dispatch(loadAnalyticsFeatureRequest(feature));

    return axios
      .get('/analytics/top-gainers')
      .then(res =>
        dispatch(loadAnalyticsFeatureSuccess(feature, res.data.gainers))
      )
      .catch(err =>
        dispatch(loadAnalyticsFeatureFailure(feature, err.response))
      );
  };
}

export function fetchTopDeclines() {
  return function(dispatch) {
    const feature = AnalyticsFeatures.TOP_DECLINES;
    dispatch(loadAnalyticsFeatureRequest(feature));

    return axios
      .get('/analytics/top-declines')
      .then(res =>
        dispatch(loadAnalyticsFeatureSuccess(feature, res.data.declines))
      )
      .catch(err =>
        dispatch(loadAnalyticsFeatureFailure(feature, err.response))
      );
  };
}

export function fetchTopCompanies() {
  return function(dispatch) {
    const feature = AnalyticsFeatures.TOP_COMPANIES;
    dispatch(loadAnalyticsFeatureRequest(feature));

    return axios
      .get('/analytics/top-companies')
      .then(res =>
        dispatch(loadAnalyticsFeatureSuccess(feature, res.data.companies))
      )
      .catch(err =>
        dispatch(loadAnalyticsFeatureFailure(feature, err.response))
      );
  };
}

export function fetchIndustryIndices() {
  return function(dispatch) {
    const feature = AnalyticsFeatures.INDUSTRY_INDICES;
    dispatch(loadAnalyticsFeatureRequest(feature));

    return axios
      .get('/analytics/industry-indices')
      .then(res =>
        dispatch(loadAnalyticsFeatureSuccess(feature, res.data.industries))
      )
      .catch(err =>
        dispatch(loadAnalyticsFeatureFailure(feature, err.response))
      );
  };
}
