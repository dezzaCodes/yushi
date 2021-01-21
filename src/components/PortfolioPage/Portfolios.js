import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import { CircularProgress } from '@material-ui/core';

import {
  fetchPortfolios,
  addNewPortfolio,
  deletePortfolio,
  fetchPortfoliosPerformance,
} from '../../actions/portfolios';
import Error from '../Error';
import PortfolioList from './PortfolioList';
import PortfolioDetail from './PortfolioDetail';
import PortfoliosPerformance from './PortfoliosPerformance';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class Portfolios extends Component {
  constructor(props) {
    super(props);
    this.state = { textField: '', snackbarOpen: false };
  }

  componentDidMount() {
    const { dispatch, portfolioID } = this.props;
    dispatch(fetchPortfolios());
    dispatch(fetchPortfoliosPerformance());
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.confirmation &&
        this.props.confirmation !== prevProps.confirmation) ||
      (this.props.confirmationError &&
        this.props.confirmationError !== prevProps.confirmationError)
    ) {
      this.setState({ ...this.state, snackbarOpen: true });
    }
    if (this.props.data.length !== prevProps.data.length) {
      this.props.dispatch(fetchPortfoliosPerformance());
    }
  }

  handleOnChange = (event) => {
    this.setState({ textField: event.target.value });
  };

  handleAddPortfolio = (event) => {
    event.preventDefault();

    this.props.dispatch(addNewPortfolio(this.state.textField));
    this.setState({ ...this.state, textField: '' });
  };

  handleRemovePortfolio(event, portfolio) {
    this.props.dispatch(deletePortfolio(portfolio));
  }

  handleSnackBarClose() {
    this.setState({ ...this.state, snackbarOpen: false });
  }

  render() {
    const {
      isFetching,
      error,
      data,
      confirmation,
      confirmationError,
      portfolioID,
      dispatch,
      processingAdd,
    } = this.props;

    // Load individual portfolio
    if (portfolioID) {
      const portfolio = data.find((p) => p.id === portfolioID);

      // if portfolio doesnt exist, return error
      if (!portfolio) {
        return (
          <Container maxWidth="lg" style={{ margin: '2rem auto' }}>
            <Error
              status={404}
              message={`Portfolio with id ${portfolioID} not found`}
            />
          </Container>
        );
      }

      // load portfolio details
      return (
        <Container maxWidth="lg" style={{ margin: '2rem auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {isFetching ? (
                <CircularProgress />
              ) : error ? (
                <Error {...error} />
              ) : (
                <PortfolioDetail
                  {...portfolio}
                  dispatch={dispatch}
                  dayPerformance={this.props.dayPerformance}
                  historicalPerformance={this.props.historicalPerformance}
                  processingAdd={processingAdd}
                />
              )}
            </Grid>
            {(confirmation || confirmationError) && (
              <Snackbar
                open={this.state.snackbarOpen}
                autoHideDuration={5000}
                onClose={this.handleSnackBarClose.bind(this)}
              >
                <Alert
                  onClose={this.handleSnackBarClose.bind(this)}
                  severity={confirmation ? 'success' : 'error'}
                >
                  {confirmation ? confirmation : confirmationError}
                </Alert>
              </Snackbar>
            )}
          </Grid>
        </Container>
      );
    }

    // Show portfolio list
    return (
      <Container maxWidth="lg" style={{ margin: '2rem auto' }}>
        <Grid container spacing={3}>
          {isFetching ? (
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          ) : error ? (
            <Grid item xs={12}>
              <Error {...error} />
            </Grid>
          ) : (
            <React.Fragment>
              <Grid item xs={12}>
                <h2 className="title">Portfolios</h2>
                <PortfoliosPerformance {...this.props.dayPerformance} />
                <form
                  className="portfolio"
                  noValidate
                  autoComplete="off"
                  onSubmit={this.handleAddPortfolio}
                >
                  <TextField
                    id="portfolio"
                    label="Portfolio name"
                    value={this.state.textField}
                    onChange={this.handleOnChange}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    type="submit"
                  >
                    {processingAdd && (
                      <CircularProgress color="inherit" size="1rem" />
                    )}
                    Add Portfolio
                  </Button>
                </form>
              </Grid>
              <Grid item xs={12}>
                <PortfolioList {...this.props} />
              </Grid>

              {(confirmation || confirmationError) && (
                <Snackbar
                  open={this.state.snackbarOpen}
                  autoHideDuration={5000}
                  onClose={this.handleSnackBarClose.bind(this)}
                >
                  <Alert
                    onClose={this.handleSnackBarClose.bind(this)}
                    severity={confirmation ? 'success' : 'error'}
                  >
                    {confirmation ? confirmation : confirmationError}
                  </Alert>
                </Snackbar>
              )}
            </React.Fragment>
          )}
        </Grid>
      </Container>
    );
  }
}

Portfolios.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  confirmation: PropTypes.string,
  confirmationError: PropTypes.string,
  portfolioID: PropTypes.number,
  dayPerformance: PropTypes.object.isRequired,
  historicalPerformance: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  const { portfolios } = state;
  const {
    isFetching,
    data,
    error,
    receivedAt,
    confirmation,
    confirmationError,
    dayPerformance,
    historicalPerformance,
    processingAdd,
  } = portfolios;
  return {
    isFetching,
    data,
    error,
    receivedAt,
    confirmation,
    confirmationError,
    dayPerformance,
    historicalPerformance,
    processingAdd,
  };
};

export default connect(mapStateToProps)(Portfolios);
