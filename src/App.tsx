import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { AppDataProvider, useAppData } from './lib/AppDataContext';
import { ToastProvider } from './lib/ToastContext';

function Shell() {
  const { loading } = useAppData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading ChargeGuide…
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-gray-50 pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AppDataProvider>
  );
}
