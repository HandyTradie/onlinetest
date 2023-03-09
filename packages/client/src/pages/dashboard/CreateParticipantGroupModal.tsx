import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { createContext, Fragment, useContext, useMemo, useState } from 'react';
import DataGrid, { Column, HeaderRendererProps } from 'react-data-grid';
import { FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TailSpin } from 'react-loader-spinner';
import { useCreateParticipantGroup } from '../../api/participants';
import { Test } from '../../api/tests';
import ActionButton from '../../components/ActionButton';
import InputWithLabel from '../../components/InputWithLabel';
import ParticipantAddCard from '../../components/ParticipantAddCard';
import { useFocusRef } from '../../hooks/useFocusRef';

import { uniqueBy } from '../../utils';
import { useReadBulkEmails } from '../../utils/readFromSpreadsheetPaste';

interface Row {
  name: string;
  email: string;
  phone: string;
}

type Props = {
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  existingParticipants?: Test['participants'];
};

const FilterContext = createContext<Row | undefined>(undefined);

const CreateParticipantGroupModal = ({ setIsOpen, isOpen, existingParticipants = [] }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: ''
    }
  });
  const { mutateAsync: parseEmails, isLoading: isParsingEmails } = useReadBulkEmails();
  const { mutate: createGroup, isLoading: isCreatingGroup } = useCreateParticipantGroup();
  const [participants, setParticipants] = useState<
    { name: string; email: string; phone: string }[]
  >([]);
  const [bulkParticipantsString, setBulkParticipantsString] = useState('');
  const [filters, setFilters] = useState<Row>({
    name: '',
    email: '',
    phone: ''
  });

  const handleCreateGroup = async ({ name }: FieldValues) => {
    const data = {
      name,
      participants
    };

    createGroup(data, {
      onSuccess: () => {
        toast.success('Group created');
        setParticipants([]);
        setIsOpen(false);
      },
      onError: (error) => {
        console.error(error);
        toast.error('Error creating group');
      }
    });
  };

  const dataGridColumns = useMemo(
    (): readonly Column<Row>[] => [
      {
        key: 'name',
        name: 'Name',
        headerCellClass: 'leading-[30px]',
        resizable: true,
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className={'w-full h-[30px] border px-1'}
                placeholder={'Filter by name'}
                value={filters.name}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    name: e.target.value
                  })
                }
              />
            )}
          </FilterRenderer>
        )
      },
      {
        key: 'email',
        name: 'Email',
        headerCellClass: 'leading-[30px]',
        resizable: true,
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className={'w-full h-[30px] border px-1'}
                placeholder={'Filter by email'}
                value={filters.email}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    email: e.target.value
                  })
                }
              />
            )}
          </FilterRenderer>
        )
      },
      {
        key: 'phone',
        name: 'Phone',
        headerCellClass: 'leading-[30px]',
        resizable: true,
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className={'w-full h-[30px] border px-1'}
                placeholder={'Filter by phone'}
                value={filters.phone}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    phone: e.target.value
                  })
                }
              />
            )}
          </FilterRenderer>
        )
      },
      {
        key: 'delete',
        name: 'Remove',
        width: 40,
        resizable: false,
        formatter: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setParticipants((participants) =>
                participants.filter(({ email }) => email !== row.email)
              );
            }}
            className="flex items-center justify-center w-full h-full"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )
      }
    ],
    []
  );

  const dataGridRows = useMemo(() => {
    return participants.map(({ name, email, phone }) => ({ name, email, phone, resizable: true }));
  }, [participants]);

  const filteredRows = useMemo(() => {
    return dataGridRows.filter((r) => {
      return (
        (filters.name ? r.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.email ? r.email.includes(filters.email) : true) &&
        (filters.phone ? r.phone.includes(filters.phone) : true)
      );
    });
  }, [dataGridRows, filters]);

  const handleBulkFormSubmit = async () => {
    const parsedEmails = await parseEmails({
      newData: bulkParticipantsString,
      prevData: participants
    });

    // Remove duplicates from parsed emails
    const filteredEmails = parsedEmails.filter(
      (email) => !existingParticipants.find((p) => p.name === email.name)
    );

    // Add empty phone strings
    const newParticipants = filteredEmails.map((e) => ({ ...e, phone: '' }));

    setParticipants(newParticipants);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-default transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create Participant Group
                  </Dialog.Title>

                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <form className="mt-8" onSubmit={handleSubmit(handleCreateGroup)}>
                  <div className="mb-4">
                    <InputWithLabel
                      label="Group name"
                      className="p-2 border rounded-lg min-w-[260px]"
                      placeholder="Name"
                      error={errors?.name?.message as string}
                      {...register('name', {
                        required: { value: true, message: 'Participant group name is required' }
                      })}
                    />
                  </div>
                  <div>
                    <p className="mb-4 font-medium">Add participants to this group.</p>

                    <ParticipantAddCard
                      onSubmitParticipant={(participant) => {
                        setParticipants((participants) => [...participants, participant]);
                      }}
                    />
                  </div>

                  <div>
                    <p className="mb-4 font-medium">
                      Add participants to this group in bulk. Copy and paste name and email columns
                      from a spreadsheet or CSV.
                    </p>
                    <div className="flex gap-4">
                      <textarea
                        className="border w-full rounded-lg p-2"
                        rows={6}
                        value={bulkParticipantsString}
                        onChange={(e) => setBulkParticipantsString(e.target.value)}
                      />
                      <div className="items-stretch">
                        <button
                          type="button"
                          onClick={handleBulkFormSubmit}
                          disabled={isParsingEmails}
                          className="px-4 rounded-lg bg-[#4353ff] disabled:bg-gray-300 text-white text-2xl h-full max-h-[42px]"
                        >
                          +
                        </button>
                        {isParsingEmails && (
                          <div className="flex items-center justify-center mt-4">
                            <TailSpin color="#4353ff" width={24} height={24} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <FilterContext.Provider value={filters}>
                    {participants.length > 0 && (
                      <div className="mt-16">
                        <div className="mt">
                          <DataGrid
                            columns={dataGridColumns}
                            rows={filteredRows}
                            rowKeyGetter={(row) => row.name + row.email + row.phone}
                            headerRowHeight={70}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <p>
                            Adding {participants.length} participant
                            {participants.length > 1 && 's'} to group
                          </p>
                          <button
                            onClick={() => setParticipants([])}
                            className="px-4 py-2 rounded-lg bg-red-500 flex items-center gap-2 text-white"
                          >
                            <XIcon className="w-4 h-4" /> Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </FilterContext.Provider>
                  <div className="flex justify-end mt-8">
                    <ActionButton loading={isCreatingGroup} disabled={isCreatingGroup}>
                      Create Group
                    </ActionButton>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateParticipantGroupModal;

function FilterRenderer<R, SR, T extends HTMLOrSVGElement>({
  isCellSelected,
  column,
  children
}: HeaderRendererProps<R, SR> & {
  children: (args: {
    ref: React.RefObject<T>;
    tabIndex: number;
    filters: Row;
  }) => React.ReactElement;
}) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const filters = useContext(FilterContext)!;
  const { ref, tabIndex } = useFocusRef<T>(isCellSelected);

  return (
    <>
      <div>{column.name}</div>
      <div>{children({ ref, tabIndex, filters })}</div>
    </>
  );
}
