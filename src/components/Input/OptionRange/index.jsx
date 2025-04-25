import React from "react";
import "./index.css";
import { DollarSign, Star } from "lucide-react"; // Icons from Lucide


const PriceRating = ({ value, max, type, onChange }) => {
    // Determine which icon to use (DollarSign or Star)
  const Icon = type === "rating" ? Star : DollarSign;

    const handleSelect = (rating) => {
      onChange(rating); // Call the parent function with the new value
    };
  
    return (
      <div className="field-container">
        <label>{type === "rating" ? "Rating:" : "Price:"}</label>
        <div className="flex items-center space-x-2">
          {Array.from({ length: max }, (_, index) => {
            const rating = index + 1;
            return (
              <span key={rating} className="flex flex-col items-center">
                <Icon
                  className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                    rating <= value ? "text-yellow-500" : "text-gray-300"
                  }`}
                  onClick={() => handleSelect(rating)}
                />
              </span>
            );
          })}
        </div>
        {/* Display selected value inside the component */}
        <p className="mt-2">Selected {type === "rating" ? "Rating" : "Price"}: {value}</p>
      </div>
    );
  };
  

export default PriceRating;
