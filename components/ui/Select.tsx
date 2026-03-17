import ReactSelect, { Props as ReactSelectProps, StylesConfig } from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<ReactSelectProps<SelectOption, false>, 'options'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  required?: boolean;
}

const customSelectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '48px',
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#8B5CF6' : '#D1D5DB',
    backgroundColor: '#FFFFFF',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#8B5CF6' : '#9CA3AF',
    },
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 16px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#6B7280',
    fontSize: '14px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#111827',
    fontSize: '14px',
  }),
  input: (base) => ({
    ...base,
    color: '#111827',
    fontSize: '14px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB',
    marginTop: '4px',
    zIndex: 50,
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#607afb'
      : state.isFocused
      ? '#F3F4F6'
      : '#FFFFFF',
    color: state.isSelected ? '#FFFFFF' : '#111827',
    cursor: 'pointer',
    borderRadius: '0.375rem',
    padding: '10px 12px',
    fontSize: '14px',
    '&:active': {
      backgroundColor: state.isSelected ? '#8B5CF6' : '#E5E7EB',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#8B5CF6' : '#6B7280',
    padding: '0 12px',
    '&:hover': {
      color: '#8B5CF6',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#6B7280',
    padding: '0 8px',
    '&:hover': {
      color: '#EF4444',
    },
  }),
};

const Select = ({ label, error, options, required, ...props }: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-900 text-sm font-medium mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <ReactSelect<SelectOption, false>
        options={options}
        styles={customSelectStyles}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
