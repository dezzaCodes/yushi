import React, { useState } from 'react';
import axios from 'axios';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Input,
  Button,
  CircularProgress,
  Grid,
  Container,
  Snackbar,
  IconButton,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import SimulationDisplay from './SimulationDisplay';

function MonteCarlo() {
  // For monte carlo form
  const [period, setPeriod] = useState('2y');
  const [useGBM, setUseGBM] = useState(true);
  const [useWeighted, setUseWeighted] = useState(true);
  const [stockCode, setStockCode] = useState('');
  const [nSimulations, setNSimulations] = useState(200);
  const [timeInterval, setTimeInterval] = useState(365);
  const [timeStep, setTimeStep] = useState(1);

  // For fetching data from backend
  const [isFetching, setIsFetching] = useState(false);
  const [simulations, setSimulations] = useState(null);

  // showing errors
  const [snackBarError, setSnackBarError] = useState(null);
  const [open, setOpen] = useState(false);
  const [fetchingError, setFetchingError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsFetching(true);
    setFetchingError(null);
    setSnackBarError(null);

    // Make post request to backend to simulate
    axios
      .post('/analytics/monte-carlo-sim', {
        stock_code: stockCode,
        period: period,
        num_simulations: parseInt(nSimulations),
        t_interval: parseInt(timeInterval),
        use_weighted: useWeighted,
        use_gbm: useGBM,
        time_step: parseInt(timeStep),
      })
      .then((res) => {
        if (Object.keys(res.data).length > 0) {
          fetchSuccess(res.data);
        } else {
          fetchError({
            message: 'Invalid stock code used.',
          });
        }
      })
      .catch(fetchError);
  };

  const fetchSuccess = (data) => {
    setIsFetching(false);

    // rearrange data for display in line graph (need to be a list)

    // order by simulated day
    const simulations = [];
    for (let i = 0; i < Object.keys(data).length; i++) {
      const key = Object.keys(data)[i];
      const daysSimulation = data[key];
      simulations.push(daysSimulation);
    }

    setSimulations(simulations);
  };

  const fetchError = (error) => {
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
    <Container maxWidth="lg">
      {/* Info on Monte Carlo simulation */}
      <Container maxWidth="lg" className="analysis-container">
        <h2 className="title">
          Monte Carlo Simulation <br />
          (Stock Price Simulation)
        </h2>
        <div className="text">
          <p>
            This Monte Carlo simulation tool provides a way to predict stock
            growth based on historical trends. There are several parameters that
            can be modified to test out different market environments:
          </p>
          <ul>
            <li>
              <strong>Use Weighted Mean & Standard Deviation</strong>: When this
              is toggled on, the more recent historical prices will impact the
              final prediction prices more heavily than older prices. This is
              recommended particularly when calculating more short term prices.
            </li>
            <li>
              <strong>Use Geometric Browian Motion (GBM)</strong>: When this is
              toggled on, the model will simulate prices in stochastic
              situations by introducing "shock" and "drift" variables.
              Otherwise, the model will assume that the market is deterministic.
            </li>
            <li>
              <strong>Time Step of Simulation</strong>: When this is greater
              than 1, the model will simulate prices for every nth day which
              will affect the "shock" and "drift" of GBM
            </li>
          </ul>
        </div>
      </Container>

      {/* Form for monte carlo simulation parameters */}
      <Container maxWidth="md" className="analysis-container">
        <form
          id="monte-carlo-simulation-form"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Grid container spacing={3} justify="center">
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="stock-code-label">Stock Code</InputLabel>
                <Input
                  required
                  placeholder="ex. ASX"
                  value={stockCode}
                  onChange={(e) => setStockCode(e.target.value.toUpperCase())}
                  inputProps={{
                    'aria-label': 'stock-code-input',
                    maxLength: 3,
                    minLength: 3,
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8} container>
              <Grid item xs={12}>
                <FormControlLabel
                  onChange={() => setUseWeighted(!useWeighted)}
                  control={
                    <Checkbox checked={useWeighted} name="weighted-toggle" />
                  }
                  label="Use Weighted Mean & Standard Deviation for Calculation"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={7}>
                <FormControlLabel
                  onChange={() => setUseGBM(!useGBM)}
                  control={<Checkbox checked={useGBM} name="gbm-toggle" />}
                  label="Use Geometric Browian Motion"
                  variant="outlined"
                />
              </Grid>

              {useGBM === true && (
                <Grid item xs={5}>
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
                        max: timeInterval,
                        min: 1,
                      }}
                    />
                  </FormControl>
                </Grid>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="mc-period-select-label">
                  Period of Historical Data Used
                </InputLabel>
                <Select
                  labelId="mc-period-select-label"
                  id="mc-period-select"
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
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="time-interval-label">
                  Number of Days to Simulate
                </InputLabel>
                <Input
                  value={timeInterval}
                  onChange={(e) => setTimeInterval(e.target.value)}
                  inputProps={{
                    'aria-label': 'time-interval-input',
                    type: 'number',
                    max: 2000,
                    min: 1,
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item>
              <Button
                className="button-container"
                type="submit"
                color="primary"
                variant="contained"
              >
                Simulate
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

      {/* Display the simulations on line chart */}
      {!fetchingError && !isFetching && simulations && (
        <SimulationDisplay data={simulations} timeStep={timeStep} />
      )}
    </Container>
  );
}

export default MonteCarlo;
