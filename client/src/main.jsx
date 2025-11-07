import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import Shipments from './pages/Shipments.jsx';
import Customers from './pages/Customers.jsx';
import Agents from './pages/Agents.jsx';
import Payments from './pages/Payments.jsx';
import Settings from './pages/Settings.jsx';
import Messages from './pages/Messages.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import CustomerDashboardOverview from './pages/CustomerDashboardOverview.jsx';
import CustomerPayments from './pages/CustomerPayments.jsx';
import ShipmentTracker from './pages/ShipmentTracker.jsx';
import CustomerShipments from './pages/CustomerShipments.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'admin/dashboard',
        element: <AdminDashboard />,
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'shipments', element: <Shipments /> },
          { path: 'customers', element: <Customers /> },
          { path: 'agents', element: <Agents /> },
          { path: 'payments', element: <Payments /> },
          { path: 'settings', element: <Settings /> },
          { path: 'messages', element: <Messages /> },
        ],
      },
      {
        path: 'customer/dashboard',
        element: <CustomerDashboard />,
        children: [
          { index: true, element: <CustomerDashboardOverview /> },
          { path: 'shipments', element: <CustomerShipments /> },
          { path: 'payments', element: <CustomerPayments /> },
          { path: 'shipments/:id/track', element: <ShipmentTracker /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>,
);
