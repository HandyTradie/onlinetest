import React from 'react';
import { useCreatedParticipantGroups } from '../api/participants';
import SelectInputWithLabel from './SelectInputWithLabel';

type Props = {
  onAddParticipants: (
    participants: {
      name: string;
      email: string;
      phone: string;
    }[]
  ) => void;
};

const AddFromPartipantGroupList = ({ onAddParticipants }: Props) => {
  const [selectedParticipantGroup, setSelectedParticipantGroup] = React.useState<string>('default');
  const { data: participantGroups } = useCreatedParticipantGroups();

  const onSubmit = () => {
    const groupParticipants = participantGroups?.find(
      (group) => group.id === selectedParticipantGroup
    )?.participants;

    if (groupParticipants) {
      onAddParticipants(groupParticipants);
    }
  };

  const options = participantGroups?.map((group) => ({
    label: group.name,
    value: group.id
  }));

  return (
    <div className="flex flex-col sm:flex-row w-full gap-4 mb-6 mt-2">
      <div className="flex gap-4 w-full">
        <SelectInputWithLabel
          label=""
          type="select"
          value={selectedParticipantGroup}
          onChange={(e) => setSelectedParticipantGroup(e.target.value)}
          options={
            options
              ? [
                  { label: 'Select a participant group', value: 'default', disabled: true },
                  ...options
                ]
              : [
                  {
                    label: 'You do not have any participant groups',
                    value: 'noParticipantGroups'
                  }
                ]
          }
        />
        <button
          onClick={onSubmit}
          type="button"
          className="px-4 rounded-lg bg-[#4353ff] text-white text-2xl max-h-[42px]"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default AddFromPartipantGroupList;
