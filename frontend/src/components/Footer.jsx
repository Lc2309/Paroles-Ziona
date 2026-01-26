import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-6 mt-auto">
      <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center opacity-80">
        <p className="text-sm">
          &copy; 2026 <span className="font-bold text-ziona-yellow">Paroles Ziona</span>. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;