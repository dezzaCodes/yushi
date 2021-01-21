import React from 'react';
import PropTypes from 'prop-types';

import Table from '@material-ui/core/Table';
import {
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination
} from '@material-ui/core';

function AnalyticsTable({ headings, propertyNames, data, fillWithEmpty }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, page) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: '#76abe0', color: '#edf4fb' }}>
            {headings.map((h, i) => (
              <TableCell
                key={i}
                style={{
                  color: '#edf4fb',
                  fontWeight: '600'
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, i) => (
              <TableRow key={i}>
                {propertyNames.map((property, j) => (
                  <TableCell key={j}>{row[property] ? row[property]:"N/A"}</TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {data.length > 5 && (
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </TableContainer>
  );
}

AnalyticsTable.propTypes = {
  headings: PropTypes.array.isRequired,
  propertyNames: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired
};

export default AnalyticsTable;
