/**
 *  set up the store of game portfolio 
 */
import {
  GAME_ADD_HOLDING_LOADING,
  GAME_ADD_HOLDING,
  GAME_SELL_HOLDING_LOADING,
  GAME_SELL_HOLDING,
  GAME_RESET,
  GAME_PORTFOLIOS_LOADING,
  GAME_PORTFOLIOS_SUCCESS,
  GAME_PORTFOLIOS_FAILURE,
  LOGOUT_SUCCESS,
} from '../actions/types';

const initialState = {
  isFetching: false,
  gameHoldings: [],
  error: null,
  confirmation: null,
  confirmationError: null,
};

export default function gamePortfolio(state = initialState, action) {
  switch (action.type) {
    case GAME_ADD_HOLDING_LOADING:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: null,
      });
    case GAME_ADD_HOLDING:
      if (action.error) {
        return Object.assign({}, state, {
          confirmation: null,
          confirmationError: action.confirmationError,
          receivedAt: Date.now(),
        });
      } else {
        return Object.assign({}, state, {
          gameHoldings: [...state.gameHoldings, action.game_holding],
          confirmation: action.confirmation,
          confirmationError: null,
          receivedAt: Date.now(),
        });
      }
    case GAME_SELL_HOLDING_LOADING:
      return Object.assign({}, state, {
        confirmation: null,
        confirmationError: null,
      });
    case GAME_RESET:
      return Object.assign({}, state, {
        gameHoldings: [],
        confirmation: action.confirmation,
        confirmationError: null,
        receivedAt: Date.now(),
      });
    case GAME_SELL_HOLDING:
      if (action.error) {
        return Object.assign({}, state, {
          confirmation: null,
          confirmationError: action.confirmationError,
          receivedAt: Date.now(),
        });
      } else {
        if (action.game_holding.quantity === 0) {
          return Object.assign({}, state, {
            gameHoldings: state.gameHoldings.filter(
              (h) => h.id !== action.game_holding.id
            ),
            confirmation: action.confirmation,
            confirmationError: null,
            receivedAt: Date.now(),
          });
        } else {
          var oldHoldings = state.gameHoldings.filter(
            (h) => h.id !== action.game_holding.id
          );
          var newHolding = action.game_holding;
          var newHoldings = [...oldHoldings, newHolding];
          return Object.assign({}, state, {
            gameHoldings: newHoldings,
            confirmation: action.confirmation,
            confirmationError: null,
            receivedAt: Date.now(),
          });
        }
      }
    case GAME_PORTFOLIOS_LOADING:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case GAME_PORTFOLIOS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        gameHoldings: action.payload,
        error: null,
        receivedAt: Date.now(),
      });
    case GAME_PORTFOLIOS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        gameHoldings: [],
        error: action.payload,
        receivedAt: Date.now(),
      });

    // Clear game portfolio on logout
    case LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
