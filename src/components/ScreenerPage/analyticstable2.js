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
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';

// STYLES
const tableStyles = makeStyles({
    tableRowStyle:{
      backgroundColor: '#76abe0',
      color: '#edf4fb',
    },
    tableCellStyle:{
      color: '#edf4fb',
      fontWeight: '600',
    }
  });

// SORTING FUNCTIONS
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

  // TABLE FUNCTION
  
export default function AnalyticsTable2({ headings, propertyNames, data, fillWithEmpty }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const styleClass = tableStyles();

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
            {/* <TableCell padding="checkbox">
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': 'select all sto' }}
              />
            </TableCell> */}
            {headings.map((value, i) => (
              <TableCell
                key={i}
                style={{
                  color: '#edf4fb',
                  fontWeight: '600'
                }}
              >
                {/* <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                > */}
                  {value}
                  {/* {orderBy === i ? (
                    <span className={classes.visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel> */}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map(s => (
              <TableRow>
                <TableCell>
                    <Button>
                        <Link to={`/stock/${s.code}`} style={{ color: 'inherit' }}>{s.code}</Link>
                    </Button>
                </TableCell>
                <TableCell >{s.PE_value === null? "N/A":s.PE_value.toFixed(2)}</TableCell>
                <TableCell >{s.ROE ? s.ROE.toFixed(2):"N/A"}</TableCell>
                <TableCell >{s.EPS? s.EPS.toFixed(2):"N/A"}</TableCell>
                <TableCell >{s.div_yield?s.div_yield.toFixed(2):"N/A"}</TableCell>
                <TableCell >{s.sector}</TableCell>
                <TableCell>{s.string_market_cap.toUpperCase()} CAP</TableCell>
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

AnalyticsTable2.propTypes = {
  headings: PropTypes.array.isRequired,
  propertyNames: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired
};


