import React, { forwardRef } from 'react';

type Props = {
  label: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const FormTextInput = forwardRef<HTMLInputElement, Props>(({ label, ...rest }, ref) => {
  return (
    <div>
      <label>
        <p className="mb-2">{label}</p>
        <input
          ref={ref}
          className="w-full py-2 px-4 border border-opacity-10 rounded-lg"
          {...rest}
        />
      </label>
    </div>
  );
});

export default FormTextInput;
