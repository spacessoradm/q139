import Select from "react-select";
import "./index.css";

const MultiSelect = ({ label, options, selectedValues, onChange, placeholder }) => {
    return (
        <div className="field-container">
            <label>{label}</label>
            <Select
                options={options}
                isMulti
                value={options.filter((option) => selectedValues.includes(option.value))}
                onChange={(selectedOptions) => onChange(selectedOptions.map((option) => option.value))}
                placeholder={placeholder}
                className="enhanced-input"
            />
        </div>
    );
};

export default MultiSelect;
