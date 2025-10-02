'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Animation for navbar slide-in on mount
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        navbar.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav
      id="navbar"
      className="fixed top-0 left-0 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg transition-transform duration-500 ease-out z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight hover:text-indigo-100 transition-colors duration-300"
            >
              Food AI
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300 rounded-md"
            >
              Home
            </Link>
            {status === 'authenticated' ? (
              <>
                <Link
                  href="/classifier"
                  className="px-3 py-2 text-sm font-medium hover:bg-purple-700 hover:scale-105 transform transition-all duration-300 rounded-md"
                >
                  Classifier
                </Link>
                <Link
                  href="/profile"
                  className="px-3 py-2 text-sm font-medium hover:bg-purple-700 hover:scale-105 transform transition-all duration-300 rounded-md"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-2 text-sm font-medium hover:bg-red-700 hover:scale-105 transform transition-all duration-300 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-3 py-2 text-sm font-medium hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 text-sm font-medium hover:bg-purple-700 hover:scale-105 transform transition-all duration-300 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-indigo-700 transition-colors duration-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-slide-in">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium hover:bg-indigo-700 rounded-md transition-colors duration-300"
                onClick={toggleMenu}
              >
                Home
              </Link>
              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/classifier"
                    className="block px-3 py-2 text-base font-medium hover:bg-purple-700 rounded-md transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Classifier
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium hover:bg-purple-700 rounded-md transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      toggleMenu();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-red-700 rounded-md transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block px-3 py-2 text-base font-medium hover:bg-indigo-700 rounded-md transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 text-base font-medium hover:bg-purple-700 rounded-md transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}