import { ClipboardCopyIcon, XIcon } from '@heroicons/react/outline';
import { createContext, useContext, useMemo, useState } from 'react';
import DataGrid, { Column, HeaderRendererProps } from 'react-data-grid';
import { FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TailSpin } from 'react-loader-spinner';
import { useParams } from 'react-router-dom';
import { Test, useAddParticipantsToTest } from '../../api/tests';
import { useFocusRef } from '../../hooks/useFocusRef';

import { uniqueBy } from '../../utils';
import { useReadBulkEmails } from '../../utils/readFromSpreadsheetPaste';
import ActionButton from '../ActionButton';
import AddFromPartipantGroupList from '../AddFromPartipantGroupList';
import ParticipantAddCard from '../ParticipantAddCard';

interface Row {
  name: string;
  email: string;
  phone: string;
}

const FilterContext = createContext<Row | undefined>(undefined);

const InviteParticipantsTab = ({
  participants: existingParticipants,
  testInviteCode
}: {
  participants: Test['participants'];
  testInviteCode: string | undefined;
}) => {
  const [participants, setParticipants] = useState<
    { name: string; email: string; phone: string }[]
  >([]);
  const [sendEmails, setSendEmails] = useState(true);
  const [filters, setFilters] = useState<Row>({
    name: '',
    email: '',
    phone: ''
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      participantsRawString: ''
    }
  });
  const { mutateAsync: parseEmails, isLoading: isParsingEmails } = useReadBulkEmails();
  const { mutateAsync: addParticipants, isLoading: isAddingParticipants } =
    useAddParticipantsToTest();
  const { testID } = useParams();

  const handleBulkFormSubmit = async (data: FieldValues) => {
    const parsedEmails = await parseEmails({
      newData: data.participantsRawString,
      prevData: participants
    });

    // Remove duplicates from parsed emails
    const filteredEmails = parsedEmails.filter(
      (email) => !existingParticipants.find((p) => p.email === email.email)
    );

    // Add empty phone strings
    const newParticipants = filteredEmails.map((e) => ({ ...e, phone: '' }));

    setParticipants(newParticipants);
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
            onClick={() => {
              setParticipants(participants.filter(({ email }) => email !== row.email));
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

  const handleAddParticipants = async () => {
    try {
      if (testID) {
        await addParticipants({
          testID,
          participants,
          sendEmails
        });

        toast.success(`${participants.length} participant(s) added successfully`);

        setParticipants([]);
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  const testInviteLink = useMemo(() => {
    if (testID) {
      return `${window.location.origin}/test/t/${testInviteCode}`;
    }
  }, [testID]);

  const handleCopyInviteLink = () => {
    if (testInviteLink) {
      navigator.clipboard.writeText(testInviteLink);
      toast.success('Copied invite link to clipboard');
    }
  };

  const handleCopyInviteCode = () => {
    if (testInviteCode) {
      navigator.clipboard.writeText(testInviteCode);
      toast.success('Copied invite code to clipboard');
    }
  };

  return (
    <div>
      <div className="my-4">
        {testInviteCode && (
          <>
            <div className="mb-4">
              <p>Test Invite Code</p>
              <div className="flex gap-4 pt-2">
                <div className="border py-2 pl-2 rounded-lg w-full text-blue-500">
                  <p>{testInviteCode}</p>
                </div>

                <button
                  onClick={handleCopyInviteCode}
                  className="px-4 rounded-lg bg-[#4353ff] disabled:bg-gray-300 text-white h-[42px]"
                >
                  <ClipboardCopyIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <p>Test Invite Link</p>
              <div className="flex gap-4 pt-2">
                <div className="border py-2 pl-2 rounded-lg w-full text-blue-500 underline">
                  <a href={testInviteLink} target="_blank" rel="noreferrer">
                    {testInviteLink}
                  </a>
                </div>

                <button
                  onClick={handleCopyInviteLink}
                  className="px-4 rounded-lg bg-[#4353ff] disabled:bg-gray-300 text-white h-[42px]"
                >
                  <ClipboardCopyIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
        <div>
          <p className="mb-4">Add students to this test.</p>

          <ParticipantAddCard
            onSubmitParticipant={(participant) => {
              // Add participant to array without duplicates
              setParticipants([...participants, participant]);
            }}
          />
        </div>

        <div>
          <p className="mb-4">Add students to this test from a participant group.</p>

          <AddFromPartipantGroupList
            onAddParticipants={(newParticipants) => {
              setParticipants((participants) => [...participants, ...newParticipants]);
            }}
          />
        </div>

        <form onSubmit={handleSubmit(handleBulkFormSubmit)}>
          <p className="mb-4">
            Add students to this test in bulk. Copy and paste name and email columns from a
            spreadsheet or CSV.
          </p>
          <div className="flex gap-4">
            <textarea
              className="border w-full rounded-lg p-2"
              rows={6}
              required
              {...register('participantsRawString')}
            />
            <div className="items-stretch">
              <button
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
        </form>

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
              <div className="flex justify-end items-center mt-4">
                <button
                  onClick={() => setParticipants([])}
                  className="px-4 py-2 rounded-lg bg-red-500 flex items-center gap-2 text-white"
                >
                  <XIcon className="w-4 h-4" /> Clear
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8">
                <p>
                  Adding {participants.length} participant{participants.length > 1 && 's'} to test
                </p>
                <div className="flex gap-4 mt-4 sm:mt-0 items-center">
                  <label className="flex items-center gap-2">
                    Send invite emails
                    <input
                      type="checkbox"
                      checked={sendEmails}
                      onChange={(e) => setSendEmails(e.target.checked)}
                    />
                  </label>
                  <ActionButton
                    loading={isAddingParticipants}
                    disabled={isAddingParticipants}
                    onClick={handleAddParticipants}
                  >
                    Add Participants
                  </ActionButton>
                </div>
              </div>
            </div>
          )}
        </FilterContext.Provider>
      </div>
    </div>
  );
};

export default InviteParticipantsTab;

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
