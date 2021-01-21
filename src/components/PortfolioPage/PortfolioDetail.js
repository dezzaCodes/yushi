import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TableContainer,
  TablePagination,
  Button,
  Input,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';

import {
  addHoldingToPortfolio,
  deleteHoldingFromPortfolio,
  fetchPortfolioHistoricalPerformanceIfNeeded,
  fetchPortfoliosPerformance,
  fetchHoldingGroupHistoricalPerformance,
  fetchPortfolioHistoricalPerformance,
} from '../../actions/portfolios';
import IndPortfolioPerformance from './IndPortfolioPerformance';
import { currencyFormatter } from './PortfoliosPerformance';
import { HoldingHistorical } from './PortfolioHistorical';
import { ValueAtRisk } from '../AnalysisPage/ValueAtRisk';

const useStyles = makeStyles((theme) => ({
  tableHeader: {
    backgroundColor: '#428bd5',
    textAlign: 'center',
  },
  tableHeaderRows: {
    color: '#edf4fb',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
	textAlign: 'center',
  },
  actions: {
    display: 'flex',
  },
  button: {
    marginLeft: '5px',
    marginRight: '5px',
  },
  form: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  sectionHeading: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

function PortfolioDetail({
  id,
  name,
  holdings,
  dispatch,
  dayPerformance,
  historicalPerformance,
  processingAdd,
}) {
  var today = new Date();
  const classes = useStyles();
  const [stockCode, setStockCode] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [date, setDate] = React.useState(
    today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0')
  );
  const [holdingGroups, setHoldingGroups] = React.useState({});
  const [holdingGroupHistory, setHoldingGroupHistory] = React.useState('');

  React.useEffect(() => {
    // need to update portfolio performance
    dispatch(fetchPortfoliosPerformance());
    dispatch(fetchPortfolioHistoricalPerformanceIfNeeded(id));

    // group holdings by stock code
    const tmp = {};
    holdings.forEach((h) => {
      if (!tmp[h.stock_code]) {
        tmp[h.stock_code] = [];
      }
      tmp[h.stock_code].push(h);
    });
    setHoldingGroups(tmp);

    // reset view for holding historical perf
    setHoldingGroupHistory('');
  }, [holdings, id, dispatch, setHoldingGroups]);

  const handleAddHolding = (e) => {
    e.preventDefault();

    dispatch(
      addHoldingToPortfolio(
        { id, name, holdings },
        stockCode,
        price,
        quantity,
        date
      )
    );

    // Reset form
    setStockCode('');
    setQuantity('');
    setPrice('');
    getDate();
  };

  const getDate = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    setDate(yyyy + '-' + mm + '-' + dd);
  };

  const handleDeleteHolding = (holding) => {
    dispatch(deleteHoldingFromPortfolio(holding, { id, name, holdings }));
  };

  const handleRefreshHistoricalPerfGraph = () => {
    dispatch(fetchPortfolioHistoricalPerformance(id));
  };

  const handleRefreshStockHistorical = () => {
    if (holdingGroupHistory) {
      dispatch(fetchHoldingGroupHistoricalPerformance(id, holdingGroupHistory));
    }
  };

  return (
    <React.Fragment>
      <h2 className="title">Portfolio: {name.toUpperCase()}</h2>

      {/* Displays Performance of individual Portfolio */}
      <IndPortfolioPerformance
        portfolioID={id}
        {...dayPerformance}
        historicalPerformance={historicalPerformance}
        handleRefreshHistoricalPerfGraph={handleRefreshHistoricalPerfGraph}
      />

      <h5 className={`subtitle ${classes.sectionHeading}`}>
        Individual Holdings Details
      </h5>

      {/* form for adding holdings */}
      <form
        autoComplete="off"
        className={classes.form}
        onSubmit={handleAddHolding}
      >
        <Grid container spacing={3} justify="flex-start" alignItems="center">
          <Grid item>
            <TextField
              id="stock-code"
              label="Stock code"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value.toUpperCase())}
              inputProps={{ minLength: 3, maxLength: 3 }}
              required={true}
            />
          </Grid>
          <Grid item>
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
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <InputLabel htmlFor="price">Price *</InputLabel>
              <Input
                id="price"
                type="number"
                required={true}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputProps={{ min: 0.01, step: 0.01 }}
              />
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <TextField
                id="date"
                label="Date Bought"
                type="date"
                value={date}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              type="submit"
            >
              {processingAdd && (
                <CircularProgress color="inherit" size="1rem" />
              )}
              Add Stock
            </Button>
          </Grid>
        </Grid>
      </form>

      <HoldingList
        data={holdings}
        fillWithEmpty={true}
        handleDelete={handleDeleteHolding}
      />

      {/* View historical performance of specific stock */}
      {holdingGroups && (
        <React.Fragment>
          <h5 className={`subtitle ${classes.sectionHeading}`}>
            Stock Holding Historical Performance (From Past Year / Date Bought)
          </h5>

          {/* Choosing which stock holding to view historical performance */}
          <div className={classes.row}>
            <FormControl className={classes.formControl}>
              <label>Choose Stock Holding To View:</label>
              <Select
                className={classes.formControl}
                value={holdingGroupHistory}
                onChange={(e) => setHoldingGroupHistory(e.target.value)}
                inputProps={{
                  name: 'stock-holding',
                  id: 'stock-holding',
                }}
              >
                <MenuItem value="">None</MenuItem>

                {Object.keys(holdingGroups).map((k, i) => (
                  <MenuItem value={k} key={i}>
                    {k}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              color="primary"
              variant="outlined"
              onClick={handleRefreshStockHistorical}
            >
              Refresh Graph
            </Button>
          </div>
        </React.Fragment>
      )}

      {/* Show chosen holding group historical performance  */}
      {holdingGroupHistory && (
        <HoldingHistorical
          {...historicalPerformance}
          portfolioID={id}
          stockCode={holdingGroupHistory}
        />
      )}

      {/* Analytical tools for Portfolio */}
      <hr style={{ marginTop: '3rem', marginBottom: '3rem' }} />
      <h5 className="subtitle">Analytical tools for Portfolio</h5>
      <PortfolioValueAtRisk holdings={holdings} />
    </React.Fragment>
  );
}

PortfolioDetail.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  holdings: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  dayPerformance: PropTypes.object.isRequired,
  historicalPerformance: PropTypes.object.isRequired,
};

function HoldingList({ data, fillWithEmpty, handleDelete }) {
  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, page) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell className={classes.tableHeaderRows}>ID</TableCell>
            <TableCell className={classes.tableHeaderRows}>Code</TableCell>
            <TableCell className={classes.tableHeaderRows}>Quantity</TableCell>
            <TableCell className={classes.tableHeaderRows}>
              Price Purchased
            </TableCell>
            <TableCell className={classes.tableHeaderRows}>
              Current Price
            </TableCell>
            <TableCell className={classes.tableHeaderRows}>
              Date Purchased
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((h, i) => (
              <TableRow key={i}>
                <TableCell className={classes.tableCell}>{h.id}</TableCell>
                <TableCell className={classes.tableCell}>{h.stock_code.toUpperCase()}</TableCell>
                <TableCell className={classes.tableCell}>{h.quantity}</TableCell>
                <TableCell className={classes.tableCell}>{currencyFormatter.format(h.price)}</TableCell>
                <TableCell className={classes.tableCell}>{currencyFormatter.format(h.stock.price)}</TableCell>
                <TableCell className={classes.tableCell}>{moment(h.date).format('DD/MM/YYYY')}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="secondary"

                    disableElevation
                    onClick={() => handleDelete(h)}
                    className={classes.button}
                  >
                    Remove Stock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          {data.length > 5 && fillWithEmpty && emptyRows > 0 && (
            <TableRow style={{ height: 48 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
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

HoldingList.propTypes = {
  data: PropTypes.array.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

function PortfolioValueAtRisk({ holdings }) {
  const [chosen, setChosen] = React.useState({});

  React.useEffect(() => {
    // go through all the holdings, count the number of total quantity for each stock there are
    const stocks = {};
    for (let i = 0; i < holdings.length; i++) {
      const h = holdings[i];
      if (stocks[h.stock_code]) {
        stocks[h.stock_code] += h.quantity;
      } else {
        stocks[h.stock_code] = h.quantity;
      }
    }

    setChosen(stocks);
  }, [holdings]);

  return <ValueAtRisk chosenPortfolio={chosen} showPortfolioForm={false} />;
}

export default PortfolioDetail;
