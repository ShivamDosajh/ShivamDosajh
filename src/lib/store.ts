import type { Config, Customer, Feedback, Session } from '../types';

const KEYS = {
  customers: 'cg_customers',
  sessions: 'cg_sessions',
  feedback: 'cg_feedback',
  config: 'cg_config',
  seeded: 'cg_seeded',
};

export interface AppData {
  config: Config;
  customers: Customer[];
  sessions: Session[];
  feedback: Feedback[];
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(import.meta.env.BASE_URL + path);
  return res.json();
}

async function loadSeed(): Promise<AppData> {
  const [config, customers, sessions, feedback] = await Promise.all([
    fetchJson<Config>('data/config.json'),
    fetchJson<Customer[]>('data/customers.json'),
    fetchJson<Session[]>('data/sessions.json'),
    fetchJson<Feedback[]>('data/feedback.json'),
  ]);
  return { config, customers, sessions, feedback };
}

function save(data: AppData) {
  localStorage.setItem(KEYS.config, JSON.stringify(data.config));
  localStorage.setItem(KEYS.customers, JSON.stringify(data.customers));
  localStorage.setItem(KEYS.sessions, JSON.stringify(data.sessions));
  localStorage.setItem(KEYS.feedback, JSON.stringify(data.feedback));
  localStorage.setItem(KEYS.seeded, '1');
}

function readLocal(): AppData | null {
  const seeded = localStorage.getItem(KEYS.seeded);
  if (!seeded) return null;
  try {
    return {
      config: JSON.parse(localStorage.getItem(KEYS.config)!),
      customers: JSON.parse(localStorage.getItem(KEYS.customers)!),
      sessions: JSON.parse(localStorage.getItem(KEYS.sessions)!),
      feedback: JSON.parse(localStorage.getItem(KEYS.feedback)!),
    };
  } catch {
    return null;
  }
}

export async function loadAppData(): Promise<AppData> {
  const local = readLocal();
  if (local) return local;
  const seed = await loadSeed();
  save(seed);
  return seed;
}

export async function resetDemoData(): Promise<AppData> {
  localStorage.removeItem(KEYS.seeded);
  const seed = await loadSeed();
  save(seed);
  return seed;
}

export function saveSessions(sessions: Session[]) {
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}

export function saveFeedback(feedback: Feedback[]) {
  localStorage.setItem(KEYS.feedback, JSON.stringify(feedback));
}
