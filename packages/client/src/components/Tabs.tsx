import { Tab } from '@headlessui/react';
import { classNames } from './TestDetailTabs';

export const StyledTab = ({ children }: { children: string }) => {
  return (
    <Tab
      className={({ selected }) =>
        classNames(
          'w-full rounded-lg py-2.5 text-sm font-medium leading-5 min-w-[120px]',
          'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
          selected ? 'bg-white shadow' : ' hover:text-blue-400'
        )
      }
    >
      {children}
    </Tab>
  );
};

export const StyledTabPanel = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tab.Panel
      className={classNames(
        'rounded-xl bg-white py-3',
        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none'
      )}
    >
      {children}
    </Tab.Panel>
  );
};
