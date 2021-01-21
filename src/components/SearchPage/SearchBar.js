import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    border: '#eeeeee 0.5px solid',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  suggestions: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#fff',
    listStyle: 'none',
    paddingInlineStart: 0,
  },
}));

function SearchBar({ query, onChange, onSubmit, style }) {
  const classes = useStyles();
  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      className={classes.root}
      style={style}
      elevation={0}
    >
      <InputBase
        className={classes.input}
        placeholder="Search by company or code"
        inputProps={{ 'aria-label': 'search by company or code' }}
        value={query}
        onChange={onChange}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

SearchBar.propTypes = {
  query: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

function SearchBarSuggestions({ data, style, onClick }) {
  const classes = useStyles();
  return (
    <ul className={classes.suggestions} style={style}>
      {data.map(([code, company], i) => (
        <li key={i}>
          <Button
            component={Link}
            to={`/stock/${code}`}
            color="inherit"
            fullWidth
            style={{ justifyContent: 'flex-start' }}
            onClick={onClick}
          >
            {company} ({code})
          </Button>
        </li>
      ))}
    </ul>
  );
}

SearchBarSuggestions.propTypes = {
  data: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default SearchBar;
export { SearchBarSuggestions, SearchBar };
