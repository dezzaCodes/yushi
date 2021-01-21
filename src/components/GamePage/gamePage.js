import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Tabs, Tab, CardDeck } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Input,
  FormControl,
  InputLabel,
  Snackbar,
  Container,
} from '@material-ui/core';
import { fetchPortfolios } from '../../actions/gamePortfolio';

import {
  addGameHolding,
  sellGameHolding,
  resetGame,
} from '../../actions/gamePortfolio';
import axios from 'axios';
import { getConfig } from '../../actions/auth';
import PopUp from './PopUp';

import Alert from '@material-ui/lab/Alert';

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
    marginRight: '5px',
  },
  warning: {
  	color: '#ff0000',
  	fontWeight: 'bold',
  }
}));

export const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

function GamePage({
  id,
  name,
  gameHoldings,
  dispatch,
  confirmation,
  confirmationError,
}) {
  const classes = useStyles();
  const [stockCode, setStockCode] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [leader, setLeader] = React.useState('');
  const [LB, setLB] = React.useState('');
  const [lname, setName] = React.useState('');
  const [rank, setRank] = React.useState('');
  const [date, setDate] = React.useState('2020-01-01');
  const [cash, setCash] = React.useState('');
  const [value, setValue] = React.useState(0);
  const [snackbarOpen, setSnackbarOpen] = React.useState(true);
  const userId = localStorage.getItem('id');

  React.useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);



// get the cash of user from backend
axios
    .get(`/api/users/${userId}/cash`, getConfig())
    .then((res) => {
      setCash(res.data.cash);
    })
    .catch((err) => {
      console.log(err);
    });

  //get value from backend
  axios
    .get(`/game/${userId}/value`, getConfig())
    .then((res) => {
      setValue(res.data.value);
    })
    .catch((err) => {
      console.log(err);
    });

  axios
    .get(`/game/leader`, getConfig())
    .then((res) => {
      setLeader(res.data.value);
      setName(res.data.winner);
    })
    .catch((err) => {
      console.log(err);
    });

     axios
    .get(`/game/${userId}/rank`, getConfig())
    .then((res) => {
      setRank(res.data.rank);
    })
    .catch((err) => {
      console.log(err);
    });


  const totalValue = parseFloat(cash) + parseFloat(value);

  const handleAddHolding = () => {
    dispatch(addGameHolding({ id, name, gameHoldings }, stockCode, quantity));

    setStockCode('');
    setQuantity('');
  };

  const hanldleGameRest = () => {
    axios
      .post(`/game/${userId}/reset`, getConfig())
      .then((res) => {
        setValue(0);
        setCash(50000);
      })
      .catch((err) => {
        console.log(err);
      });

    //    dispatch(resetGame());
    dispatch({ type: 'GAME_RESET' });
  };

  const handleEditHolding = (e, p) => {
    dispatch(sellGameHolding(p, e));
  };

  const handleSnackBarClose = () => {
    setSnackbarOpen(false);
  };

  React.useEffect(() => {
    setSnackbarOpen(true);
  }, [confirmation, confirmationError]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={0}>
        <Grid item xs={12} sm={4}>
          <h6
            className="title"
            style={{ marginLeft: '0px', marginTop: '30px', fontSize: '40px' }}
          >
            AUD {currencyFormatter.format(totalValue)}
          </h6>
          <h7
            className="subtitle"
            style={{ marginLeft: '10px', fontSize: '20px' }}
          >
            Total Worth
          </h7>
        </Grid>
        <Grid item xs={12} sm={4}>
          <h6
            className="title"
            style={{ marginLeft: '-50px', marginTop: '30px', fontSize: '40px' }}
          >
            AUD {currencyFormatter.format(cash)}
          </h6>
          <h7
            className="subtitle"
            style={{ marginLeft: '10px', fontSize: '20px' }}
          >
            Cash
          </h7>
        </Grid>
        <Grid item xs={12} sm={4}>
          <h6
            className="title"
            style={{ marginLeft: '-50px', marginTop: '30px', fontSize: '40px' }}
          >
            AUD {currencyFormatter.format(value)}
          </h6>
          <h7
            className="subtitle"
            style={{ marginLeft: '10px', fontSize: '20px' }}
          >
            Portfolio Value
          </h7>
        </Grid>


      </Grid>

	<Table>
	<TableRow>
		<TableCell>
		<h7> Add Stock to Portfolio </h7>
		<form noValidate autoComplete="off" style={{ position: 'relative' }}>
        <TextField
          id="stock-code"
          label="Stock code"
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value.toUpperCase())}
          required={true}
        />
        <FormControl>
          <InputLabel htmlFor="quantity">Quantity *</InputLabel>
          <Input
            id="quantity"
            type="number"
            required={true}
            value={quantity}
            onChange={(e) => setQuantity(Math.round(e.target.value))}
            inputProps={{ min: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={handleAddHolding}
            style={{ left: '170px', top: '-35px', postion: 'absolute' }}
          >
            Add Holding
          </Button>
        </FormControl>
      </form>
      <br></br>
      <h6 className={classes.warning}>$10 BROKERAGE FEE ON PURCHASE OR SALE</h6>
      <Button
            variant="contained"
            color="primary"
            style={{ left: '360px', top: '-35px', postion: 'absolute' }}
            onClick={hanldleGameRest}
          >
            RESET GAME
          </Button>
      </TableCell>
		<TableCell>

          <h6 className="title" style = {{marginLeft:"100px",marginTop:"30px",fontSize:"40px"}}> AUD {currencyFormatter.format(leader)} </h6>
          <h7 className="subtitle"style = {{marginLeft:"130px",fontSize:"20px"}}>Current Leader <b>{lname}</b>'s Total Worth</h7>
          </TableCell>

         <TableCell>
         <h7 className="subtitle"style = {{marginLeft:"10px",fontSize:"20px"}}>Your current position: {rank}</h7>
         </TableCell>
    </TableRow>
	</Table>


      <Table>
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell className={classes.tableHeaderRows}>Code</TableCell>
            <TableCell className={classes.tableHeaderRows}>Quantity</TableCell>
            <TableCell className={classes.tableHeaderRows}>Buy Price</TableCell>
            <TableCell className={classes.tableHeaderRows}>
              Current Price
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody id="1">
          {gameHoldings.map((h) => (
            <TableRow>
              <TableCell>{h.stock_code.toUpperCase()}</TableCell>
              <TableCell>{h.quantity}</TableCell>
              <TableCell>{h.price}</TableCell>
              <TableCell>{h.stock.price}</TableCell>
              <TableCell className={classes.actions} align="right">
                <PopUp
                  handler={handleEditHolding}
                  p={h.id}
                  string="Number to sell"
                />
              </TableCell>
            </TableRow>
          ))}
          {gameHoldings.length === 0 && (
            <TableRow>
              <TableCell>No holdings!!</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {(confirmation || confirmationError) && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleSnackBarClose}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleSnackBarClose}
            severity={confirmation ? 'success' : 'error'}
          >
            {confirmation ? confirmation : confirmationError}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}

const mapStateToProps = (state) => {
  const { gamePortfolio } = state;
  const {
    gameHoldings,
    isFetching,
    error,
    confirmation,
    confirmationError,
  } = gamePortfolio;
  return { gameHoldings, isFetching, error, confirmation, confirmationError };
};

GamePage.propTypes = {
  gameHoldings: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(GamePage);
