import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Heart,
  PenTool, 
  Settings, 
  User,
  Zap,
  BookMarked,
  Menu,
  Moon,
  Sun
} from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };  

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    {
      label: 'My Stories',
      icon: BookMarked,
      to: '/mystories'
    },
    {
      label: 'Favorites',
      icon: Heart,
      to: '/favorites'
    },
    {
      label: 'Create',
      icon: PenTool,
      to: '/create'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Left Navigation */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link 
              to="/"
              className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              role="button"
              aria-label="Return to home"
            >
              <div className="relative">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="absolute -top-1 -right-1 bg-purple-100 rounded-full p-1">
                  <Zap className="h-3 w-3 text-purple-600" />
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">StoryLab</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.label}
                    to={item.to}
                    className={`text-gray-500 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                      location.pathname === item.to ? 'text-purple-600' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity md:hidden z-40" />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={mobileMenuRef}
        className={`absolute top-0 left-0 md:hidden transform ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        } transition-all duration-300 ease-in-out z-50`}
      >
        <div className="bg-white shadow-lg rounded-r-xl w-64 py-4">
          {/* Mobile Menu Content */}
          <div className="px-4 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StoryLab</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-2 py-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors ${
                  location.pathname === item.to ? 'bg-purple-50 text-purple-600' : ''
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;