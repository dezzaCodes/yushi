/**
 *  set up the store of error massage 
 */
import { GET_ERRORS } from "../actions/types";

const initialState = {
  msg: {},
  status: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return Object.assign({}, state, {
        msg: action.payload.msg,
        status: action.payload.status
      })

    default:
      return state;
  }
}
