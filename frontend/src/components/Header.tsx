import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';

const Header: React.FC = () => {
  const { isLoggedIn, user, logout, setUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const didRefreshProfile = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || didRefreshProfile.current) return;

    didRefreshProfile.current = true;
    apiService
      .getProfile()
      .then((res) => setUser(res.data))
      .catch(() => undefined);
  }, [isLoggedIn, setUser]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass =
    'block py-3 px-1 text-base font-medium hover:text-secondary transition min-h-[44px] flex items-center';

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0" onClick={closeMobileMenu}>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold truncate">
              <span className="sm:hidden">🏆 Velicham Fifa&apos;26</span>
              <span className="hidden sm:inline">🏆 Velicham Fifa&apos;26 Prediction</span>
            </h1>
          </Link>

          <div className="md:hidden flex items-center gap-2 shrink-0">
            {!isLoggedIn && (
              <Link
                to="/login"
                className="px-3 py-2 text-xs bg-secondary rounded-lg hover:bg-blue-600 transition min-h-[44px] flex items-center"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg hover:bg-blue-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/" className="hover:text-secondary transition">
              Home
            </Link>
            <Link to="/leaderboard" className="hover:text-secondary transition">
              Leaderboard
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="hover:text-secondary transition">
                  Dashboard
                </Link>
                <Link to="/my-predictions" className="hover:text-secondary transition">
                  My Predictions
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:text-secondary transition focus:outline-none min-h-[44px]"
                  >
                    <span className="text-sm font-medium">Hi, {user?.firstName}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm bg-secondary rounded hover:bg-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm border border-secondary rounded hover:bg-secondary transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-blue-800">
            <Link to="/" className={navLinkClass} onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/leaderboard" className={navLinkClass} onClick={closeMobileMenu}>
              Leaderboard
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={navLinkClass} onClick={closeMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/my-predictions" className={navLinkClass} onClick={closeMobileMenu}>
                  My Predictions
                </Link>
                <Link to="/profile" className={navLinkClass} onClick={closeMobileMenu}>
                  My Profile
                </Link>
                <div className="pt-3 mt-2 border-t border-blue-800">
                  <p className="text-sm font-bold px-1 mb-2">Hi, {user?.firstName}</p>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                      closeMobileMenu();
                    }}
                    className="w-full px-4 py-3 bg-danger rounded-lg hover:bg-red-600 transition font-medium min-h-[44px]"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 border border-secondary rounded-lg hover:bg-secondary transition min-h-[44px] flex items-center justify-center"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
