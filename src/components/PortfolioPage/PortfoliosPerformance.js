import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link } from 'react-router-dom';
import Error from '../Error';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* 
  data has properties: 
    - change(pin): -148.64999999999964
    - change_percent: "-3.267930750206091%"
    - current_worth: 4400.1
    - net_worth: 959.22
    - prev_net_worth: 1107.97
    - prev_worth: 4548.75
    - portfolio_performances: []
*/

export const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

function PortfoliosPerformance({ isFetching, data, error }) {
  const [bestPerforming, setBestPerforming] = React.useState(null);
  const [worstPerforming, setWorstPerforming] = React.useState(null);

  React.useEffect(() => {
    const { portfolio_performances } = data;
    if (!portfolio_performances) return;
    let maxValue = -Infinity;
    let max = null;
    let minValue = Infinity;
    let min = null;
    portfolio_performances.forEach((p) => {
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
  }, [data]);

  /* 
      Displays combined performance of all portfolios
  */
  return (
    <React.Fragment>
      {error && <Error />}
      <Grid
        container
        spacing={4}
        className="performance-container"
        direction="row"
        alignItems="center"
        justify="center"
      >
        {isFetching && <CircularProgress />}
        {data && (
          <React.Fragment>
            <PrimaryStats {...data} />
            {data.portfolio_performances && bestPerforming && worstPerforming && (
              <React.Fragment>
                <Grid item xs={12} md={5}>
                  <ShareDistributionGraph
                    distribution={data.portfolio_performances}
                    nameKey="portfolio_name"
                  />
                  <h6 className="subtitle">Portfolios Distribution</h6>
                </Grid>
                <Grid item xs={12} md={5}>
                  <OtherStats
                    bestPerforming={bestPerforming}
                    worstPerforming={worstPerforming}
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

/* 
  Displays current worth, change, change_percent, net_worth
*/
export function PrimaryStats({
  current_worth,
  change,
  change_percent,
  net_worth,
}) {
  return (
    <React.Fragment>
      <Grid item xs={12} md={4}>
        <h1 className="title">AUD {currencyFormatter.format(current_worth)}</h1>
        <h6 className="subtitle">Total Worth</h6>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <h2
          className={
            change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
          }
        >
          <span className="change">{currencyFormatter.format(change)}</span>

          {change_percent && (
            <React.Fragment>
              {' '}
              <span className="change_percent">({change_percent}%)</span>
            </React.Fragment>
          )}
          <span>{change > 0 ? '▴' : change < 0 ? '▾' : '-'}</span>
        </h2>
        <h6 className="subtitle">Daily Change</h6>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <h2
          className={
            net_worth > 0 ? 'positive' : net_worth < 0 ? 'negative' : 'neutral'
          }
        >
          <span className="change">{currencyFormatter.format(net_worth)}</span>

          {current_worth - net_worth !== 0 && (
            <React.Fragment>
              {' '}
              <span className="change_percent">
                (
                {Math.round(
                  ((current_worth / (current_worth - net_worth)) * 100 -
                    100 +
                    Number.EPSILON) *
                    100
                ) / 100}
                %)
              </span>
            </React.Fragment>
          )}

          <span>{net_worth > 0 ? '▴' : net_worth < 0 ? '▾' : '-'}</span>
        </h2>
        <h6 className="subtitle">Total Change</h6>
      </Grid>
    </React.Fragment>
  );
}

/*
  Displays worst and best performing portfolio
*/
function OtherStats({ bestPerforming, worstPerforming }) {
  return (
    <Grid item xs={12} container alignItems="flex-end">
      {bestPerforming && (
        <Grid item xs={12} container spacing={1} alignItems="flex-end">
          <Grid item>
            <h6 className="subtitle">Best Performing:</h6>
          </Grid>
          <Grid item>
            <Link to={`/portfolio/${bestPerforming.portfolio_id}`}>
              <h6>{bestPerforming.portfolio_name}</h6>
            </Link>
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
        <Grid item xs={12} container spacing={1} alignItems="flex-end">
          <Grid item>
            <h6 className="subtitle">Worst Performing:</h6>
          </Grid>
          <Grid item>
            <Link to={`/portfolio/${worstPerforming.portfolio_id}`}>
              <h6>{worstPerforming.portfolio_name}</h6>
            </Link>
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

/* 

  Displays distribution of portfolios
*/

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ShareDistributionGraph({ distribution, nameKey }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={distribution}
          cx="50%"
          cy="50%"
          fill="#8884d8"
          dataKey="current_worth"
          nameKey={nameKey}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {distribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
        <Legend
          verticalAlign="top"
          formatter={(value) => <span className="subtitle">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

PortfoliosPerformance.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  error: PropTypes.object,
};

export default PortfoliosPerformance;
