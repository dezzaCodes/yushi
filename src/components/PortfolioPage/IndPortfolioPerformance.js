import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Error from '../Error';
import { Link } from 'react-router-dom';

import {
  currencyFormatter,
  PrimaryStats,
  ShareDistributionGraph,
} from './PortfoliosPerformance';
import PortfolioHistorical from './PortfolioHistorical';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableContainer,
  TablePagination,
} from '@material-ui/core';

/* 
  data has properties: 
    - change(pin): -148.64999999999964
    - change_percent: "-3.267930750206091%"
    - current_worth: 4400.1
    - net_worth: 959.22
    - prev_net_worth: 1107.97
    - prev_worth: 4548.75
    - portfolio_performances: [
      holding_performances
    ]
*/

function IndPortfolioPerformance({
  isFetching,
  data,
  error,
  portfolioID,
  historicalPerformance,
  handleRefreshHistoricalPerfGraph,
}) {
  const [bestPerforming, setBestPerforming] = React.useState(null);
  const [worstPerforming, setWorstPerforming] = React.useState(null);
  const [portfolio, setPortfolio] = React.useState(null);

  React.useEffect(() => {
    setBestPerforming(null);
    setWorstPerforming(null);
    const { portfolio_performances } = data;
    if (!portfolio_performances) return;

    let portfolio = portfolio_performances.filter(
      (p) => p.portfolio_id === portfolioID
    );
    if (portfolio.length === 0) {
      return;
    }

    setPortfolio(portfolio[0]);
  }, [data, portfolioID]);

  React.useEffect(() => {
    if (!portfolio) return;
    const { holding_performances } = portfolio;
    if (!holding_performances || holding_performances.length === 0) return;
    let maxValue = -Infinity;
    let max = null;
    let minValue = Infinity;
    let min = null;
    holding_performances.forEach((p) => {
      if (!p.change_percent) return;
      const percent = p.change_percent;
      if (percent >= maxValue) {
        maxValue = percent;
        max = p;
      }
      if (percent <= minValue) {
        minValue = percent;
        min = p;
      }
    });
    setBestPerforming(max);
    setWorstPerforming(min);
  }, [portfolio]);

  /* 
      Displays only current portfolio stats
  */

  return (
    <React.Fragment>
      {error && <Error />}
      <Grid
        container
        spacing={7}
        className="performance-container"
        direction="row"
        alignItems="center"
        justify="space-around"
      >
        {isFetching && <CircularProgress />}
        {portfolio && (
          <React.Fragment>
            <PrimaryStats {...portfolio} />
            {portfolio.holding_performances &&
              bestPerforming &&
              worstPerforming && (
                <React.Fragment>
                  <Grid item xs={12} md={4} container spacing={4}>
                    <Grid item xs={12}>
                      <OtherStats
                        bestPerforming={bestPerforming}
                        worstPerforming={worstPerforming}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ShareDistributionGraph
                        distribution={portfolio.holding_performances}
                        nameKey="code"
                      />
                      <h6 className="subtitle">Stock Distribution</h6>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={8}
                    container
                    alignItems="center"
                    justify="center"
                  >
                    <PortfolioHistorical
                      {...historicalPerformance}
                      portfolioID={portfolioID}
                      refreshGraph={handleRefreshHistoricalPerfGraph}
                    />
                  </Grid>

                  <Grid item xs={11} md={9}>
                    {/* Table for Holding Group performances */}
                    <h5 className="subtitle">Stock Holding Performances</h5>
                    <HoldingGroupList
                      data={portfolio.holding_performances}
                      fillWithEmpty={true}
                    />
                  </Grid>
                </React.Fragment>
              )}
          </React.Fragment>
        )}
      </Grid>
    </React.Fragment>
  );
}

IndPortfolioPerformance.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  portfolioID: PropTypes.number.isRequired,
  historicalPerformance: PropTypes.object.isRequired,
  handleRefreshHistoricalPerfGraph: PropTypes.func.isRequired,
  error: PropTypes.object,
};

function OtherStats({ bestPerforming, worstPerforming }) {
  return (
    <Grid item xs={12} container alignItems="flex-end">
      {bestPerforming && (
        <Grid
          item
          xs={12}
          container
          spacing={1}
          alignItems="flex-start"
          justify="center"
        >
          <Grid item>
            <h6 className="subtitle">Best Performing:</h6>
          </Grid>
          <Grid item>
            <h6>{bestPerforming.code}</h6>
          </Grid>
          <Grid
            item
            className={
              bestPerforming.change > 0
                ? 'positive'
                : bestPerforming.change < 0
                ? 'negative'
                : 'neutral'
            }
          >
            <h6>
              {currencyFormatter.format(bestPerforming.change)} (
              {bestPerforming.change_percent}%)
              {bestPerforming.change > 0
                ? '▴'
                : bestPerforming.change < 0
                ? '▾'
                : '-'}
            </h6>
          </Grid>
        </Grid>
      )}
      {worstPerforming && (
        <Grid
          item
          xs={12}
          container
          spacing={1}
          alignItems="flex-start"
          justify="center"
        >
          <Grid item>
            <h6 className="subtitle">Worst Performing:</h6>
          </Grid>
          <Grid item>
            <h6>{worstPerforming.code}</h6>
          </Grid>
          <Grid
            item
            className={
              worstPerforming.change > 0
                ? 'positive'
                : worstPerforming.change < 0
                ? 'negative'
                : 'neutral'
            }
          >
            <h6>
              {currencyFormatter.format(worstPerforming.change)} (
              {worstPerforming.change_percent}%)
              {worstPerforming.change > 0
                ? '▴'
                : worstPerforming.change < 0
                ? '▾'
                : '-'}
            </h6>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

function HoldingGroupList({ data, fillWithEmpty }) {
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
      <Table>
        <TableHead className="table-header">
          <TableRow>
            <TableCell align="center">Code</TableCell>
            <TableCell align="center">Market Value</TableCell>
            <TableCell align="center">Daily Change</TableCell>
            <TableCell align="center">Total Change</TableCell>
            <TableCell align="center">Total Quantity</TableCell>
            <TableCell align="center">Price Bought</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((h) => (
              <HoldingGroupPerformance {...h} key={h.code} />
            ))}
          {data.length > 5 && fillWithEmpty && emptyRows > 0 && (
            <TableRow style={{ height: 52.8 * emptyRows }}>
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

export function HoldingGroupPerformance({
  code,
  change,
  change_percent,
  net_worth,
  current_worth,
  net_worth_percent,
  price_bought,
  total_quantity,
}) {
  return (
    <TableRow>
      <TableCell align="center">
        <Link to={`/stock/${code}`}>{code.toUpperCase()}</Link>
      </TableCell>
      <TableCell align="center">{currencyFormatter.format(current_worth)}</TableCell>
      <TableCell align="center">
        <span
          className={
            change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
          }
        >
          {currencyFormatter.format(change)} ({change_percent}%)
          {change > 0 ? '▴' : change < 0 ? '▾' : '-'}
        </span>
      </TableCell>
      <TableCell align="center">
        <span
          className={
            net_worth > 0 ? 'positive' : net_worth < 0 ? 'negative' : 'neutral'
          }
        >
          {currencyFormatter.format(net_worth)} ({net_worth_percent}%)
          {net_worth > 0 ? '▴' : net_worth < 0 ? '▾' : '-'}
        </span>
      </TableCell>
      <TableCell align="center">{total_quantity}</TableCell>
      <TableCell align="center">
        {currencyFormatter.format(price_bought)}
      </TableCell>
    </TableRow>
  );
}

export default IndPortfolioPerformance;
