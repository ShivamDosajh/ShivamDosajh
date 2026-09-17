import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Appointment, Charge, Config, Customer, Feedback, Session } from '../types';
import { loadAppData, resetDemoData, saveFeedback, saveSessions } from './store';

interface AppDataContextValue {
  loading: boolean;
  config: Config | null;
  customers: Customer[];
  sessions: Session[];
  feedback: Feedback[];
  getCustomer: (id: string) => Customer | undefined;
  getSession: (id: string) => Session | undefined;
  getFeedback: (id: string) => Feedback | undefined;
  scheduleAppointment: (customerId: string, appointment: Appointment) => void;
  startSession: (customerId: string) => void;
  toggleChecklistItem: (customerId: string, itemId: string, checked: boolean) => void;
  setCurrentStep: (customerId: string, step: number) => void;
  setCharge: (customerId: string, charge: Charge) => void;
  completeSession: (customerId: string) => void;
  resetAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<Config | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    loadAppData().then((data) => {
      setConfig(data.config);
      setCustomers(data.customers);
      setSessions(data.sessions);
      setFeedback(data.feedback);
      setLoading(false);
    });
  }, []);

  const updateSessions = useCallback((updater: (prev: Session[]) => Session[]) => {
    setSessions((prev) => {
      const next = updater(prev);
      saveSessions(next);
      return next;
    });
  }, []);

  const getCustomer = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);
  const getSession = useCallback((id: string) => sessions.find((s) => s.customerId === id), [sessions]);
  const getFeedback = useCallback((id: string) => feedback.find((f) => f.customerId === id), [feedback]);

  const scheduleAppointment = useCallback(
    (customerId: string, appointment: Appointment) => {
      updateSessions((prev) =>
        prev.map((s) =>
          s.customerId === customerId ? { ...s, appointment, status: 'SCHEDULED' } : s
        )
      );
    },
    [updateSessions]
  );

  const startSession = useCallback(
    (customerId: string) => {
      updateSessions((prev) =>
        prev.map((s) =>
          s.customerId === customerId && s.status !== 'COMPLETED'
            ? { ...s, status: 'IN_PROGRESS' }
            : s
        )
      );
    },
    [updateSessions]
  );

  const toggleChecklistItem = useCallback(
    (customerId: string, itemId: string, checked: boolean) => {
      updateSessions((prev) =>
        prev.map((s) =>
          s.customerId === customerId
            ? { ...s, checklist: { ...s.checklist, [itemId]: checked } }
            : s
        )
      );
    },
    [updateSessions]
  );

  const setCurrentStep = useCallback(
    (customerId: string, step: number) => {
      updateSessions((prev) =>
        prev.map((s) => (s.customerId === customerId ? { ...s, currentStep: step } : s))
      );
    },
    [updateSessions]
  );

  const setCharge = useCallback(
    (customerId: string, charge: Charge) => {
      updateSessions((prev) =>
        prev.map((s) => (s.customerId === customerId ? { ...s, charge } : s))
      );
    },
    [updateSessions]
  );

  const completeSession = useCallback(
    (customerId: string) => {
      updateSessions((prev) =>
        prev.map((s) =>
          s.customerId === customerId
            ? { ...s, status: 'COMPLETED', completedAt: new Date().toISOString() }
            : s
        )
      );
    },
    [updateSessions]
  );

  const resetAll = useCallback(async () => {
    setLoading(true);
    const data = await resetDemoData();
    setConfig(data.config);
    setCustomers(data.customers);
    setSessions(data.sessions);
    setFeedback(data.feedback);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) saveFeedback(feedback);
  }, [feedback, loading]);

  return (
    <AppDataContext.Provider
      value={{
        loading,
        config,
        customers,
        sessions,
        feedback,
        getCustomer,
        getSession,
        getFeedback,
        scheduleAppointment,
        startSession,
        toggleChecklistItem,
        setCurrentStep,
        setCharge,
        completeSession,
        resetAll,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
