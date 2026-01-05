import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useMe } from "../auth/useMe";
import {
  FaShoppingCart,
  FaPlusCircle,
  FaUsers,
  FaClipboardList,
  FaBell,
  FaChartBar,
  FaCog,
  FaHome,
  FaBoxOpen,
  FaUserShield,
  FaStore,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaFileInvoiceDollar,
  FaHistory,
  FaShieldAlt,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaSearch
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { clearAuth } from "../auth/auth";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { me, loading } = useMe();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function logout() {
    clearAuth();
    navigate("/login");
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

  if (loading || !me) return null;

  const SidebarItem = ({ to, label, icon, badge }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          }`
        }
      >
        <div className="relative">
          <span className="text-lg">{icon}</span>
          {badge && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
        
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
            {label}
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <FaChevronRight className={`transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''} dark:text-white`} />
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "5rem" : "16rem",
          x: isMobileMenuOpen || window.innerWidth >= 768 ? 0 : -300
        }}
        transition={{ type: "spring", damping: 25 }}
        className={`fixed md:relative h-screen bg-white dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-800 shadow-lg z-40`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isHovered) ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
                  <FaStore className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    OrderFlow
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
                </div>
              </motion.div>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
                <FaStore className="text-white text-lg" />
              </div>
            )}
            
            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isCollapsed ? (
                <FaChevronRight className="text-gray-600 dark:text-gray-300" />
              ) : (
                <FaChevronLeft className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${getRoleColor(me.role)}`}>
                {me.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-w-0"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {me.fullName}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    me.role === "ADMIN" 
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : me.role === "MANAGER"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}>
                    {me.role}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          {/* Quick Actions */}
          <div className="mb-6">
            <div className={`flex items-center gap-2 px-4 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
              {!isCollapsed && (
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Navigation
                </span>
              )}
            </div>
            <div className="space-y-2">
              <SidebarItem
                to="/dashboard"
                label="Dashboard"
                icon={<FaTachometerAlt />}
              />
              <SidebarItem
                to="/orders"
                label="My Orders"
                icon={<FaShoppingCart />}
              />
              <SidebarItem
                to="/orders/new"
                label="Create Order"
                icon={<FaPlusCircle />}
              />
              <SidebarItem
                to="/products"
                label="Products"
                icon={<FaBoxOpen />}
              />
            </div>
          </div>

          {/* Admin Section */}
          {me.role === "ADMIN" && (
            <div className="mb-6">
              <div className={`flex items-center gap-2 px-4 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
                {!isCollapsed && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Administration
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <SidebarItem
                  to="/admin/dashboard"
                  label="Admin Dashboard"
                  icon={<FaUserShield />}
                />
                <SidebarItem
                  to="/admin/orders"
                  label="All Orders"
                  icon={<FaClipboardList />}
                />
                <SidebarItem
                  to="/admin/users"
                  label="User Management"
                  icon={<FaUsers />}
                />
                <SidebarItem
                  to="/admin/notifications"
                  label="Notifications"
                  icon={<FaBell />}
                  badge={true}
                />
                <SidebarItem
                  to="/admin/analytics"
                  label="Analytics"
                  icon={<FaChartBar />}
                />
              </div>
            </div>
          )}

          {/* Account Section */}
          <div className="mb-6">
            <div className={`flex items-center gap-2 px-4 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
              {!isCollapsed && (
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Account
                </span>
              )}
            </div>
            <div className="space-y-2">
              <SidebarItem
                to="/profile"
                label="My Profile"
                icon={<FaUserCircle />}
              />
              <SidebarItem
                to="/settings"
                label="Settings"
                icon={<FaCog />}
              />
              <SidebarItem
                to="/help"
                label="Help & Support"
                icon={<FaQuestionCircle />}
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200`}
          >
            <div className="flex items-center gap-3">
              {darkMode ? <FaSun /> : <FaMoon />}
              {!isCollapsed && <span className="font-medium">Theme</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
                {darkMode ? "Light" : "Dark"}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <FaSignOutAlt />
              {!isCollapsed && <span className="font-medium">Sign Out</span>}
            </div>
          </button>

          {/* Version Info */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">v2.1.0</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                © 2024 OrderFlow
              </p>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Close Button */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <FaChevronLeft className="text-gray-700 dark:text-gray-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}