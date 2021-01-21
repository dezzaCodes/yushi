import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { loadUser } from './actions/auth';

const PrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (auth.isLoading || (auth.token && !auth.isAuthenticated)) {
        return (
          <div className="abs-center">
            <Spinner animation="grow" />
            <span className="h2"> Loading...</span>
          </div>
        );
      } else if (!auth.isAuthenticated) {
        return <Redirect to="/login" />;
      } else {
        return <Component {...props} />;
      }
    }}
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { loadUser })(PrivateRoute);

// Had to pass auth as a prop instead of mapping from store
// https://stackoverflow.com/questions/43520498/react-router-private-routes-redirect-not-working
// https://reacttraining.com/react-router/web/guides/redux-integration
