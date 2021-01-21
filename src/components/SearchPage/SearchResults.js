import React from 'react';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Pagination from '@material-ui/lab/Pagination';

import StockResult from './StockResult';

function SearchResults({ data, nRowsPerPage, heading }) {
  const [numPages, setNumPages] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(null);
  const [dataShown, setDataShown] = React.useState([]);

  React.useEffect(() => {
    setNumPages(Math.ceil(data.length / nRowsPerPage));
  }, [data, nRowsPerPage]);

  React.useEffect(() => {
    setCurrentPage(numPages && numPages !== 0 ? 1 : null);
  }, [numPages]);

  React.useEffect(() => {
    setDataShown(
      data.slice((currentPage - 1) * nRowsPerPage, currentPage * nRowsPerPage)
    );
  }, [currentPage, nRowsPerPage, data]);

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      {heading ? <h1>{heading}</h1> : ''}
      <List>
        <ListSubheader>Results: {data.length}</ListSubheader>
        {dataShown.map(([code, company], i) => (
          <ListItem key={i}>
            <StockResult code={code} company={company} />
          </ListItem>
        ))}
        {numPages && numPages !== 0 ? (
          <Pagination
            count={numPages}
            showFirstButton
            showLastButton
            onChange={handlePageChange}
            page={currentPage}
          />
        ) : (
          ''
        )}
      </List>
    </div>
  );
}

SearchResults.propTypes = {
  data: PropTypes.array.isRequired,
  nRowsPerPage: PropTypes.number.isRequired,
  heading: PropTypes.string
};

export default SearchResults;
