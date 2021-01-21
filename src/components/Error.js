import React from 'react';
import PropTypes from 'prop-types';

function Error({ status, message }) {
  return (
    <div>
      {status ? <h1>{status} Error</h1> : ''}
      <p>{message}</p>
    </div>
  );
}

Error.propTypes = {
  status: PropTypes.number,
  message: PropTypes.string.isRequired
};

export default Error;
