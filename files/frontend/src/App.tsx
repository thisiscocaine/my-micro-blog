import React, { PropsWithChildren } from 'react';
import NavBar from './components/NavBar';

export default function App({ children }: PropsWithChildren) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
