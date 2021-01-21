import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import PopUp from './PopUp';

import { deletePortfolio, editPortfolio } from '../../actions/portfolios';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  tableHeader: {
    backgroundColor: '#428bd5',
  },
  tableHeaderRows: {
    color: '#edf4fb',
  },
  actions: {
    display: 'flex',
  },
  button: {
    marginLeft: '5px',
    marginRigth: '5px',
  },
}));

function PortfolioList({ data, dispatch }) {
  const classes = useStyles();

  const handleDeletePortfolio = (p) => {
    dispatch(deletePortfolio(p));
  };

  const handleEditPortfolio = (e, p) => {
    dispatch(editPortfolio(e, p));
  };

  return (
    <Table>
      <TableHead className={classes.tableHeader}>
        <TableRow>
          <TableCell className={classes.tableHeaderRows}>
            <strong>NAME</strong>
          </TableCell>
          <TableCell className={classes.tableHeaderRows}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <Link to={`/portfolio/${p.id}`}>{p.name}</Link>
            </TableCell>
            <TableCell className={classes.actions} align="right">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                disableElevation
                onClick={(e) => handleDeletePortfolio(p)}
                className={classes.button}
              >
                Delete
              </Button>
              <PopUp handler={handleEditPortfolio} p={p} string="New portfolio name" />
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell>No Portfolios!!</TableCell>
            <TableCell></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

PortfolioList.propTypes = {
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default PortfolioList;
