import { MailIcon, ClipboardCopyIcon, TrashIcon } from '@heroicons/react/outline';
import { createContext, useContext, useMemo, useState } from 'react';
import DataGrid, { Column, HeaderRendererProps } from 'react-data-grid';
import toast from 'react-hot-toast';
import { TailSpin } from 'react-loader-spinner';
import { Test, useRemoveParticipantFromTest, useResendInvite } from '../../api/tests';
import { useFocusRef } from '../../hooks/useFocusRef';

interface Row {
  name: string;
  email: string;
  phone: string;
  status: JSX.Element;
}

type Filter = Omit<Row, 'status'>;

// Context for filter values
const FilterContext = createContext<Filter | undefined>(undefined);

const ParticipantsTab = ({
  participants,
  testID
}: {
  participants: Test['participants'];
  testID: Test['id'];
}) => {
  const [filters, setFilters] = useState<Filter>({
    name: '',
    email: '',
    phone: ''
  });

  const dataGridRows = useMemo(() => {
    return participants.map(({ name, email, phone, status, ...rest }) => ({
      name,
      email,
      phone,
      status: (
        <ParticipantCard participant={{ name, email, phone, status, ...rest }} testID={testID} />
      ),
      resizable: true
    }));
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
        key: 'status',
        name: 'Status & Actions',
        width: 200,

        resizable: true
      }
    ],
    []
  );

  return (
    <div>
      <div className="my-4 mb-12">
        <p className="mb-4">Students signed up for test.</p>

        <FilterContext.Provider value={filters}>
          <div>
            {participants?.length > 0 ? (
              <DataGrid
                columns={dataGridColumns}
                rows={filteredRows}
                rowKeyGetter={(row) => row.name + row.email + row.phone}
                headerRowHeight={70}
              />
            ) : (
              <div className="flex w-full gap-4 mb-6">
                <div className="flex-1">No students signed up yet.</div>
              </div>
            )}
          </div>
        </FilterContext.Provider>
      </div>
    </div>
  );
};

export enum ParticipantStatus {
  PENDING = 'PENDING', // default status for new participants
  INVITED = 'INVITED', // status for invited participants
  TAKEN = 'TAKEN', // status for when participant takes test
  GRADED = 'GRADED', // status for when participant's test is graded
  RESULTS_SENT = 'RESULTS_SENT' // status for when participant's results are sent
}

export const ParticipantStatusBadge = ({ status }: { status: ParticipantStatus }) => {
  switch (status) {
    case ParticipantStatus.PENDING:
      return (
        <div className="text-xs px-3 bg-gray-200 text-gray-800 rounded-full flex items-center">
          PENDING
        </div>
      );
    case ParticipantStatus.INVITED:
      return (
        <div className="text-xs px-3 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
          INVITED
        </div>
      );
    case ParticipantStatus.TAKEN:
      return (
        <div className="text-xs px-3 bg-green-200 text-green-800 rounded-full flex items-center">
          TAKEN
        </div>
      );
    case ParticipantStatus.GRADED:
      return (
        <div className="text-xs px-3 bg-blue-200 text-blue-800 rounded-full flex items-center">
          GRADED
        </div>
      );
    case ParticipantStatus.RESULTS_SENT:
      return (
        <div className="text-xs px-3 bg-purple-200 text-purple-800 rounded-full flex items-center">
          RESULTS SENT
        </div>
      );
  }
};

export const ParticipantCard = ({
  participant,
  testID
}: {
  participant: Test['participants'][0];
  testID: Test['id'];
}) => {
  const { mutateAsync: removeParticipant, isLoading: isRemovingParticipant } =
    useRemoveParticipantFromTest();
  const { mutateAsync: resendInvite, isLoading: isResendingInvite } = useResendInvite();
  const handleCopy = () => {
    navigator.clipboard.writeText(participant.inviteCode);
    toast.success('Invite code copied to clipboard.');
  };

  return (
    <div className="flex items-center gap-2 h-full">
      <ParticipantStatusBadge status={participant.status} />
      {participant.email && (
        <button
          title="Resend invitation"
          onClick={() =>
            resendInvite({
              testID,
              participantIDs: [participant.id]
            })
          }
        >
          {isResendingInvite ? (
            <div className="flex items-center justify-center w-full h-full">
              <TailSpin color="#000" width={16} height={16} />
            </div>
          ) : (
            <MailIcon className="w-5 h-5" />
          )}
        </button>
      )}
      <button title="Copy invite code" onClick={handleCopy}>
        <ClipboardCopyIcon className="w-5 h-5" />
      </button>
      <button
        title="Remove participant"
        disabled={isRemovingParticipant}
        onClick={() =>
          removeParticipant({
            participantID: participant.id,
            testID
          })
        }
      >
        {isRemovingParticipant ? (
          <div className="flex items-center justify-center w-full h-full">
            <TailSpin color="#000" width={16} height={16} />
          </div>
        ) : (
          <TrashIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default ParticipantsTab;

function FilterRenderer<R, SR, T extends HTMLOrSVGElement>({
  isCellSelected,
  column,
  children
}: HeaderRendererProps<R, SR> & {
  children: (args: {
    ref: React.RefObject<T>;
    tabIndex: number;
    filters: Filter;
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
