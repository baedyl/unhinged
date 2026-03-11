/**
 * Shared Clerk dark theme: zinc-950 background, high-contrast text.
 * Use for SignIn and SignUp so headings, labels, and buttons are readable.
 */
export const clerkDarkAppearance = {
  variables: {
    colorPrimary: '#fafafa',
    colorBackground: '#18181b',
    colorForeground: '#fafafa',
    colorMutedForeground: '#a1a1aa',
    colorInput: '#27272a',
    colorInputForeground: '#fafafa',
    colorNeutral: '#71717a',
    colorBorder: '#3f3f46',
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-zinc-900 border border-zinc-800 shadow-xl',
    headerTitle: 'text-zinc-50',
    headerSubtitle: 'text-zinc-400',
    socialButtonsBlockButton: 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700',
    formFieldLabel: 'text-zinc-300',
    formFieldInput: 'bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500',
    formButtonPrimary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    footerActionLink: 'text-zinc-300 hover:text-white',
    dividerLine: 'bg-zinc-700',
    dividerText: 'text-zinc-400',
    identityPreviewEditButton: 'text-zinc-300 hover:text-white',
  },
};
