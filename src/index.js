import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Provider } from 'react-redux';
import store from './store';

import App from './components/App';
import HomePage from './components/homepage/homePage';
import LoginPage from './components/loginPage/LoginPage';
import passChange from './components/loginPage/Passchange';
import RegisterPage from './components/registrationpage/RegisterPage';
import AnalysisPage from './components/AnalysisPage/MarketPage';
import PortfolioPage from './components/PortfolioPage';
import SearchPage from './components/SearchPage';
import StockPage from './components/StockPage';
import GamePage from './components/GamePage';
import Header from './header';
import PrivateRoute from './PrivateRoute';
import StockScreenerPage from './components/ScreenerPage/StockScreener';
import NeuralNet from './components/neuralPage';
import ValueAtRisk from './components/AnalysisPage/ValueAtRisk';
import MonteCarlo from './components/AnalysisPage/MonteCarlo';
import ErrorPage from './components/404ErrorPage';
import AboutPage from './components/AboutPage';

// Styling
import { ThemeProvider } from '@material-ui/core';
import theme from './muitheme';
import './main.css';
//private route required auth to jump 
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={App} />
          <Route exact path="/homepage" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <PrivateRoute path="/portfolio/:id?" component={PortfolioPage} />
          <Route path="/search" component={SearchPage} />
          <Route exact path="/stock" component={AnalysisPage} />
          <Route path="/stock/:code" component={StockPage} />
          <Route exact path= "/about" component = {AboutPage} />
          <PrivateRoute exact path="/game" component={GamePage} />
          <Route exact path="/analytics/stockScreener" component={StockScreenerPage} />
          <Route exact path="/analytics/predict" component={NeuralNet} />
          <Route exact path="/analytics/VAR" component={ValueAtRisk} />
          <Route exact path="/analytics/MonteCarlo" component={MonteCarlo} />
          <PrivateRoute exact path="/passChange" component={passChange} />
          <Route path="" component={ErrorPage} />
        </Switch>
      </Router>
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
