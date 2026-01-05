import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAuth } from "../auth/auth";
import { useMe } from "../auth/useMe";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaShoppingCart,
  FaPlus,
  FaUsers,
  FaClipboardList,
  FaBell,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaHome,
  FaCog,
  FaChartBar,
  FaStore,
  FaBoxOpen,
  FaUserShield,
  FaSearch,
  FaTachometerAlt,
  FaSun,
  FaMoon,
  FaQuestionCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const { me, loading } = useMe();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const userDropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    clearAuth();
    nav("/login");
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "from-purple-500 to-pink-500";
      case "MANAGER":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-indigo-500 to-blue-500";
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || !me) return null;

  const headerBg = scrollPosition > 10 
    ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
    : "bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-gray-900 dark:to-gray-800";

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left: Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>

              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <FaStore className="text-white text-lg" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    OrderFlow
                  </h1>
                  <p className="text-xs text-white/75">
                    Professional Management
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
                { to: "/orders", label: "Orders", icon: <FaShoppingCart /> },
                { to: "/orders/new", label: "Create", icon: <FaPlus /> },
                ...(me.role === "ADMIN" ? [
                  { to: "/admin/users", label: "Users", icon: <FaUsers /> },
                  { to: "/admin/orders", label: "All Orders", icon: <FaClipboardList /> },
                ] : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.to
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: User Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                <FaSearch />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* Notifications */}
              {me.role === "ADMIN" && (
                <Link
                  to="/admin/notifications"
                  className="relative p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <FaBell />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 p-1 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white">
                      {me.fullName.split(' ')[0]}
                    </p>
                    <p className="text-xs text-white/75">
                      {me.role}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${getRoleColor(me.role)}`}
                  >
                    {getUserInitials(me.fullName)}
                  </div>
                  <FaChevronDown className={`transition-transform duration-200 text-white/80 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg bg-gradient-to-r ${getRoleColor(me.role)}`}
                          >
                            {getUserInitials(me.fullName)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {me.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {me.email}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                              me.role === "ADMIN" 
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : me.role === "MANAGER"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}>
                              {me.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <FaUserCircle />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <FaCog />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <FaQuestionCircle />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                        <button
                          onClick={logout}
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 font-medium"
                        >
                          <FaSignOutAlt />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-50"
          >
            <div className="h-full flex flex-col">
              {/* Mobile Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <FaStore className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">OrderFlow</h2>
                      <p className="text-xs text-white/75">Mobile Menu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-white/80 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[
                  { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
                  { to: "/orders", label: "My Orders", icon: <FaShoppingCart /> },
                  { to: "/orders/new", label: "Create Order", icon: <FaPlus /> },
                  { to: "/products", label: "Products", icon: <FaBoxOpen /> },
                  ...(me.role === "ADMIN" ? [
                    { to: "/admin/dashboard", label: "Admin Panel", icon: <FaUserShield /> },
                    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
                    { to: "/admin/orders", label: "All Orders", icon: <FaClipboardList /> },
                    { to: "/admin/notifications", label: "Notifications", icon: <FaBell /> },
                    { to: "/admin/analytics", label: "Analytics", icon: <FaChartBar /> },
                  ] : []),
                  { to: "/profile", label: "Profile", icon: <FaUserCircle /> },
                  { to: "/settings", label: "Settings", icon: <FaCog /> },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === item.to
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 font-medium"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -50, scale: 0.95 }}
              className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, products, users..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}