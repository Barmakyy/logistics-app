import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaTruck,
  FaUsers,
  FaUserSecret,
  FaCreditCard,
  FaEnvelope,
  FaCog,
  FaBars,
  FaTimes,
  FaSearch,
  FaBell,
  FaUserCircle,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const sidebarVariants = {
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  closed: {
    x: '-100%',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const navItems = [
  { to: '/admin/dashboard', icon: <FaTachometerAlt />, text: 'Dashboard' },
  { to: '/admin/dashboard/shipments', icon: <FaTruck />, text: 'Shipments' },
  { to: '/admin/dashboard/customers', icon: <FaUsers />, text: 'Customers' },
  { to: '/admin/dashboard/agents', icon: <FaUserSecret />, text: 'Agents' },
  { to: '/admin/dashboard/payments', icon: <FaCreditCard />, text: 'Payments' },
  { to: '/admin/dashboard/messages', icon: <FaEnvelope />, text: 'Messages' },
  { to: '/admin/dashboard/settings', icon: <FaCog />, text: 'Settings' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    // This effect should only run on route changes, not when the sidebar is opened.
    // It closes the sidebar on mobile when the user navigates.
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname, setIsOpen]);

  const NavItem = ({ to, icon, text }) => (
    <NavLink
      to={to}
      end={to === '/admin/dashboard'}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 rounded-lg transition-colors ${
          isActive
            ? 'bg-accent text-primary'
            : 'text-gray-300 hover:bg-primary-dark hover:text-white'
        }`
      }
    >
      <span className="mr-4 text-xl">{icon}</span>
      <span className="font-medium">{text}</span>
    </NavLink>
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 bg-primary text-white w-64 space-y-6 py-7 px-2 z-40 transform lg:translate-x-0 lg:static lg:inset-0"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Link to="/" className="text-white text-2xl font-bold px-4">
          Bongo<span className="text-accent">Express</span>
        </Link>

        <nav>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="px-4 absolute bottom-4 w-full">
          <button onClick={handleLogout} className="w-full text-left flex items-center p-3 rounded-lg transition-colors text-gray-300 hover:bg-primary-dark hover:text-white">
            <span className="mr-4 text-xl"><FaCog /></span><span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

const TopNavbar = ({ isSidebarOpen, setIsSidebarOpen }) => (
  <header className="bg-white shadow-sm p-4 flex justify-between items-center">
    {/* Hamburger Menu for mobile */}
    <button
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      className="text-gray-500 focus:outline-none lg:hidden"
    >
      {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
    </button>

    {/* Search Bar */}
    <div className="relative hidden md:block">
      <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search shipments, customers..."
        className="bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary border border-gray-200 rounded-full py-2 pl-10 pr-4 w-80 transition-all"
      />
    </div>

    {/* Right-side icons and profile */}
    <div className="flex items-center space-x-6">
      <button className="text-gray-500 hover:text-primary">
        <FaBell size={22} />
      </button>
      <div className="relative">
        <button className="flex items-center space-x-2">
          <FaUserCircle size={28} className="text-gray-600" />
          <span className="hidden md:inline font-medium text-gray-700">Admin</span>
        </button>
        {/* Dropdown would go here */}
      </div>
    </div>
  </header>
);

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;