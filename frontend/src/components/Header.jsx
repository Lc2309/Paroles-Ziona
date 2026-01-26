import React from 'react';

const Header = () => {
  return (
    <header className="w-full h-20 bg-white flex items-center justify-between px-4 md:px-8 shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-3 md:gap-4">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-10 md:h-12 w-auto object-contain"
        />
        <h1 className="text-xl md:text-3xl font-black bg-ziona-gradient bg-clip-text text-transparent uppercase tracking-tight">
          Ziona Mahafinaritra
        </h1>
      </div>
    </header>
  );
};

export default Header;