import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../apiService";
import { useStudentSession } from "../context/StudentSessionContext";
import "./student-auth.css";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "MBA", "IT"];

export default function StudentAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, loading, error, login } = useStudentSession();
  const [mode, setMode] = useState("login");
  const redirectPath = searchParams.get("redirect") || "/student-events";

  const [userId, setUserId] = useState("");
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    department: "CSE",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    if (session?.user_id) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, session]);

  const updateField = (key, value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const trimmedUserId = userId.trim();

    if (!trimmedUserId) {
      setLoginError("Student ID is required.");
      return;
    }

    setLoginError("");
    try {
      await login(trimmedUserId);
      navigate(redirectPath, { replace: true });
    } catch {
      // Error text is shown from context.
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const normalizedUserId = formData.user_id.replace(/\s+/g, "").toUpperCase();

    const payload = {
      user_id: normalizedUserId,
      name: formData.name.trim(),
      department: formData.department.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    if (!payload.user_id || !payload.name || !payload.department) {
      setRegisterError("Student ID, Name, and Department are required.");
      return;
    }

    setSubmitting(true);
    setRegisterError("");

    try {
      await apiService.registerStudent(payload);
      await login(payload.user_id);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setRegisterError(err?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-auth-page">
      <div className="student-auth-card">
        <h1>Student Access</h1>
        <p>Login or register, then continue to Student Explorer.</p>

        <div className="student-auth-tabs" role="tablist" aria-label="Student authentication options">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="student-auth-form">
            <label htmlFor="student-login-id">Student ID</label>
            <input
              id="student-login-id"
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Example: U001"
              autoComplete="username"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="student-auth-form">
            <label htmlFor="student-register-id">Student ID</label>
            <input
              id="student-register-id"
              type="text"
              value={formData.user_id}
              onChange={(event) => updateField("user_id", event.target.value)}
              placeholder="Example: U045"
              autoComplete="username"
              pattern="[A-Za-z0-9._-]{3,20}"
              title="3-20 chars. Use letters, numbers, dot, underscore, or hyphen"
            />

            <label htmlFor="student-register-name">Full Name</label>
            <input
              id="student-register-name"
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />

            <label htmlFor="student-register-department">Department</label>
            <select
              id="student-register-department"
              value={formData.department}
              onChange={(event) => updateField("department", event.target.value)}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <label htmlFor="student-register-email">Email (optional)</label>
            <input
              id="student-register-email"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <label htmlFor="student-register-password">Password (optional)</label>
            <input
              id="student-register-password"
              type="password"
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Set a password"
              autoComplete="new-password"
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {mode === "login" && loginError ? <p className="student-auth-error">{loginError}</p> : null}
        {mode === "login" && error ? <p className="student-auth-error">{error}</p> : null}
        {mode === "register" && registerError ? <p className="student-auth-error">{registerError}</p> : null}
      </div>
    </div>
  );
}