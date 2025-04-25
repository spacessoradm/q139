import React from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { MoveLeft, MoveRight } from 'lucide-react';
import './index.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    let pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) pages.push(<span key="start">...</span>);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => onPageChange(i)} 
          className={`page-button ${page === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) pages.push(<span key="end">...</span>);

    return pages;
  };

  return (
    <div className={`pagination-container ${totalPages === 1 ? 'centered' : ''}`}>
      {totalPages > 1 && (
        <button 
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`pagination-button ${page === 1 ? "disabled" : ""}`}
        >
          <MoveLeft title="Previous Page" />
        </button>
      )}

      {renderPageNumbers()}

      {totalPages > 1 && (
        <button 
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`pagination-button ${page === totalPages ? "disabled" : ""}`}
        >
          <MoveRight title="Next Page" />
        </button>
      )}
    </div>
  );
};

export default Pagination;
