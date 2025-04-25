import React from 'react';
import { FaSyncAlt, FaPlus } from 'react-icons/fa';
import { ArrowDownUp } from 'lucide-react';
import './index.css'; // Assuming styles are shared

const SearchBar = ({ searchTerm, onSearch, onSort, onRefresh, onCreate }) => {
  return (
    <div className='search-bar'>
      <input
        className='search-input'
        type="text"
        placeholder="Search Keywords..."
        value={searchTerm}
        onChange={onSearch}
      />
      <div className='button-container'>
        <ArrowDownUp
          onClick={onSort} // ✅ Ensure this is passed correctly from props
          className="sort-button"
          title="Sort"
          style={{ cursor: "pointer", width: '30px', height: '30px' }}
        />
        <FaSyncAlt
          onClick={onRefresh}
          onMouseOver={(e) => (e.target.style.transform = "rotate(90deg)")}
          onMouseOut={(e) => (e.target.style.transform = "rotate(0deg)")}
          title="Refresh"
          className="refresh-button"
        />
        <FaPlus
          onClick={onCreate}
          title="Create"
          className="create-button"
        />
      </div>
    </div>
  );
};

export default SearchBar;
