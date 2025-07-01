import React from 'react';
import SearchBar from '../components/common/SearchBar';
import DefaultLayout from '../layouts/DefaultLayout';
import BackHeader from '../components/header/BackHeader';

const SearchPage = () => {
  return (
    <DefaultLayout>
      <BackHeader />
      <SearchBar />
    </DefaultLayout>
  );
};

export default SearchPage;
