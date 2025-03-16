import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { useAuth } from '../contexts/AuthContext';

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-lightBlue-600 font-bold' : 'text-blueGray-700 hover:text-lightBlue-500';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="top-0 fixed z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-white shadow">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          {/* Logo section */}
          <div className="w-auto flex items-center">
            <Link
              to="/"
              className="text-emerald-500 text-3xl font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
            >
              Researka
            </Link>
          </div>
          
          {/* Navigation items - always visible */}
          <div className="flex flex-wrap items-center">
            {/* Left side menu items */}
            <ul className="flex flex-wrap list-none mr-4">
              <li className="flex items-center">
                <Link
                  to="/"
                  className={`${isActive('/')} px-3 py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 mx-1`}
                >
                  <i className="fas fa-home text-lg leading-lg mr-2 w-5 text-center"></i>
                  HOME
                </Link>
              </li>
              <li className="flex items-center">
                <Link
                  to="/articles/search"
                  className={`${isActive('/articles/search')} px-3 py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 mx-1`}
                >
                  <i className="fas fa-search text-lg leading-lg mr-2 w-5 text-center"></i>
                  SEARCH
                </Link>
              </li>
              <li className="flex items-center">
                <Link
                  to="/submit"
                  className={`${isActive('/submit')} px-3 py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 mx-1`}
                >
                  <i className="fas fa-paper-plane text-lg leading-lg mr-2 w-5 text-center"></i>
                  SUBMIT
                </Link>
              </li>
              {isAuthenticated && user?.role === 'author' && (
                <li className="flex items-center">
                  <Link
                    to="/author-dashboard"
                    className={`${isActive('/author-dashboard')} px-3 py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 mx-1`}
                  >
                    <i className="fas fa-file-alt text-lg leading-lg mr-2 w-5 text-center"></i>
                    MY ARTICLES
                  </Link>
                </li>
              )}
              <li className="flex items-center">
                <Link
                  to="/review-dashboard"
                  className={`${isActive('/review-dashboard')} px-3 py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 mx-1`}
                >
                  <i className="fas fa-clipboard-check text-lg leading-lg mr-2 w-5 text-center"></i>
                  REVIEW
                </Link>
              </li>
              <li className="flex items-center relative group">
                <Link
                  to="/info"
                  className={`${isActive('/info')} px-3 py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 mx-1`}
                >
                  <i className="fas fa-info-circle text-lg leading-lg mr-2 w-5 text-center"></i>
                  INFO
                </Link>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md overflow-hidden z-10 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-left invisible group-hover:visible">
                  <Link
                    to="/roles"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-users-cog text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">ROLES</span>
                  </Link>
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-info text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">ABOUT</span>
                  </Link>
                  <Link
                    to="/about/team"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-users text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">TEAM</span>
                  </Link>
                  <Link
                    to="/about/whitepaper"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-file-alt text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">WHITEPAPER</span>
                  </Link>
                  <Link
                    to="/about/contact"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-envelope text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">CONTACT</span>
                  </Link>
                </div>
              </li>
            </ul>
            
            {/* Right side menu items */}
            <ul className="flex flex-wrap list-none items-center">
              <li className="flex items-center relative group">
                <Link
                  to="/governance"
                  className="bg-blueGray-100 hover:bg-blueGray-200 text-blueGray-700 px-3 py-2 flex items-center text-xs uppercase font-bold rounded mx-1 transition-colors duration-200"
                >
                  <i className="fas fa-balance-scale text-lg leading-lg mr-2 w-5 text-center"></i>
                  GOVERNANCE
                </Link>
                <div className="absolute right-0 top-full mt-1 w-56 bg-white shadow-lg rounded-md overflow-hidden z-10 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right invisible group-hover:visible">
                  <Link
                    to="/legal"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-gavel text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">LEGAL</span>
                  </Link>
                  <Link
                    to="/privacy-policy"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-shield-alt text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">PRIVACY POLICY</span>
                  </Link>
                  <Link
                    to="/cookie-policy"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-cookie text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">COOKIE POLICY</span>
                  </Link>
                  <Link
                    to="/privacy-center"
                    className="block px-4 py-2 text-xs uppercase font-medium text-blueGray-700 hover:bg-blueGray-100 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-user-shield text-lg leading-lg mr-2 w-6 text-center flex-shrink-0"></i>
                    <span className="flex-1">PRIVACY CENTER</span>
                  </Link>
                </div>
              </li>
              
              {isAuthenticated ? (
                <>
                  <li className="flex items-center">
                    <Link
                      to="/profile"
                      className="bg-blueGray-100 hover:bg-blueGray-200 text-blueGray-700 px-3 py-2 flex items-center text-xs uppercase font-bold rounded mx-1 transition-colors duration-200"
                    >
                      <i className="fas fa-user text-lg leading-lg mr-2 w-5 text-center"></i>
                      {user?.username || 'PROFILE'}
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <button
                      onClick={handleLogout}
                      className="bg-blueGray-700 text-white active:bg-blueGray-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                      type="button"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> LOGOUT
                    </button>
                  </li>
                </>
              ) : (
                <li className="flex items-center">
                  <Link
                    to="/login"
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mx-1 ease-linear transition-all duration-150"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i> LOGIN
                  </Link>
                </li>
              )}
              
              <li className="flex items-center ml-1">
                <WalletButton />
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="h-24"></div> {/* Spacer to account for fixed navbar */}
    </>
  );
}
