import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CircularProgress } from '@material-ui/core';

import { fetchTopDeclines } from '../../actions/analytics';
import AnalyticsTable from '../AnalyticsTable';
import Error from '../Error';

class TopDeclines extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchTopDeclines());
  }

  render() {
    const { isFetching, error, data } = this.props;
    return (
      <div>
        <h3>Top Declines</h3>
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

TopDeclines.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object
};

const mapStateToProps = state => {
  const {
    analytics: { topDeclines }
  } = state;
  const { isFetching, data, error, receivedAt } = topDeclines;
  return { isFetching, data, error, receivedAt };
};

export default connect(mapStateToProps)(TopDeclines);
