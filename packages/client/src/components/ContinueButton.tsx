import React from 'react';
import ArrowRightIcon from '@heroicons/react/outline/ArrowRightIcon';
import { TailSpin } from 'react-loader-spinner';

type Props = {
  label?: string;
  loading?: boolean;
  children?: string;
  noContinue?: boolean;
  onClick?: () => void;
};

const ContinueButton: React.FC<Props> = ({ label, loading, children, noContinue, onClick }) => (
  <button
    disabled={loading}
    onClick={onClick}
    className="flex items-center justify-center w-full px-6 py-4 space-x-2 rounded-lg bg-slate-blue filter hover:brightness-125"
  >
    {loading ? (
      <TailSpin height={24} width={24} color={'white'} />
    ) : (
      <>
        <span className="text-white">{children || label}</span>
        {!noContinue && <ArrowRightIcon className="w-5 text-white" />}
      </>
    )}
  </button>
);

export default ContinueButton;
