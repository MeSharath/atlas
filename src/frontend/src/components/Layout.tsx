import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar - only show for authenticated users and when showSidebar is true */}
        {user && showSidebar && (
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
            <Sidebar />
          </div>
        )}
        
        {/* Main content */}
        <div className={`flex-1 ${user && showSidebar ? 'lg:pl-64' : ''}`}>
          <main className="pt-16 pb-8">
            {children}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;
