import React from "react";
import "../styles/FormInput.css";

function FormInput({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  isValid,
  options,
  disabled,
  prefix,
  step
}) {
  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      value: value || "",
      onChange,
      onBlur,
      disabled,
      className: `form-input ${error ? 'error' : ''} ${isValid ? 'valid' : ''}`
    };

    switch (type) {
      case 'date':
      case 'time':
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
            min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{placeholder || `Select ${label}`}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <div className="input-with-prefix">
            {prefix && <span className="prefix">{prefix}</span>}
            <input
              {...commonProps}
              type="number"
              step={step}
              placeholder={placeholder}
            />
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="form-group">
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      {renderInput()}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default FormInput; 