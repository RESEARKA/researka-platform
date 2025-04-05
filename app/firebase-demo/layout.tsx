import React from 'react';

export const metadata = {
  title: 'Firebase Demo',
  description: 'Firebase demonstration page',
};

export default function FirebaseDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
