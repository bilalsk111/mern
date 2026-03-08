import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../home/components/Sidebar';
import '../../home/style/sidebar.scss'

const MainLayout = () => {
  return (
    <div className="app-container" style={{display: 'flex'}}>
      <div className='sidebar'>
        <Sidebar />
      </div>
      <div className="main-content" style={{flex: 1}}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;