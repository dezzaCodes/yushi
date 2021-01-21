import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import matchSorter from 'match-sorter';

import CircularProgress from '@material-ui/core/CircularProgress';

import { fetchCompaniesIfNeeded } from '../../actions/companies';
import Error from '../Error';
import SearchResults from './SearchResults';

class SearchContainer extends Component {
  state = {
    query: this.props.location.search.slice(1),
    results: [],
    related: []
  };

  componentDidMount() {
    const { dispatch, data } = this.props;
    const { query } = this.state;

    dispatch(fetchCompaniesIfNeeded());

    // Display search results if data is fetched & query is not empty
    if (data.length > 0 && query.length > 0) {
      const results = matchSorter(data, query, {
        threshold: matchSorter.rankings.CONTAINS
      });
      const related = results.length === 0 ? matchSorter(data, query) : [];

      this.setState({
        ...this.state,
        results,
        related
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search },
      data
    } = this.props;

    // Update search results if data has been fetched, or query has changed
    const query = search.slice(1);
    if (data !== prevProps.data || search !== prevProps.location.search) {
      // If there is a query then filter results accordingly
      const results = query
        ? matchSorter(data, query, {
            threshold: matchSorter.rankings.CONTAINS
          })
        : [];

      // If there is a query but there aren't any results, find related stocks
      const related =
        query && results.length === 0 ? matchSorter(data, query) : [];

      this.setState({
        ...this.state,
        query,
        results,
        related
      });
    }
  }

  render() {
    const { isFetching, error } = this.props;
    const { results, related } = this.state;
    const query = this.props.location.search.slice(1);
    if (!query)
      return <p>Search for a stock by their code or their company name</p>;
    if (isFetching) return <CircularProgress />;
    if (error) return <Error {...error} {...this.props} />;

    return (
      <div>
        <SearchResults
          heading={`Results containing '${query}'`}
          data={results}
          nRowsPerPage={10}
          history={this.props.history}
        />
        {results.length === 0 ? (
          <SearchResults
            heading="Related"
            data={related}
            nRowsPerPage={10}
            history={this.props.history}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { companies } = state;
  const { isFetching, data, error } = companies;
  return { isFetching, data, error };
};

SearchContainer.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object
};

export default connect(mapStateToProps)(SearchContainer);
