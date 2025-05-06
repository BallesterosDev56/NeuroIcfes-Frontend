import React, { useState } from 'react';
import {Sidebar} from '../../components/Sidebar/Sidebar';
import MainContent from '../../components/MainContent/MainContent';

export const Home = () => {
  const [activeSection, setActiveSection] = useState('practice');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
      <MainContent activeSection={activeSection} />
    </div>
  );
};
