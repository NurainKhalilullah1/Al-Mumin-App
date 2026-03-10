import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 ease-in-out ${scrolled ? 'py-4 bg-schoolGreen/95 backdrop-blur-md shadow-xl' : `py-6 bg-transparent ${isHome ? 'mt-8' : ''}`}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Real Image Logo in a White Circle */}
          <div className={`p-1 rounded-full transition-all duration-300 overflow-hidden border-2 ${scrolled ? 'bg-white border-schoolGold' : 'bg-white border-transparent shadow-lg'}`}>
            <img
              src="/logo.png"
              alt="Al-Mumin Logo"
              className="w-10 h-10 object-contain"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-xl tracking-wide leading-none transition-colors text-white">
              Al-Mumin (AM)
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-schoolGold">
              Schools
            </span>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-schoolGold transition-all relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-schoolGold transition-all group-hover:w-full"></span>
            </Link>
          ))}

          <Link to="/login" className="px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 bg-schoolGold text-schoolGreen hover:bg-white">
            Portal Login
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden transition-colors text-white"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-schoolGreen text-white p-8 md:hidden flex flex-col gap-6 shadow-2xl border-t border-white/10 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-xl font-serif font-bold border-b border-white/10 pb-4 hover:text-schoolGold transition-colors">
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="bg-schoolGold text-white py-4 text-center rounded-xl font-bold uppercase tracking-widest shadow-lg">
            Access Portal
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;