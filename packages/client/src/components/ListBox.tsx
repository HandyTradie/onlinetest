import React, { forwardRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';

interface Props {
  options: readonly { id: string; name: string }[];
  selected: { id: string; name: string };
  setSelected: React.Dispatch<
    React.SetStateAction<{
      name: string;
      id: string;
    }>
  >;
  error?: boolean;
  multiple?: boolean;
}

const ListBox = forwardRef<HTMLDivElement, Props>(
  ({ selected, setSelected, options, error, multiple }, ref) => {
    return (
      <>
        <div
          ref={ref}
          className={`w-full ${error ? 'border-red-400' : 'border-black'}  rounded-lg`}
        >
          <Listbox value={selected} onChange={setSelected} multiple={multiple} by="id">
            <div className="relative">
              <Listbox.Button className="flex justify-between w-full shadow-md border px-2 py-2 pl-3 text-left bg-white rounded-lg focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span className="block truncate">
                  {Array.isArray(selected)
                    ? selected?.map((e) => e?.name).join(', ')
                    : selected?.name}
                </span>
                <span className="flex items-center pointer-events-none">
                  <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-20 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options?.map((option) => (
                    <Listbox.Option
                      key={option?.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-primary-blue bg-opacity-10' : 'text-gray-900'
                        }`
                      }
                      value={option}
                    >
                      {({ selected: isSelected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              isSelected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {option.name}
                          </span>
                          {isSelected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon className="w-5 h-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        {error && <div className="pl-1 mt-1 text-sm text-[#ff6b6b] max-w-[320px]">{error}</div>}
      </>
    );
  }
);

export default ListBox;
