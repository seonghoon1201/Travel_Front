// src/components/common/SearchBar.jsx
import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = '어디든지', onChange, value }) => {
  return (
    <div className="flex items-center bg-[#DDF1FB] rounded-full px-5 py-3 w-full max-w-none">
      <Search className="w-5 h-5 text-gray-600 mr-2" />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent outline-none flex-1 text-sm text-gray-700"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
