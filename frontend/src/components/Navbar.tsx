'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Todo List';
      case '/calendar':
        return 'Calendar';
      case '/report':
        return 'Report';
      default:
        return 'Task Manager';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center h-16 z-20">
      <h1 className="text-xl font-bold">{getPageTitle(pathname)}</h1>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings size={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <User size={20} />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;