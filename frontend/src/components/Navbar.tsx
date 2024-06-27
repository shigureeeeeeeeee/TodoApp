'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Todo List';
      case '/calendar':
        return 'Calendar';
      case '/report':
        return 'Report';
      case '/signin':
        return 'Sign In';
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
        {status === "authenticated" ? (
          <Button variant="ghost" onClick={() => signOut()}>Sign Out</Button>
        ) : (
          <Link href="/signin" passHref>
            <Button variant="ghost">Sign In</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;;