import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CircularProgress } from '@material-ui/core';

import { fetchTopGainers } from '../../actions/analytics';
import AnalyticsTable from '../AnalyticsTable';
import Error from '../Error';

class TopGainers extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchTopGainers());
  }

  render() {
    const { isFetching, error, data } = this.props;
    return (
      <div>
        <h3>Top Gainers</h3>
        {isFetching ? (
          <CircularProgress />
        ) : error ? (
          <Error {...error} />
        ) : (
          <AnalyticsTable
            data={data}
            headings={['Code', 'Name', 'Price', 'Change ($)', 'Change (%)']}
            propertyNames={[
              'code',
              'name',
              'price',
              'change',
              'change_percent'
            ]}
            fillWithEmpty
          />
        )}
      </div>
    );
  }
}

TopGainers.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object
};

const mapStateToProps = state => {
  const {
    analytics: { topGainers }
  } = state;
  const { isFetching, data, error, receivedAt } = topGainers;
  return { isFetching, data, error, receivedAt };
};

export default connect(mapStateToProps)(TopGainers);
