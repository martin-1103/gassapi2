import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className='h-screen flex overflow-hidden bg-gray-100'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header />

        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
