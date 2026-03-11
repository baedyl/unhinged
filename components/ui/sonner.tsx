'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-zinc-900 border-zinc-800 text-white',
          description: 'text-zinc-400',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
