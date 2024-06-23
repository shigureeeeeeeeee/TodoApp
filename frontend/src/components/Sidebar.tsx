'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BarChart2, Menu, X, CheckSquare } from 'lucide-react';
import { Button } from "@/components/ui/button"

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-100 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'} overflow-hidden z-10`}>
      <Button
        className="absolute top-4 left-4"
        onClick={toggleSidebar}
        size="icon"
        variant="outline"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>
      <div className="mt-16 p-4">
        <nav className="space-y-2">
          <Link href="/" passHref>
            <div className={`flex items-center space-x-2 p-2 rounded ${pathname === '/' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
              <Home size={20} />
              <span className={isOpen ? 'block' : 'hidden'}>Home</span>
            </div>
          </Link>
          <Link href="/todo" passHref>
            <div className={`flex items-center space-x-2 p-2 rounded ${pathname === '/todo' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
              <CheckSquare size={20} />
              <span className={isOpen ? 'block' : 'hidden'}>Todo</span>
            </div>
          </Link>
          <Link href="/calendar" passHref>
            <div className={`flex items-center space-x-2 p-2 rounded ${pathname === '/calendar' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
              <Calendar size={20} />
              <span className={isOpen ? 'block' : 'hidden'}>Calendar</span>
            </div>
          </Link>
          <Link href="/report" passHref>
            <div className={`flex items-center space-x-2 p-2 rounded ${pathname === '/report' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
              <BarChart2 size={20} />
              <span className={isOpen ? 'block' : 'hidden'}>Report</span>
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;