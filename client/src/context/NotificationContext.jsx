import React, { createContext, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const NotificationContext = createContext();

const notificationVariants = {
  initial: { opacity: 0, y: -50, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.8 },
};

const icons = {
  success: <FaCheckCircle className="text-green-500" size={24} />,
  error: <FaExclamationCircle className="text-red-500" size={24} />,
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed top-5 right-5 z-100 p-4 rounded-lg shadow-lg bg-white flex items-center border-l-4"
            style={{ borderColor: notification.type === 'success' ? '#48bb78' : '#f56565' }}
          >
            {icons[notification.type]}
            <p className="ml-3 text-gray-700">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);