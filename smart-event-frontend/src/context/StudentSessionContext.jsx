import { createContext, useContext, useMemo, useState } from "react";
import { apiService } from "../apiService";

const STORAGE_KEY = "student_session";

const StudentSessionContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function StudentSessionProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const result = await apiService.createStudentSession(userId);
      const nextSession = result.session || null;
      setSession(nextSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return nextSession;
    } catch (err) {
      setError("Invalid student ID or server unavailable.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ session, loading, error, login, logout }), [session, loading, error]);

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession() {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) {
    throw new Error("useStudentSession must be used inside StudentSessionProvider");
  }
  return ctx;
}
