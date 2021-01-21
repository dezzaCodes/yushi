import { GET_ERRORS } from "./types";
/**
 * set the error massage in the error massage store
 */

export const returnErrors = (msg, status) => {
  return {
    type: GET_ERRORS,
    payload: { msg, status }
  };
};
