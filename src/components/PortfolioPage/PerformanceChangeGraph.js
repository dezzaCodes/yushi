import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Brush,
  Line,
  ComposedChart,
} from 'recharts';
import moment from 'moment';

const dateFormat = 'DD/MM/YY';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

const monthDayTickFormatter = (tick) => {
  return moment(tick, dateFormat).format('DD/MM');
};

const YearTickFormatter = (tick) => {
  return moment(tick, dateFormat).format('YYYY');
};

const tooltipFormatter = (value, name, props) => {
  return name === 'Daily Change'
    ? `${currencyFormatter.format(value)} (${
        props.payload.daily_change_percent
      }%)`
    : name === 'Total Change'
    ? `${currencyFormatter.format(value)} (${
        props.payload.total_change_percent
      }%)`
    : value;
};

export default function PerformanceChangeGraph({ performance }) {
  let data = performance;
  if (typeof data === 'object') {
    data = Object.values(data);
  }

  if (!performance) {
    return null;
  }

  // Formating data
  data = data.map((d) => {
    const date = moment(d.date, 'YYYY-MM-DD').format(dateFormat);
    if (d.daily_change > 0) {
      return { ...d, date, positive: d.daily_change };
    } else {
      return { ...d, date, negative: d.daily_change };
    }
  });

  data.sort((a, b) => moment(a.date, dateFormat) - moment(b.date, dateFormat));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{
          top: 15,
          bottom: 15,
          left: 5,
          right: 15,
        }}
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
        <YAxis width={40} />
        <Tooltip formatter={tooltipFormatter} />
        <ReferenceLine y={0} stroke="#000" />
        <Bar
          name="Daily Change"
          stackId="a"
          dataKey="negative"
          fill="#f85959"
        />
        <Bar
          name="Daily Change"
          stackId="a"
          dataKey="positive"
          fill="#17b978"
        />
        <Line
          type="monotone"
          name="Total Change"
          dataKey="total_change"
          stroke="#278ea5"
          dot={false}
        />
        <Brush
          dataKey="date"
          height={30}
          startIndex={data.length > 10 ? data.length - 10 : 0}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
