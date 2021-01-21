import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CircularProgress } from '@material-ui/core';

import { fetchIndustryIndices } from '../../actions/analytics';
import AnalyticsTable from '../AnalyticsTable';
import Error from '../Error';

class IndustryIndices extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchIndustryIndices());
  }

  render() {
    const { isFetching, error, data } = this.props;
    return (
      <div>
        <h3>Industry Indices</h3>
        {isFetching ? (
          <CircularProgress />
        ) : error ? (
          <Error {...error} />
        ) : (
          <AnalyticsTable
            data={data}
            headings={['Sector', 'Price', 'Change ($)', 'Change (%)']}
            propertyNames={['sector', 'price', 'change', 'change_percent']}
            fillWithEmpty
          />
        )}
      </div>
    );
  }
}

IndustryIndices.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object
};

const mapStateToProps = state => {
  const {
    analytics: { industryIndices }
  } = state;
  const { isFetching, data, error, receivedAt } = industryIndices;
  return { isFetching, data, error, receivedAt };
};

export default connect(mapStateToProps)(IndustryIndices);
