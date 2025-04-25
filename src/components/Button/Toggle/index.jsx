import React from 'react';
import { ShieldCheck, ShieldBan } from 'lucide-react';

const ToggleButton = ({ formData, handleStatusChange }) => {
  return (
    <div className="field-container">
      <label htmlFor="languageStatus">Status:</label>
      <div id="language-status-toggle">
        <button
          type="button"
          onClick={() => handleStatusChange('yes')}
          style={{
            backgroundColor: formData.is_active === 'yes' ? 'green' : 'gray',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer',
            width: '45%',
          }}
        >
          <ShieldCheck style={{ marginRight: '8px' }} />
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange('no')}
          style={{
            backgroundColor: formData.is_active === 'no' ? 'red' : 'gray',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer',
            width: '45%',
          }}
        >
          <ShieldBan style={{ marginRight: '8px' }} />
        </button>
      </div>
    </div>
  );
};

export default ToggleButton;
