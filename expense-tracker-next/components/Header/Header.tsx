import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="
      bg-gradient-to-br from-blue-500 to-purple-600
      text-white shadow-lg mb-8 
      flex flex-col md:flex-row md:justify-between md:items-center
      gap-5 w-full px-5 py-6 rounded-xl md:text-left
    ">
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">{title}</h1>
        {subtitle && <p className="text-base m-0 opacity-90 text-blue-100">{subtitle}</p>}
      </div>
      <nav className="
      flex flex-col sm:flex-row gap-3
      w-full sm:w-auto justify-center lg:justify-end">
        <button className="
        text-white px-4 py-2 rounded-md text-sm font-medium
        cursor-pointer transition-all duration-200
        bg-white/20 border border-white/40 text-center
        focus:outline-none focus:ring-2 focus:ring-white/50
        hover:bg-white/30 hover:border-white/30
        ">
          Dashboard
        </button>
        <button className="
        bg-white/10 border border-white/20 text-white
        px-4 py-2 rounded-md text-sm font-medium cursor-pointer
        transition-all duration-200 text-center
        hover:bg-white/20 hover:-translate-y-0.5 hover:border-white/30
        focus:outline-none focus:ring-2 focus:ring-white/50">
          Analytics
        </button>
        <button className="
        bg-white/10 border border-white/20 text-white
        px-4 py-2 rounded-md text-sm font-medium cursor-pointer
        transition-all duration-200 text-center
        hover:bg-white/20 hover:-translate-y-0.5 hover:border-white/30
        focus:outline-none focus:ring-2 focus:ring-white/50
        ">
          Settings
          </button>
      </nav>
    </header>
  );
};

export default Header;