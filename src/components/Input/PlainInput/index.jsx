import "./index.css";

const PlainInput = ({ label, value, onChange, type = "text", required = false, readOnly = false, disabled = false, hidden = false }) => {
    return (
        <div className="" hidden={hidden}>
            <label>{label}</label>
            <input
                className="enhanced-input"
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                disabled={disabled}
            />
        </div>
    );
};

export default PlainInput;
