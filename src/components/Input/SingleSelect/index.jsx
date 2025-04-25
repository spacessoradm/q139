import Select from 'react-select';
import './index.css';

const SingleSelect = ({ 
    label, 
    options, 
    selectedValue, 
    onChange, 
    placeholder, 
    required = false, 
    readOnly = false 
}) => {
    return (
        <div className="" style={{paddingTop: '20px'}}>
            <label>{label}</label>
            <Select
                value={options.find(option => option.value === selectedValue)}
                onChange={(selected) => !readOnly && onChange(selected ? selected.value : null)}
                options={options}
                placeholder={placeholder}
                isDisabled={readOnly} // Disables selection if readOnly is true
                isClearable={!required} // Allow clearing selection if not required
            />
        </div>
    );
};

export default SingleSelect;
