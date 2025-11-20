import React, { useState } from 'react';
import { Menu, X, Hexagon, Search, User } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'analysis', label: 'Analisi AI' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'blog', label: 'Blog' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="relative">
              <Hexagon className="h-8 w-8 text-primary-500 fill-primary-500/20 group-hover:animate-spin transition-all duration-700" />
              <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20 rounded-full"></div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              terreninvendita<span className="text-primary-500">.ai</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
                    currentPage === item.id
                      ? 'text-primary-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 shadow-[0_0_10px_#22c55e]"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full border border-white/10 transition-all backdrop-blur-md group"
            >
              <User className="h-4 w-4 group-hover:text-primary-400 transition-colors" />
              <span className="text-sm font-medium">Area Riservata</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => {
                setCurrentPage('dashboard');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-primary-400 hover:bg-white/5"
            >
              Area Riservata
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;