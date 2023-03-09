import React from 'react';
import { TailSpin } from 'react-loader-spinner';

type Props = {
  label?: string;
  loading?: boolean;
  children?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ActionButton: React.FC<Props> = ({ label, loading, children, className, ...rest }) => (
  <button
    disabled={loading}
    className={`flex items-center justify-center px-4 py-2 space-x-2 rounded-lg bg-slate-blue filter disabled:bg-gray-400 hover:brightness-125 ${className}`}
    {...rest}
  >
    {loading ? (
      <TailSpin height={24} width={24} color={'white'} />
    ) : (
      <span className="text-white">{children || label}</span>
    )}
  </button>
);

export default ActionButton;
