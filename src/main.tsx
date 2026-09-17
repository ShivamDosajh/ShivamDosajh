import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './pages/Home';
import Sessions from './pages/Sessions';
import CustomerDetail from './pages/CustomerDetail';
import SessionRunner from './pages/SessionRunner';
import Earnings from './pages/Earnings';
import Guide from './pages/Guide';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sessions', element: <Sessions /> },
      { path: 'customer/:id', element: <CustomerDetail /> },
      { path: 'run/:id', element: <SessionRunner /> },
      { path: 'earnings', element: <Earnings /> },
      { path: 'guide', element: <Guide /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
