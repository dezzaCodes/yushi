import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import PerformanceChangeGraph from './PerformanceChangeGraph';
import Error from '../Error';
import { Button, Grid } from '@material-ui/core';

function PortfolioHistorical({
  isFetching,
  error,
  data,
  portfolioID,
  refreshGraph,
}) {
  const [showAllWarnings, setShowAllWarnings] = React.useState(false);

  React.useEffect(() => {
    setShowAllWarnings(false);
  }, [data]);

  return (
    <React.Fragment>
      {isFetching && <CircularProgress />}
      {error && <Error {...error} />}
      {!isFetching && data && data[portfolioID] && (
        <React.Fragment>
          {data[portfolioID].errors && (
            <React.Fragment>
              <Alert
                severity="error"
                onClick={() => setShowAllWarnings(!showAllWarnings)}
                className="click"
                style={{ marginBottom: '20px' }}
              >
                There where some errors with calculating historical performance.
                <br />
                Try refreshing the graph or view individual performance of
                holdings below.
              </Alert>
              {showAllWarnings && (
                <ul className="errors">
                  {data[portfolioID].errors.map((e, i) => (
                    <li key={i}>
                      <Alert severity="warning">{e}</Alert>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          )}
          <Grid
            container
            item
            xs={12}
            direction="row"
            justify="space-between"
            spacing={4}
          >
            <Grid item>
              <h5 className="subtitle">Portfolio Historical Performance</h5>
              <h6 className="subtitle">(From Past Year / Date Bought)</h6>
            </Grid>
            <Grid item>
              <Button onClick={refreshGraph} color="primary" variant="outlined">
                Refresh Graph
              </Button>
            </Grid>
          </Grid>
          <PerformanceChangeGraph
            performance={data[portfolioID]['performance']}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

PortfolioHistorical.propTypes = {
  isFetchingGroup: PropTypes.bool.isRequired,
  error: PropTypes.object,
  data: PropTypes.object.isRequired,
  portfolioID: PropTypes.number.isRequired,
  refreshGraph: PropTypes.func.isRequired,
};

function HoldingHistorical({
  isFetchingGroup,
  error,
  data,
  portfolioID,
  stockCode,
}) {
  const [holding, setHolding] = React.useState(null);
  const [performanceData, setPerformanceData] = React.useState(null);

  React.useEffect(() => {
    const portfolio = data[portfolioID];
    if (!portfolio) return;
    const holding = portfolio.holding_performance.filter(
      (h) => h.code === stockCode
    );

    if (holding.length > 0) {
      setHolding(holding[0]);
      setPerformanceData(holding[0].performance);
    }
  }, [data, portfolioID, stockCode]);

  return (
    <div className="performance-container">
      {isFetchingGroup && <CircularProgress />}
      {error && <Error {...error} />}
      {!isFetchingGroup && performanceData && (
        <PerformanceChangeGraph performance={performanceData} />
      )}
      {!isFetchingGroup && holding && !performanceData && (
        <Alert severity="error">
          There was an error in fetching this holding stock's historical
          performance. Try refreshing the graph.
        </Alert>
      )}
    </div>
  );
}

HoldingHistorical.propTypes = {
  isFetchingGroup: PropTypes.bool.isRequired,
  error: PropTypes.object,
  data: PropTypes.object.isRequired,
  portfolioID: PropTypes.number.isRequired,
  stockCode: PropTypes.string.isRequired,
};

export default PortfolioHistorical;
export { PortfolioHistorical, HoldingHistorical };
