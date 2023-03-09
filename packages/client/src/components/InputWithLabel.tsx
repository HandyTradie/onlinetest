import React from 'react';

type Props = {
  label: string;
  forgetPassword?: boolean;
  error?: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const InputWithLabel = React.forwardRef<HTMLInputElement, Props>(
  ({ label, forgetPassword, error, ...rest }, ref) => (
    <div className={`flex flex-col w-full ${label && 'space-y-2'}`}>
      <div className="flex justify-between">
        <label className="text-base font-medium text-slate-body">{label}</label>
        {forgetPassword && (
          <label className="text-base font-medium text-slate-body">
            <a href="/forgot-password" className="hover:text-slate-blue">
              Forgot Password?
            </a>
          </label>
        )}
      </div>
      <input
        style={error ? { borderColor: '#FF9494' } : {}}
        className={`p-3 border-2 rounded-lg ${error && 'border-red-500'}`}
        onWheel={(e) => e.currentTarget.blur()}
        ref={ref}
        {...rest}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
);

export default InputWithLabel;
