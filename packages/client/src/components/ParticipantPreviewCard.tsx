import { XIcon } from '@heroicons/react/outline';
import React from 'react';

type Props = {
  name: string;
  email: string;
  phone: string;
  onDeleteClick?: () => void;
};

const ParticipantPreviewCard = ({ name, email, phone, onDeleteClick }: Props) => {
  return (
    <div className="flex items-center space-x-2 bg-blue-50 p-1 px-4 rounded-lg">
      <div className="flex-shrink-0 ">
        <p className="text-sm font-medium max-w-[110px] overflow-hidden text-ellipsis">{name}</p>
        <p className="text-gray-500 max-w-[110px] overflow-hidden text-ellipsis">{email}</p>
        <p className="text-gray-500 max-w-[110px] overflow-hidden text-ellipsis">{phone}</p>
      </div>
      <button onClick={onDeleteClick}>
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ParticipantPreviewCard;
