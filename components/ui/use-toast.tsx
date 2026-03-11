'use client';

import { toast as sonnerToast, Toaster as Sonner } from 'sonner';

const Toaster = () => (
  <Sonner
    theme="dark"
    toastOptions={{
      classNames: {
        toast: 'bg-zinc-900 border-zinc-800 text-white',
        description: 'text-zinc-400',
      },
    }}
  />
);

export function useToast() {
  const toast = (props: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    sonnerToast(props.title ?? '', {
      description: props.description,
    });
  };
  return { toast };
}

export { Toaster };
