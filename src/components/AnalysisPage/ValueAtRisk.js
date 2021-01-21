import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Input,
  Button,
  Grid,
  Container,
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Snackbar,
  IconButton,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import SimulationDisplay from './SimulationDisplay';

const colours = [
  '#396AB1',
  '#DA7C30',
  '#3E9651',
  '#CC2529',
  '#535154',
  '#6B4C9A',
  '#922428',
  '#948B3D',
];

const percentFormatter = Intl.NumberFormat('en-AU', {
  style: 'percent',
  maximumFractionDigits: 2,
});

const dateFormat = 'DD/MM/YY';

const monthDayTickFormatter = (tick) => {
  return moment(tick, dateFormat).format('DD/MM');
};

const YearTickFormatter = (tick) => {
  return moment(tick, dateFormat).format('YYYY');
};

export function ValueAtRisk({ chosenPortfolio, showPortfolioForm }) {
  // For creating a portfolio to calculate VaR & ES with
  const [stockCode, setStockCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [portfolio, setPortfolio] = useState(chosenPortfolio);

  // Parameters for calculation
  const [method, setMethod] = useState('historical');
  const [nDays, setNDays] = useState(1);
  const [percentile, setPercentile] = useState(95);
  const [period, setPeriod] = useState('2y');

  // extra parameters for monte carlo simuation method
  const [timeStep, setTimeStep] = useState(1);
  const [nSimulations, setNSimulations] = useState(200);

  // for fetching data from backend
  const [isFetching, setIsFetching] = useState(false);
  const [VaR, setVaR] = useState(null);
  const [ES, setES] = useState(null);
  const [historicalPrices, setHistoricalPrices] = useState(null);
  const [simulations, setSimulations] = useState(null);
  const [endingPrices, setEndingPrices] = useState(null);

  // showing errors
  const [snackBarError, setSnackBarError] = useState(null);
  const [open, setOpen] = useState(false);
  const [fetchingError, setFetchingError] = useState(null);

  useEffect(() => {
    setPortfolio(chosenPortfolio);
  }, [chosenPortfolio]);

  // Methods for handling portfolio for simulation
  const handleAddStock = (e) => {
    e.preventDefault();

    if (!stockCode || stockCode.length !== 3) return;

    const updatedPortfolio = { ...portfolio };
    if (!portfolio[stockCode]) {
      updatedPortfolio[stockCode] = parseInt(quantity);
    } else {
      updatedPortfolio[stockCode] += parseInt(quantity);
    }
    setPortfolio(updatedPortfolio);

    // Reset inputs
    setStockCode('');
    setQuantity(1);
  };

  const handleResetPortfolio = () => {
    setPortfolio({});
  };

  // Fetching VaR and ES results using parameters given
  const handleVaRSubmit = (e) => {
    e.preventDefault();

    if (Object.keys(portfolio).length === 0) {
      // TODO: show error
      setSnackBarError('Portfolio has no stocks!');
      setOpen(true);
      return;
    }

    setFetchingError(null);
    setSnackBarError(null);
    setIsFetching(true);

    axios
      .post('/analytics/VaR-ES-sim', {
        portfolio,
        n_days: parseInt(nDays),
        percentile: parseInt(percentile),
        period,
        method: method === 'monte-w' ? 'monte' : method,
        time_step: parseInt(timeStep),
        num_simulations: parseInt(nSimulations),
        use_weighted: method === 'monte-w',
      })
      .then((res) => fetchVaRSuccess(res.data))
      .catch((err) => fetchVaRError(err));
  };

  const fetchVaRSuccess = (resData) => {
    setIsFetching(false);
    setFetchingError(null);
    setSnackBarError(null);

    const { VaR, expected_shortfall, data, ending_prices } = resData;
    // console.log(resData);
    setVaR(VaR);
    setES(expected_shortfall);

    if (data) {
      // reformat data for display
      const reformatted = data.map((d) => {
        return { ...d, date: moment(d.date).format(dateFormat) };
      });
      setHistoricalPrices(reformatted);
    } else {
      setHistoricalPrices(null);
    }

    if (resData.simulations) {
      // reformat simulation data for display
      const sims = [];
      for (let i = 0; i < Object.keys(resData.simulations).length; i++) {
        const key = Object.keys(resData.simulations)[i];
        const daysSimulation = resData.simulations[key];
        sims.push(daysSimulation);
      }
      setSimulations(sims);
    } else {
      setSimulations(null);
    }

    if (ending_prices) {
      // group the ending prices into categories
      const roundToNumber = 2;
      const prices = {};
      for (let i = 0; i < ending_prices.length; i++) {
        const ending = ending_prices[i]['Ending_Prices'];
        const base = ending - (ending % roundToNumber);
        const category = `${base} - ${base + roundToNumber - 1}`;
        if (!prices[category]) {
          prices[category] = 1;
        } else {
          prices[category] += 1;
        }
      }

      // convert prices into a list for display
      const categorisedEndingPrices = Object.keys(prices).map((k) => {
        return { range: k, amount: prices[k] };
      });

      setEndingPrices(categorisedEndingPrices);
    } else {
      setEndingPrices(null);
    }
  };

  const fetchVaRError = (error) => {
    setIsFetching(false);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 422) {
        // Snackbar error because it to do with form
        setSnackBarError(
          `${error.response.status} Error: ${error.response.data}`
        );
        setOpen(true);
      } else {
        setFetchingError(
          `${error.response.status} Error: ${error.response.data}`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      setFetchingError('Request was made but no response was received.');
    } else {
      // Something happened in setting up the request that triggered an Error
      setFetchingError(error.message);
    }
  };

  const handleSnackBarClose = () => {
    setOpen(false);
    setSnackBarError(null);
  };

  return (
    <React.Fragment>
      <Container maxWidth="lg" className="analysis-container">
        <h2 className="title">
          Value at Risk and
          <br /> Expected Shortfall Calculation
        </h2>
        <div className="text">
          <p>
            This tool calculates the <strong>Value at Risk (VaR)</strong> and{' '}
            <strong>Expected Shortfall (ES)</strong> of a portfolio. The VaR
            statistic refers to the maximum loss expected (or worst case
            scenario) on a portfolio, over a given time period and given a
            specified degree of confidence. The ES statistic is an alternative
            to VaR that is more sensitive to the shape of the tail of the loss
            distribution; it takes the mean of losses between the VaR level and
            maximum loss level. There are several methods this tool can use to
            calculate this risk:
          </p>
          <ul>
            <li>
              <strong>Historical Method</strong>: With this method, it
              re-organizes actual historical returns and then assumes that
              history will repeat itself from a risk perspective.
            </li>
            <li>
              <strong>Variance-Covariance Method</strong>: This method assumes
              that stock returns are normally distributed and bases the risk on
              its expected return and standard deviation.
            </li>
            <li>
              <strong>Monte Carlo Method</strong>: This involves simulating
              future stock prices (using Geometric Browian Motion) and
              calculates the value of risk from these hypothesised trials.
            </li>
          </ul>
        </div>
      </Container>

      {/* Stocks in portfolio for simulation */}
      <Container maxWidth="md" className="analysis-container">
        <Grid container spacing={5} alignItems="center" justify="center">
          <Grid xs={12} md={3} item>
            <span>Portfolio to Calculate:</span>
          </Grid>

          {/* List of stocks in portfolio */}
          <Grid item xs={12} md={9} container spacing={3}>
            {Object.keys(portfolio).map((k) => (
              <Grid key={k} item>
                <span>
                  {k}: {portfolio[k]}
                </span>
              </Grid>
            ))}
            {Object.keys(portfolio).length === 0 && (
              <Grid item>
                <span>Nothing added yet!</span>
              </Grid>
            )}
          </Grid>

          {/* Form to add stocks into portfolio for simulation */}
          {showPortfolioForm && (
            <Grid item xs={12}>
              <form id="add-stock-to-portfolio-form" onSubmit={handleAddStock}>
                <Grid
                  container
                  spacing={3}
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={6} md={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="stock-code-label">Stock Code</InputLabel>
                      <Input
                        placeholder="ex. ASX"
                        value={stockCode}
                        onChange={(e) =>
                          setStockCode(e.target.value.toUpperCase())
                        }
                        inputProps={{
                          'aria-label': 'stock-code-input',
                          maxLength: 3,
                          minLength: 3,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="quantity">Quantity</InputLabel>
                      <Input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        inputProps={{
                          'aria-label': 'time-step-input',
                          type: 'number',
                          min: 1,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={4} md={2} container justify="center">
                    <Button
                      type="submit"
                      id="add-stock-btn"
                      variant="contained"
                      color="secondary"
                    >
                      Add Stock
                    </Button>
                  </Grid>
                  <Grid item xs={4} md={3} container justify="center">
                    <Button
                      onClick={handleResetPortfolio}
                      id="reset-portfolo-btn"
                      variant="contained"
                      color="secondary"
                    >
                      Reset Portfolio
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Parameters for Calculating Value At Risk */}
      <Container maxWidth="md" className="analysis-container">
        <form id="VaR-ES-form" onSubmit={handleVaRSubmit}>
          <Grid container justify="center" alignItems="center" spacing={3}>
            <Grid item xs={12} md={7}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <MenuItem value="historical">
                    Using only Historical Data
                  </MenuItem>
                  <MenuItem value="covariance">
                    Variance-Covariance of Historical Data
                  </MenuItem>
                  <MenuItem value="monte">
                    Monte Carlo Simuation (non-weighted, geometric browian
                    motion)
                  </MenuItem>
                  <MenuItem value="monte-w">
                    Monte Carlo Simuation (weighted, geometric browian motion)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="n-days-label">
                  Number of Days to Simulate
                </InputLabel>
                <Input
                  value={nDays}
                  onChange={(e) => setNDays(e.target.value)}
                  inputProps={{
                    'aria-label': 'n-days-input',
                    type: 'number',
                    min: 1,
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="period-select-label">
                  Period of Historical Data Used
                </InputLabel>
                <Select
                  labelId="period-select-label"
                  id="period-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  {/* 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max */}
                  <MenuItem value="1mo">1 months</MenuItem>
                  <MenuItem value="3mo">3 months</MenuItem>
                  <MenuItem value="6mo">6 months</MenuItem>
                  <MenuItem value="1y">1y</MenuItem>
                  <MenuItem value="2y">2y</MenuItem>
                  <MenuItem value="5y">5y</MenuItem>
                  <MenuItem value="10y">10y</MenuItem>
                  <MenuItem value="max">All</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="percentile-label">Confidence Level</InputLabel>
                <Input
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                  inputProps={{
                    'aria-label': 'percentile-input',
                    type: 'number',
                    max: 99,
                    min: 1,
                  }}
                />
              </FormControl>
            </Grid>

            {/* Extra parameters for monte carlo method */}
            {(method === 'monte' || method === 'monte-w') && (
              <React.Fragment>
                <Grid item xs={6} md={5}>
                  <FormControl fullWidth>
                    <InputLabel id="n-simulations-label">
                      Number of Simulations
                    </InputLabel>
                    <Input
                      value={nSimulations}
                      onChange={(e) => setNSimulations(e.target.value)}
                      inputProps={{
                        'aria-label': 'number-of-simulations-input',
                        type: 'number',
                        max: 2000,
                        min: 1,
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={5}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="time-step-label">
                      Time Step of Simulation
                    </InputLabel>
                    <Input
                      value={timeStep}
                      onChange={(e) => setTimeStep(e.target.value)}
                      inputProps={{
                        'aria-label': 'time-step-input',
                        type: 'number',
                        max: nDays,
                        min: 1,
                      }}
                    />
                  </FormControl>
                </Grid>
              </React.Fragment>
            )}
            <Grid item xs={12} container justify="center" alignItems="center">
              <Button type="submit" color="primary" variant="contained">
                Calculate VaR & ES
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>

      {isFetching && <CircularProgress />}

      {/* Displaying any errors that occurred */}
      {snackBarError && (
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleSnackBarClose}
          message={snackBarError}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSnackBarClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      )}
      {fetchingError && <Alert severity="error">{fetchingError}</Alert>}

      {/* Displaying results of calculation */}
      {!fetchingError && !isFetching && (VaR || ES) && (
        <React.Fragment>
          <h3>Results</h3>
          <p>Value at Risk: {percentFormatter.format(VaR)}</p>
          <p>Expected Shortfall: {percentFormatter.format(ES)}</p>

          <ExpansionPanel className="analysis-container">
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="var-es-extra-content"
              id="var-es-header"
            >
              {simulations && 'View Simulations Generated'}
              {historicalPrices && 'View Historical Data Used'}
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container spacing={3}>
                {/* Display Extra info for monte carlo simuation method */}
                {simulations && (
                  <Grid item xs={12}>
                    <h6>Simulated Prices</h6>
                    <SimulationDisplay data={simulations} timeStep={timeStep} />
                  </Grid>
                )}
                {endingPrices && (
                  <Grid item xs={12}>
                    <h6>Distribution of Simulated Ending Prices</h6>
                    <ResponsiveContainer width="80%" height={400}>
                      <AreaChart
                        data={endingPrices}
                        margin={{ left: 10, bottom: 50, right: 5, top: 5 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="range"
                          label={{
                            value: 'Range of Simulated Ending Prices',
                            position: 'insideBottom',
                            offset: -10,
                          }}
                        />
                        <YAxis
                          dataKey="amount"
                          label={{
                            value: 'Amount of Simulations',
                            angle: -90,
                            position: 'insideBottomLeft',
                          }}
                          name="Amount"
                        />
                        <Tooltip />
                        <Area dataKey="amount" type="monotone" name="Amount" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Grid>
                )}

                {/* Display Extra info for other methods */}
                {historicalPrices && (
                  <Grid item xs={12}>
                    <h6 className="subtitle">
                      <strong>Historical Worth of Portfolio</strong>
                    </h6>
                    <ResponsiveContainer width="90%" height={400}>
                      <LineChart
                        data={historicalPrices}
                        margin={{ left: 5, bottom: 50, right: 5, top: 5 }}
                      >
                        <Tooltip />
                        <XAxis
                          dataKey="date"
                          tickFormatter={monthDayTickFormatter}
                          minTickGap={30}
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={YearTickFormatter}
                          xAxisId="year"
                          minTickGap={300}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <YAxis domain={['auto', 'auto']} />
                        <Line
                          dataKey="Port_Value"
                          name="Portfolio Value"
                          dot={false}
                        />
                        {Object.keys(portfolio).map((k, i) => (
                          <Line
                            dataKey={k}
                            key={k}
                            dot={false}
                            stroke={colours[i % colours.length]}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                )}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

ValueAtRisk.propTypes = {
  chosenPortfolio: PropTypes.object.isRequired,
  showPortfolioForm: PropTypes.bool.isRequired,
};

export default function ValueAtRiskPage() {
  return (
    <Container maxWidth="lg">
      <ValueAtRisk chosenPortfolio={{}} showPortfolioForm={true} />
    </Container>
  );
}
