import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import {
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Button,
    Grid,
    CircularProgress,
} from '@material-ui/core';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

import ScreenerDisplay from './ScreenerDisplay';
import Typography from '@material-ui/core/Typography';

import { withStyles, makeStyles } from '@material-ui/core/styles';

import './screenerStyle.css';

const marks = [
  {value: 0,},{value: 10,},{value: 20,},{value: 30,},{value: 40,},
  {value: -10,},{value: -20,},{value: -30,},
  {value: -40,}
];

const marks2 = [
  {value: 0,},{value: 10,},{value: 15,},{value: 5,},{value: -5,},
  {value: -10,},{value: -15,}
];

const CoolSlider = withStyles({
  root: {
    color: '#76abe0',
    height: 8,
  },
  thumb: {
    height: 15,
    width: 15,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -5,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-125% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
  mark: {
    backgroundColor: '#bfbfbf',
    height: 8,
    width: 1,
    marginTop: -3,
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
})(Slider);

function StockScreener() {
    // Hooks for stock screener form - declare new state called strategy
    const [strategy, setStrategy] = useState('yield')

    // Hooks for fetching data from backend
    const [isFetching, setIsFetching] = useState(null)
    const [stocks, setStocks] = useState(null);

    // Custom Strats
    const [divYield, setYield] = useState([0,0])
    const [PE, setPE] = useState([0,0])
    const [ROE, setROE] = useState([0,0])

    // Hooks for showing errors
    const [fetchingError, setFetchingError] = useState(null);

    // Style Sheet
    const style = {
        width:'30rem',
        height:'15rem',
        top:'110px',
        right:'100px'
    }

    function valuetext(value) {
      return `${value}`;
    }

    const handleSubmit = (e) => {
      e.preventDefault();
        
      setIsFetching(true);
      setFetchingError(null);

      // Make post request to backend to screener
      axios.post('/analytics/screener', {
        strat_value: strategy,
        div_Yield: divYield,
        PE_value: PE,
        ROE_value: ROE,
      })
      .then((response) => {
        // data stored in response
        // load returned stocks into state and display into table\
        fetchSuccess(response.data);
      }).catch(err => {
        console.log(err)
      })
    };

    // Do stuff after fetch is succesfful 
    const fetchSuccess = (data) => {
      setIsFetching(false);
      // get stuff ready for table
      setStocks(data);
    };

    const handlePEChange = (event, newValue) => {
      setPE(newValue);
    };

    const handleROEChange = (event, newValue) => {
      setROE(newValue);
    };

    const handleYieldChange = (event, newValue) => {
      setYield(newValue);
    };

    return (
      <React.Fragment>
        <Container maxWidth="xl" className="analysis-container">
        <Row className = "title">
          Stock Screener
          </Row>
        <Row className = "text">
          <p>
          The stock screener allows you to screen through the stocks listed on the ASX300 based on your investing strategy/goal.
          <br></br> Select a strategy and see which stocks match the criteria. 
          </p>
          <br></br><br></br>          
          <ul>
            <li>
            <strong>Stock Yield: </strong>
            The stock yield strategy screens a stock based on its dividend yield and will only consider large-cap stocks.
            <br></br> The screener will return stocks with a dividend yield greater than 0.052.
            </li>
            <li>
            <strong>Stock Growth: </strong>
            The stock growth strategy screens a stock based on its return on equity and its price to earnings ratio.
            <br></br>The screener will return stocks with a return on equity greater than 0.1 and a price to earnings ratio less than the market ratio.
            </li>
            <li>
            <strong>Stock Value: </strong>
            The stock value strategy screens a stock based on its price to earnings ratio compared to the market price to earnings ratio.
            <br></br>The screener will return stocks that have a price to earnings ratio less than the market's price to earnings ratio.
            </li>
            <li>
            <strong>Custom: </strong>
            Customise the dividend yield, price earning ratio and return on equity ratio to your liking. 
            <br></br>By entering no values, the screener will return the stocks listed in the ASX300. 
            </li>
          </ul>
        </Row>
        <Row>
          <Col xs = {1}></Col>
          <Col>
          <form 
            id = "strategy-form"
            autoComplete = "off"
            onSubmit = {handleSubmit}
          >
            <FormControl fullWidth>
              <InputLabel id = "mc-trade-strategy-select-label">
                Strategy Goal:
              </InputLabel>
              <Select
                labelID = "mc-trade-strategy-select-label"
                id = "mc-strategy-select"
                value = {strategy}
                onChange = {(e) => setStrategy(e.target.value)}   //set strategy 
              >
                <MenuItem value = "yield">Stock Yield</MenuItem>
                <MenuItem value = "growth">Stock Growth</MenuItem>
                <MenuItem value = "value">Stock Value (based on P/E)</MenuItem>
                <MenuItem value = "custom"> Custom </MenuItem>
              </Select>
            </FormControl>

            {/* Extra parameters for custom */}
            {(strategy === "custom") && (
              <React.Fragment>
                <br></br><br></br>
                <Grid container spacing = {3}>
                  <Grid item xs = {4}> 
                  <FormControl fullWidth>
                      <Typography id="n-divYield">Dividend Yield</Typography>
                      <CoolSlider
                        marks = {marks2}
                        value={divYield}
                        onChange={handleYieldChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        getAriaValueText={valuetext}
                        min = {-20}
                        max = {20}
                        step ={0.01}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs ={4}>
                    <FormControl fullWidth>
                      <Typography id="n-PE">Price Earnings Ratio</Typography>
                      <CoolSlider
                        value={PE}
                        marks = {marks2}
                        onChange={handlePEChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        getAriaValueText={valuetext}
                        min = {-20}
                        max = {20}
                        step ={0.01}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs = {4}>
                    <FormControl fullWidth>
                      <Typography id="n-ROE">Return on Equity</Typography>
                      {/* <Input
                        value={ROE}
                        onChange={(e) => setROE(e.target.value)}
                        inputProps={{
                          'aria-label': 'ROE-input',
                          type: 'number', step: '0.01',
                          max: 100,
                          min: -100,
                        }}
                      /> */}
                      <CoolSlider
                        value={ROE}
                        marks = {marks}
                        onChange={handleROEChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        getAriaValueText={valuetext}
                        min = {-50}
                        max = {50}
                        step ={0.01}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </React.Fragment>
            )}
            <br></br><br></br>
            <Button type ="submit" color = "primary" variant = "contained">
              Select
            </Button>
          </form>
          </Col>
          <Col xs = {1}></Col>
          </Row>
          {isFetching && <CircularProgress />}
          <br></br><br></br>
          
        {/* Display results */}
        {!isFetching && stocks &&(
          <ScreenerDisplay data={stocks} />
        )}
        </Container>
      </React.Fragment>
    );
}

export default StockScreener;