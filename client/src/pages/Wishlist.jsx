import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { API_URL } from "../api.js";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=85";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: "/wishlist" } });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true, state: { from: "/wishlist" } });
        return;
      }
      if (!response.ok) throw new Error(data.message || "We couldn't load your saved stays. Please try again.");
      setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter((item) => item?.property?._id) : []);
    } catch (err) {
      setError(err.message || "Unable to connect to TravelInn. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const removeFromWishlist = async (propertyId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: "/wishlist" } });
      return;
    }
    setRemovingId(propertyId);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${propertyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true, state: { from: "/wishlist" } });
        return;
      }
      if (!response.ok) throw new Error(data.message || "Couldn't remove this stay. Please try again.");
      setWishlist((current) => current.filter((item) => item.property?._id !== propertyId));
    } catch (err) {
      setError(err.message || "Unable to remove this stay right now.");
    } finally {
      setRemovingId("");
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="wishlist-page">
      <div className="container wishlist-container">
        <header className="wishlist-hero">
          <div className="wishlist-hero-copy">
            <p className="section-label">YOUR PERSONAL COLLECTION</p>
            <h1>Saved <span>stays.</span></h1>
            <p className="wishlist-subtitle">Keep the places you love close. Your next memorable getaway starts here.</p>
          </div>
          <div className="wishlist-summary" aria-live="polite">
            <span className="wishlist-summary-number">{wishlist.length.toString().padStart(2, "0")}</span>
            <span className="wishlist-summary-label">{wishlist.length === 1 ? "SAVED STAY" : "SAVED STAYS"}</span>
          </div>
        </header>

        {error && <div className="wishlist-alert" role="alert"><p>{error}</p><button type="button" onClick={fetchWishlist}>Try again</button></div>}

        {wishlist.length === 0 ? (
          <section className="wishlist-empty">
            <div className="wishlist-empty-mark" aria-hidden="true">♡</div>
            <p className="section-label">A LITTLE SPACE FOR SOMETHING SPECIAL</p>
            <h2>Your next favourite stay is out there.</h2>
            <p>Tap the heart on any property to save it here. We’ll keep your shortlist ready for whenever you’re planning.</p>
            <Link to="/properties" className="wishlist-explore-btn">Explore stays <span aria-hidden="true">↗</span></Link>
          </section>
        ) : (
          <>
            <div className="wishlist-list-heading"><p>YOUR SHORTLIST</p><span>Saved for whenever you’re ready</span></div>
            <div className="wishlist-grid">
              {wishlist.map(({ _id, property }) => (
                <article className="wishlist-card" key={_id}>
                  <Link className="wishlist-card-image" to={`/property/${property._id}`} aria-label={`View ${property.title}`}>
                    <img src={property.images?.[0] || FALLBACK_IMAGE} alt={property.title || "Saved property"} loading="lazy" />
                    <span className="wishlist-image-tag">SAVED STAY</span>
                  </Link>
                  <div className="wishlist-card-body">
                    <div className="wishlist-card-location">{[property.location?.city, property.location?.country].filter(Boolean).join(", ") || "Destination details available inside"}</div>
                    <Link to={`/property/${property._id}`} className="wishlist-card-title"><h2>{property.title || "Beautiful stay"}</h2></Link>
                    {property.description && <p className="wishlist-card-description">{property.description}</p>}
                    <div className="wishlist-card-footer">
                      <div className="wishlist-price"><strong>₹{Number(property.price || 0).toLocaleString("en-IN")}</strong><span> / night</span></div>
                      <div className="wishlist-card-actions">
                        <button type="button" className="wishlist-remove-btn" onClick={() => removeFromWishlist(property._id)} disabled={removingId === property._id}>
                          {removingId === property._id ? "Removing…" : "Remove"}
                        </button>
                        <Link to={`/property/${property._id}`} className="wishlist-view-btn">View stay <span aria-hidden="true">↗</span></Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Wishlist;
