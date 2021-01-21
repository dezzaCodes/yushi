import React from 'react';
import PropTypes from 'prop-types';

import {
  LineChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

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

function SimulationDisplay({ data, timeStep = 1 }) {
  // for displaying simulations for mc method
  const [simulationsToShow, setSimulationsToShow] = React.useState([]);
  const [reducedChartDisplay, setChartReducedDisplay] = React.useState(false);

  React.useEffect(() => {
    // determine what simulations to show if there are more than 10 (performance reasons)
    if (!data || data.length === 0) return;
    const nSimulations = Object.keys(data[0]).length;
    if (nSimulations < 10) {
      setChartReducedDisplay(false);
      setSimulationsToShow(
        Array.from({ length: nSimulations }, (v, k) => `simulation ${k}`)
      );
    } else {
      setChartReducedDisplay(true);
      // show 10, 20, ... 90th percentile by sorting by ending simulated price
      const endingPrices = Object.keys(data[data.length - 1]);
      endingPrices.sort(
        (a, b) => data[data.length - 1][a] - data[data.length - 1][b]
      );

      const everyNthIndex = Math.floor(endingPrices.length / 10);
      const filtered = endingPrices.filter(
        (v, i) => i % everyNthIndex === 0 && i !== 0
      );
      setSimulationsToShow(filtered);
    }
  }, [data]);

  return (
    <ResponsiveContainer width="90%" height={400}>
      <LineChart data={data} margin={{ left: 5, bottom: 50, right: 5, top: 5 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          label={{
            value: 'Day',
            position: 'insideBottom',
            offset: -10,
          }}
          tickFormatter={(v) => v * timeStep}
        />
        <YAxis
          label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
          domain={['auto', 'auto']}
        />
        <Tooltip />
        {simulationsToShow.map((v, i) => (
          <Line
            dataKey={v}
            key={i}
            dot={false}
            name={reducedChartDisplay ? `${(i + 1) * 10}th Percentile` : v}
            stroke={colours[i % colours.length]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

SimulationDisplay.propTypes = {
  data: PropTypes.array.isRequired,
};

export default SimulationDisplay;
