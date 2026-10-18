import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not request a reset link.");
      setMessage(data.message || "If an account exists for that email, a reset link will be sent.");
      if (data.developmentResetUrl) setMessage(`${data.message} Local development reset link: ${data.developmentResetUrl}`);
    } catch (err) { setError(err.message || "Unable to connect to TravelInn. Please try again."); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-header"><p className="section-label">ACCOUNT RECOVERY</p><h1>Forgot password?</h1><p>Enter the email address linked to your TravelInn account and we’ll send reset instructions.</p></div>
    {error && <div className="auth-error" role="alert">{error}</div>}
    {message && <div className="auth-success" role="status">{message}</div>}
    <form onSubmit={submit}><div className="form-group"><label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
      <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Sending instructions…" : "Send reset link"}</button>
    </form>
    <p className="auth-switch"><Link to="/login">Back to login</Link></p>
  </section></main>;
}
