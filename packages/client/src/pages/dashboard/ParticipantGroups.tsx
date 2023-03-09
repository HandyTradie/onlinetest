import { PlusIcon } from '@heroicons/react/outline';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { TailSpin } from 'react-loader-spinner';
import { useCreatedParticipantGroups, useDeleteParticipantGroup } from '../../api/participants';
import { User } from '../../models/User';
import CreateParticipantGroupModal from './CreateParticipantGroupModal';
import EditParticipantGroupModal from './EditParticipantGroupModal';

const ParticipantGroups = () => {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const { data, isLoading } = useCreatedParticipantGroups();

  return (
    <div className="py-4">
      <div className="flex justify-between items-end">
        <h1>Your Groups</h1>
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-500 flex items-center gap-2 text-white"
        >
          <PlusIcon className="w-4 h-4" />
          Create Group
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        {isLoading ? (
          <TailSpin width={24} height={24} />
        ) : data?.length ? (
          data?.map((group) => <ParticipantGroupCard key={group.id} group={group} />)
        ) : (
          <p>No groups created</p>
        )}
      </div>

      <CreateParticipantGroupModal
        isOpen={showCreateGroupModal}
        setIsOpen={setShowCreateGroupModal}
      />
    </div>
  );
};

const ParticipantGroupCard = ({
  group
}: {
  group: {
    id: string;
    name: string;
    owner: string;
    participants: {
      name: string;
      email: string;
      phone: string;
    }[];
  };
}) => {
  const { mutate: deleteGroup, isLoading: isDeleting } = useDeleteParticipantGroup(group.id);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDeleteGroup = () => {
    deleteGroup(undefined, {
      onSuccess: () => {
        toast.success('Group deleted');
      },
      onError: (error) => {
        console.error(error);
        toast.error('Failed to delete group');
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">{group.name}</h2>
          <p className="text-gray-500">{group.participants?.length} participants</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-2 rounded-lg bg-blue-500 text-white"
          onClick={() => setShowEditModal(true)}
        >
          Edit
        </button>
        <button
          onClick={handleDeleteGroup}
          disabled={isDeleting}
          className="px-4 py-2 rounded-lg bg-red-500 text-white text-center"
        >
          {isDeleting ? <TailSpin width={24} height={24} /> : 'Delete'}
        </button>
      </div>
      <EditParticipantGroupModal
        isOpen={showEditModal}
        setIsOpen={setShowEditModal}
        group={group}
      />
    </div>
  );
};

export default observer(ParticipantGroups);
