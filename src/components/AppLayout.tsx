import React, { ReactNode } from 'react';
import { DesktopSidebar, MobileTabBar, MobileHeader } from './Navigation';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Main content */}
      <main style={{ transition: 'padding 150ms ease' }} className="md:ml-[220px]">
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 100px' }}>
          {children}
        </div>
      </main>

      {/* Mobile tab bar */}
      <div className="md:hidden">
        <MobileTabBar />
      </div>
    </div>
  );
};
