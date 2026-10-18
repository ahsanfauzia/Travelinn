import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");

  const image =
    property.images?.[0] ||
    "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=80";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !property?._id) return;

    const checkWishlist = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/wishlist/check/${property._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setIsWishlisted(Boolean(data.isWishlisted));
        }
      } catch (error) {
        console.error("Wishlist check error:", error);
      }
    };

    checkWishlist();
  }, [property?._id]);

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistMessage("");

    try {
      const response = await fetch(
        isWishlisted
          ? `${API_URL}/api/wishlist/${property._id}`
          : API_URL + "/api/wishlist",
        {
          method: isWishlisted ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          ...(isWishlisted
            ? {}
            : { body: JSON.stringify({ propertyId: property._id }) }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("travelinn-auth-changed"));
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Wishlist update failed");
      }

      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Wishlist update error:", error);
      setWishlistMessage(error.message || "Could not update wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="property-card">
      <div className="property-image">
        <img src={image} alt={property.title} />

        <button
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          disabled={wishlistLoading}
          onClick={handleWishlist}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
        {wishlistMessage && <span className="wishlist-card-message" role="status">{wishlistMessage}</span>}
      </div>

      <div className="property-info">
        <div className="property-title-row">
          <h3>{property.title}</h3>
          <span>★ {property.rating || "New"}</span>
        </div>

        <p className="location">
          {property.location?.city}, {property.location?.country}
        </p>

        <p className="description">{property.description}</p>

        <div className="property-bottom">
          <div>
            <strong>₹{property.price}</strong>
            <span> / night</span>
          </div>

          <Link to={`/property/${property._id}`} className="view-btn">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
