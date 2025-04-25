import "./index.css";

const TextArea = ({ label, value, onChange, rows = 3, required = false, readOnly = false }) => {
    return (
        <div className="">
            <label>{label}</label>
            <textarea
                className="enhanced-input"
                value={value}
                onChange={onChange}
                rows={rows}
                required={required}
                readOnly={readOnly}
            />
        </div>
    );
};

export default TextArea;
