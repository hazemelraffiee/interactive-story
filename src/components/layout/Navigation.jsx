import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Heart,
  PenTool, 
  Settings, 
  User,
  Zap,
  BookMarked,
  Menu,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isMobileMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isUserMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isMobileMenuOpen || isUserMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  // Initialize as dark
  const [isDark, setIsDark] = useState(true);

  // Set initial theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force dark mode by default
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      if (isCurrentlyDark) {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      setIsDark(!isCurrentlyDark);
    }
  };

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
            <DarkModeSwitch
              checked={isDark}
              onChange={toggleTheme}
              size={30}
              sunColor="orange"
              moonColor="white"
            />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                  <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Login
              </Link>
            )}
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

          {user && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

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

            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;