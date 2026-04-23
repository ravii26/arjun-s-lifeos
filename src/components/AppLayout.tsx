import React, { ReactNode } from 'react';
import AppShell from './AppShell';
import { useLocation } from 'react-router-dom';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  const titleByPath: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Tasks',
    '/habits': 'Habits',
    '/calendar': 'Calendar',
    '/learn': 'Learn',
    '/areas': 'Areas',
    '/vault': 'Vault',
    '/dump': 'Dump',
    '/settings': 'Settings',
  };

  const pageTitle = pathname.startsWith('/areas/')
    ? 'Area Detail'
    : pathname.startsWith('/learn/')
      ? 'Learn Detail'
      : titleByPath[pathname] ?? 'LifeOS';

  return (
    <AppShell pageTitle={pageTitle}>
      {children}
    </AppShell>
  );
};
