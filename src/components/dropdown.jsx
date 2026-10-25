import React, { forwardRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './dropdown.css';

const normalizeOptions = (options) =>
  options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );

const Dropdown = forwardRef(
  (
    {
      options = [],
      value,
      defaultValue,
      onChange,
      ariaLabel,
      disabled = false,
      size = 'md',
      tone = 'light',
      className = 'w-full',
      id,
      name,
      ...rest
    },
    ref
  ) => {
    const items = normalizeOptions(options);

    return (
      <div className={`dd-root dd-${size} ${className}`}>
        <select
          ref={ref}
          id={id}
          name={name}
          className={`dd-select ${tone === 'dark' ? 'dd-dark' : ''}`}
          aria-label={ariaLabel}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          {...rest}
        >
          {items.map((item) => (
            <option key={item.value} value={item.value} disabled={item.disabled}>
              {item.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="dd-chevron" size={14} aria-hidden="true" />
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;
