import React from 'react';

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

type Props = {
  label: string;
  error?: string;
  options: Option[];
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;

const SelectInputWithLabel = React.forwardRef<HTMLSelectElement, Props>(
  ({ label, error, options, ...rest }, ref) => (
    <div className={`flex flex-col w-full ${label && 'space-y-2'}`}>
      <div>
        <label className="text-base font-medium text-slate-body flex flex-col gap-2">
          {label}

          <div className="w-full border-2 rounded-lg pr-2">
            <select
              style={error ? { borderColor: '#FF9494' } : {}}
              className={`p-3 w-full bg-transparent focus-visible:outline-none ${
                error && 'border-red-500'
              }`}
              ref={ref}
              {...rest}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
);

export default SelectInputWithLabel;
