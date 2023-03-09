import React from 'react';
import PhoneInputWithCountrySelect from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from '../styles/reset.module.css';

type Props = {
  value: string;
  onChange: (a: string) => void;
  error: string | undefined;
  label?: string;
  className: string;
};

const PhoneInputWithLabel = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, error, label, className }, ref) => (
    <div className={`flex flex-col w-full ${label && 'space-y-2'}`}>
      <label className="text-base font-medium text-slate-body">{label ?? 'Phone Number'}</label>

      <div
        className={className ?? 'p-3 border-2 rounded-lg'}
        style={error ? { borderColor: '#FF9494' } : {}}
      >
        <PhoneInputWithCountrySelect
          ref={ref as any}
          international
          defaultCountry="GH"
          value={value}
          required
          onChange={onChange}
          className={styles.reset}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
);

export default PhoneInputWithLabel;
