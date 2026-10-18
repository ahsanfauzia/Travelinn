import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../api.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password/${encodeURIComponent(token || "")}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not reset password.");
      navigate("/login", { replace: true, state: { notice: "Password updated. Please log in with your new password." } });
    } catch (err) { setError(err.message || "Unable to connect to TravelInn. Please try again."); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-header"><p className="section-label">SECURE YOUR ACCOUNT</p><h1>Create a new password</h1><p>Choose a strong password with at least 8 characters. Reset links expire after 15 minutes.</p></div>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <form onSubmit={submit}><div className="form-group"><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
      <div className="form-group"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
      <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Updating password…" : "Update password"}</button>
    </form>
    <p className="auth-switch"><Link to="/login">Back to login</Link></p>
  </section></main>;
}
