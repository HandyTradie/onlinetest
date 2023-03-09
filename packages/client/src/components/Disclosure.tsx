import { Disclosure as HeadlessDisclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

type Props = {
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
  buttonClassName?: string;
  panelClassName?: string;
  chevronClassName?: string;
};

const Disclosure = ({
  title,
  children,
  buttonClassName,
  chevronClassName,
  containerClassName,
  panelClassName
}: Props) => {
  return (
    <div className={`w-full rounded-lg bg-white ${containerClassName}`}>
      <HeadlessDisclosure>
        {({ open }) => (
          <>
            <HeadlessDisclosure.Button
              className={`flex w-full justify-between rounded-lg bg-blue-50 p-2 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 ${buttonClassName}`}
            >
              <span>{title}</span>
              <ChevronUpIcon
                className={`${
                  open ? '' : 'rotate-180 transform'
                } h-5 w-5 text-blue-500 ${chevronClassName}`}
              />
            </HeadlessDisclosure.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <HeadlessDisclosure.Panel className={`${panelClassName}`}>
                {children}
              </HeadlessDisclosure.Panel>
            </Transition>
          </>
        )}
      </HeadlessDisclosure>
    </div>
  );
};

export default Disclosure;
