import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CircularProgress } from '@material-ui/core';

import { fetchTopCompanies } from '../../actions/analytics';
import AnalyticsTable from '../AnalyticsTable';
import Error from '../Error';

class TopCompanies extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchTopCompanies());
  }

  render() {
    const { isFetching, error, data } = this.props;
    return (
      <div>
        <h3>Top Companies</h3>
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

TopCompanies.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object
};

const mapStateToProps = state => {
  const {
    analytics: { topCompanies }
  } = state;
  const { isFetching, data, error, receivedAt } = topCompanies;
  return { isFetching, data, error, receivedAt };
};

export default connect(mapStateToProps)(TopCompanies);
