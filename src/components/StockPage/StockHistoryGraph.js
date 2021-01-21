import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
} from 'recharts';

import { makeStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import LinearProgress from '@material-ui/core/LinearProgress';

import Error from '../Error';

// CSS styles for graph lines
const graphLineColours = {
  open: '#dbb659',
  close: '#5964db',
  low: '#db5960',
  high: '#82ca9d',
};

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(3),
  },
  graphOptions: {
    marginLeft: theme.spacing(3),
  },
  progress: {
    width: '250px',
  },
}));

const dateFormat = 'DD/MM/YY';
const monthDayTickFormatter = (tick) => {
  return moment(tick, dateFormat).format('DD/MM');
};

const YearTickFormatter = (tick) => {
  return moment(tick, dateFormat).format('YYYY');
};

function StockHistoryGraph({ code }) {
  const classes = useStyles();
  const [stockHistory, setStockHistory] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [propDisplay, setPropDisplay] = React.useState({
    open: false,
    close: false,
    low: true,
    high: true,
  });

  async function fetchData(code) {
    try {
      let {
        data: { history },
      } = await axios.get(`/stocks/${code}/history`);
      if (!history) {
        setError('Could not load graph');
        return;
      }

      // Formating data
      history = history.map((d) => {
        const date = moment(d.date, 'YYYY-MM-DD').format(dateFormat);
        if (d.daily_change > 0) {
          return { ...d, date, positive: d.daily_change };
        } else {
          return { ...d, date, negative: d.daily_change };
        }
      });

      history.sort(
        (a, b) => moment(a.date, dateFormat) - moment(b.date, dateFormat)
      );
      setStockHistory(history);
      setError(null);
    } catch (error) {
      if (error.response) {
        setError({
          status: error.response.status,
          message: error.response.data.error,
        });
      } else if (error.request) {
        setError({
          status: 400,
          message: 'Request sent but no response given.',
        });
      } else {
        setError({
          status: 500,
          message: error.message,
        });
      }
    }
  }

  React.useEffect(() => {
    fetchData(code);
  }, [code]);

  const handlePropDisplay = (e) => {
    const d = { ...propDisplay };
    d[e.target.value] = e.target.checked;
    setPropDisplay(d);
  };

  if (error) return <Error message="Could not load graph" />;
  if (!stockHistory) {
    return (
      <React.Fragment>
        <p className={classes.progress}>{`loading graph for ${code}...`}</p>
        <LinearProgress className={classes.progress} />
      </React.Fragment>
    );
  }

  // Display Graph
  return (
    <div className={classes.container}>
      <FormGroup className={classes.graphOptions} row>
        {Object.keys(propDisplay).map((k) => (
          <FormControlLabel
            key={k}
            control={
              <Checkbox
                checked={propDisplay[k]}
                onChange={handlePropDisplay}
                name="propertyDisplay"
                color="primary"
                id={k}
                value={k}
              />
            }
            label={k}
          />
        ))}
      </FormGroup>
      <ResponsiveContainer width="80%" height={400}>
        <LineChart
          data={stockHistory}
          margin={{ top: 30, bottom: 30, left: 30, right: 90 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
          <YAxis
            domain={['auto', 'auto']}
            label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          {Object.entries(propDisplay).map(
            ([k, v]) =>
              v && (
                <Line
                  type="linear"
                  dataKey={k}
                  dot={false}
                  stroke={graphLineColours[k]}
                  key={k}
                />
              )
          )}
          <Brush
            dataKey="date"
            height={30}
            startIndex={
              stockHistory.length - 10 > 0 ? stockHistory.length - 10 : 0
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

StockHistoryGraph.propTypes = {
  code: PropTypes.string.isRequired,
};

export default StockHistoryGraph;
