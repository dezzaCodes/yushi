import React from 'react';
import Portfolios from './Portfolios';

export default function PortfolioPage({ match }) {
  const {
    params: { id }
  } = match;
  const parsed = parseInt(id);
  if (isNaN(parsed)) {
    return <Portfolios />;
  } else {
    return <Portfolios portfolioID={parsed} />;
  }
}
