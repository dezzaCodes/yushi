import React from 'react';
import SearchContainer from './SearchContainer';
import {
  SearchBar,
  SearchBarSuggestions,
} from './SearchBar';
import matchSorter from 'match-sorter';
import { useHistory } from 'react-router-dom';

export default function SearchPage(props) {
  return (
    <div style={{ margin: '30px' }}>
      <SearchContainer {...props} />
    </div>
  );
}
