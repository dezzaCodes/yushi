import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CircularProgress from '@material-ui/core/CircularProgress';

import { fetchStockDetailsIfNeeded } from '../../actions/selectedStocks';
import Error from '../Error';
import StockHistoryGraph from './StockHistoryGraph';

import { Grid, Container } from '@material-ui/core';

class StockContainer extends Component {
  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { code },
      },
    } = this.props;
    dispatch(fetchStockDetailsIfNeeded(code));
  }

  componentDidUpdate(prevProps) {
    const {
      dispatch,
      match: {
        params: { code },
      },
    } = this.props;
    if (code !== prevProps.match.params.code) {
      dispatch(fetchStockDetailsIfNeeded(code));
    }
  }

  render() {
    const {
      selectedStocks,
      match: {
        params: { code },
      },
    } = this.props;
    if (!selectedStocks[code]) return null;
    const { isFetching, error, details } = selectedStocks[code];

    return (
      <Container maxWidth="lg">
        {isFetching ? (
          <CircularProgress />
        ) : error ? (
          <Error {...error} />
        ) : (
          <Grid container>
            <Grid item xs={12} className="mb-4">
              <h1>
                {code}: {details.company_name}
              </h1>
              <h6>{details.sector}</h6>
            </Grid>
            <Grid item xs={12}>
              <div className="row ml-0 mr-0 secondary-container pt-4">
                <div className="col">
                  <h6>Price</h6>
                  <p>{details.price}</p>
                </div>
                <div className="col">
                  <h6>Change</h6>
                  <p style = {{color: details.change_percent.includes("-")? "red":" #33cc33"}}>
                    {details.change_percent}
                  </p>
                </div>
                {details.sector !== 'Exchanged Traded Fund' && (
                  <div className="col">
                    <h6>Open</h6>
                    <p>{details.open}</p>
                  </div>
                )}
                <div className="col">
                  <h6>Previous Close</h6>
                  <p>{details.previous_close}</p>
                </div>
              </div>

              <hr />

              <div className="row ml-0 mr-0 mt-4">
                <div className="col">
                  <h6>Volume</h6>
                  <p>{details.volume}</p>
                </div>
                <div className="col">
                  <h6>Ask Price</h6>
                  <p>{details.ask_price}</p>
                </div>
                <div className="col">
                  <h6>Bid Price</h6>
                  <p>{details.bid_price}</p>
                </div>
                <div className="col">
                  <h6>Net Assets</h6>
                  <p>{details.market_cap}</p>
                </div>
              </div>

              <div className="row ml-0 mr-0">
                <div className="col">
                  <h6>Price/Earnings Ratio</h6>
                  <p>{details.PE_value}</p>
                </div>
                <div className="col">
                  <h6>Day Range</h6>
                  <p>{details.day_range}</p>
                </div>
                <div className="col">
                  <h6>52 Week Range</h6>
                  <p>{details._52_week_range}</p>
                </div>
                <div className="col">
                  <h6>Ex-Dividend Date</h6>
                  <p>{details.ex_div_date}</p>
                </div>
              </div>
            </Grid>

            <Grid item xs={12}>
              <StockHistoryGraph code={code} />
            </Grid>

            <Grid item xs={12} className="secondary-container p-4">
              <h5 className="mb-3">Company Description</h5>
              <p>{details.description}</p>
              <p>
                More info at: <a href={details.url}>{details.url}</a>
              </p>
            </Grid>
          </Grid>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  const { selectedStocks } = state;
  return { selectedStocks };
};

StockContainer.propTypes = {
  selectedStocks: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(StockContainer);
