
/**
 *  combine all reducers to rootReducer 
 */
import { combineReducers } from 'redux';
import auth from './auth';
import errors from './errors';
import companies from './companies';
import selectedStocks from './selectedStocks';
import analytics from './analytics';
import portfolios from './portfolios';
import gamePortfolio from './gamePortfolio';
export default combineReducers({
  auth,
  errors,
  companies,
  selectedStocks,
  analytics,
  portfolios,
  gamePortfolio,
});
