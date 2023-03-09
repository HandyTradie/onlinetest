import React, { forwardRef } from 'react';
import Switch, { ReactSwitchProps } from 'react-switch';

type Props = {
  label: string;
} & ReactSwitchProps &
  allowedHTMLinputProps;

type htmlInputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
type excludedHTMLInputProps =
  | 'onFocus'
  | 'onBlur'
  | 'onKeyUp'
  | 'onChange'
  | 'ref'
  | keyof ReactSwitchProps;

type allowedHTMLinputProps = Omit<htmlInputProps, excludedHTMLInputProps>;

const FormSwitchInput = forwardRef<HTMLInputElement, Props>(({ label, ...rest }, ref) => {
  return (
    <div>
      <label>
        <p className="mb-2">{label}</p>
        <Switch ref={ref as unknown as React.LegacyRef<Switch>} {...rest} />
      </label>
    </div>
  );
});

export default FormSwitchInput;
