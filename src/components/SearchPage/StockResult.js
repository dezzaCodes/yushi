import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';

function StockResult({ code, company }) {
  return (
    <Button
      component={Link}
      to={`/stock/${code}`}
      color="inherit"
      fullWidth
      style={{ justifyContent: 'flex-start' }}
    >
      {company} ({code})
    </Button>
  );
}

StockResult.propTypes = {
  code: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired
};

export default StockResult;
