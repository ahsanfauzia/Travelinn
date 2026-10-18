import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(readUser);
  const navigate = useNavigate();
  const closeMenu = () => setMenuOpen(false);
  const syncUser = useCallback(() => setUser(readUser()), []);

  useEffect(() => {
    window.addEventListener("storage", syncUser);
    window.addEventListener("travelinn-auth-changed", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("travelinn-auth-changed", syncUser);
    };
  }, [syncUser]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("travelinn-auth-changed"));
    closeMenu();
    navigate("/", { replace: true });
  };

  const accountActions = <>
    <span className="nav-user-label">Hi, {user?.name?.split(" ")[0] || "there"}</span>
    {(user?.role === "host" || user?.role === "admin") && <Link to="/host/dashboard" onClick={closeMenu}>Host dashboard</Link>}
    {user?.role === "admin" && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
    <button type="button" className="login-btn nav-logout" onClick={logout}>Log out</button>
  </>;

  const guestActions = <>
    <Link to="/login" className="login-btn" onClick={closeMenu}>Log in</Link>
    <Link to="/register" className="signup-btn" onClick={closeMenu}>Get started <span aria-hidden="true">↗</span></Link>
  </>;

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo" onClick={closeMenu} aria-label="TravelInn home">Travel<span>Inn</span><i aria-hidden="true">.</i></Link>
        <button type="button" className={`mobile-menu-toggle ${menuOpen ? "is-open" : ""}`} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
        <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/properties" onClick={closeMenu}>Explore stays</NavLink>
          {user && <NavLink to="/wishlist" onClick={closeMenu}>Wishlist</NavLink>}
          {user && <NavLink to="/my-bookings" onClick={closeMenu}>My bookings</NavLink>}
          <div className="mobile-nav-actions">{user ? accountActions : guestActions}</div>
        </div>
        <div className="nav-actions">{user ? accountActions : guestActions}</div>
      </div>
    </nav>
  );
}

export default Navbar;
