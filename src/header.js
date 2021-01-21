import React, { Fragment } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { logout } from './actions/auth';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  SearchBar,
  SearchBarSuggestions,
} from './components/SearchPage/SearchBar';
import { useHistory } from 'react-router-dom';
import matchSorter from 'match-sorter';
import { fetchCompaniesIfNeeded } from './actions/companies';
import { loadUser } from './actions/auth';

function Header(props) {
  const history = useHistory();
  //username should be passed in

  const {
    email,
    isAuthenticated,
    companies,
    fetchCompaniesIfNeeded,
    loadUser,
  } = props;

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  const [searchInput, setSearchInput] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);

  React.useEffect(() => {
    fetchCompaniesIfNeeded();
  }, [fetchCompaniesIfNeeded]);

  React.useEffect(() => {
    setSuggestions([]);
  }, [window.location.href]);

  const handleSearchInputChange = (e) => {
    // filter out suggestions
    const query = e.target.value;
    setSearchInput(query);
    setSuggestions(
      query.length > 0
        ? matchSorter(companies, query, {
            threshold: matchSorter.rankings.CONTAINS,
          }).slice(0, 5)
        : []
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);

    if (searchInput.length > 0) {
      history.push(`/search?${searchInput}`);
    } else {
      history.push('/search');
    }
    setSearchInput('');
  };

  const handleSearchOnBlur = (e) => {
    // if search input is out of focus, then remove suggestions list
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setSuggestions([]);
    }
  };

  const handleSuggestionOnClick = (e) => {
    // if suggestion is clicked on, remove suggestions list
    setSuggestions([]);
  };

  const guestLinks = (
    <Fragment>
      <Nav.Link
        as={Link}
        style={{
          opacity: '0.85',
          color: 'rgb(0,0,0)',
          margin: '10px',
          border: '200px',
        }}
        to="/register"
      >
        Join
      </Nav.Link>
      <Nav.Link
        as={Link}
        style={{ opacity: '0.85', color: 'rgb(0,0,0)', margin: '10px' }}
        to="/login"
      >
        Login
      </Nav.Link>
    </Fragment>
  );

  const userLinks = (
    <NavDropdown
      title={email}
      className="font-weight-bold"
      id="collasible-nav-dropdown"
      style={{ margin: '0px 0px 0px auto' }}
      alignRight
    >
      <NavDropdown.Item as={Link} to="/passChange">
        Change Password
      </NavDropdown.Item>
      <NavDropdown.Divider />

      <NavDropdown.Item onClick={props.logout} className="font-weight-bold">
        Logout
      </NavDropdown.Item>
    </NavDropdown>
  );

  return (
    <Container fluid className="navbar-container">
      <Navbar
        style={{
          opacity: '1',
          background: '#F8FAFD',
          zIndex: '5',
        }}
        collapseOnSelect
        expand="lg"
      >
        <Navbar.Brand href="/" as={Link} to="/" className="font-weight-bold">
          YuShi
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto align-items-center">
            <Nav.Link as={Link} to="/stock">
              Markets
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
            <NavDropdown title="Analytics" id="collasible-nav-dropdown">
              <NavDropdown.Item as={Link} to="/analytics/MonteCarlo">
                Monte Carlo Simulation
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/analytics/VAR">
                Value at Risk & Expected Shortfall
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/analytics/stockScreener">
                Stock Screener
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/analytics/predict">
                Stock Prediction
              </NavDropdown.Item>
            </NavDropdown>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/portfolio">
                Portfolios
              </Nav.Link>
            )}
            {isAuthenticated && (
              <Nav.Link as={Link} to="/game">
                Game
              </Nav.Link>
            )}
            {/* search bar */}
            <div style={{ marginLeft: '10px' }} onBlur={handleSearchOnBlur}>
              <SearchBar
                query={searchInput}
                onChange={handleSearchInputChange}
                onSubmit={handleSearchSubmit}
                style={{ width: '500px' }}
              />
              <SearchBarSuggestions
                data={suggestions}
                style={{ width: '500px' }}
                onClick={handleSuggestionOnClick}
              />
            </div>
          </Nav>
          <Nav>{isAuthenticated ? userLinks : guestLinks}</Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}

Header.propTypes = {
  email: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isLoading: state.auth.isLoading,
  isAuthenticated: state.auth.isAuthenticated,
  token: state.auth.token,
  email: state.auth.email,
  companiesFetching: state.companies.isFetching,
  companies: state.companies.data,
  companiesError: state.companies.error,
});
export default connect(mapStateToProps, {
  logout,
  fetchCompaniesIfNeeded,
  loadUser,
})(Header);