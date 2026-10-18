import { API_URL } from "../api.js";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Loader from "../components/Loader";

const fallbackImage =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1400&q=85";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/properties/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch property"
          );
        }

        setProperty(data.property);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token || !id) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/wishlist/check/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setIsWishlisted(Boolean(data.isWishlisted));
        }
      } catch (error) {
        console.error("Wishlist check error:", error);
      }
    };

    checkWishlist();
  }, [id]);

  const handleWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);
    setError("");

    try {
      if (isWishlisted) {
        const response = await fetch(
          `${API_URL}/api/wishlist/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to remove from wishlist"
          );
        }

        setIsWishlisted(false);
      } else {
        const response = await fetch(
          API_URL + "/api/wishlist",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              propertyId: id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to add to wishlist"
          );
        }

        setIsWishlisted(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && !property) {
    return (
      <div className="page-title">
        <h1>{error}</h1>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page-title">
        <h1>Property not found</h1>
      </div>
    );
  }

  const images = property.images || [];

  const getImage = (index) => {
    return images[index] || fallbackImage;
  };

  return (
    <main className="property-details-page">
      <div className="container">

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        <div className="property-details-header">

          <div>
            <h1>{property.title}</h1>

            <div className="property-meta">
              <span>
                ★ {property.rating || "New"}
              </span>

              <span>
                {property.reviewsCount || 0} reviews
              </span>

              <span>
                {property.location?.city},{" "}
                {property.location?.country}
              </span>
            </div>
          </div>

          <div className="property-actions">

            <button type="button">
              Share
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading
                ? "Saving..."
                : isWishlisted
                ? "♥ Saved"
                : "♡ Save"}
            </button>

          </div>
        </div>

        <div className="image-gallery">

          <div className="gallery-main">
            <img
              src={getImage(0)}
              alt={property.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>

          <div className="gallery-side">

            <img
              src={getImage(1)}
              alt={property.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />

            <img
              src={getImage(2)}
              alt={property.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />

          </div>

          <div className="gallery-side">

            <img
              src={getImage(3)}
              alt={property.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />

            <div className="last-image">

              <img
                src={getImage(4)}
                alt={property.title}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />

              <button
                type="button"
                className="view-all-images"
              >
                View all photos
              </button>

            </div>

          </div>
        </div>

        <div className="property-content">

          <section className="property-main-info">

            <div className="host-section">

              <div>
                <h2>
                  Entire {property.propertyType} hosted by{" "}
                  {property.host?.name || "Host"}
                </h2>

                <p>
                  {property.guests} guests ·{" "}
                  {property.bedrooms} bedrooms ·{" "}
                  {property.beds} beds ·{" "}
                  {property.bathrooms} bathrooms
                </p>
              </div>

              <div className="host-avatar">
                {(property.host?.name || "H").charAt(0)}
              </div>

            </div>

            <div className="info-divider" />

            <div className="description-section">

              <h2>About this place</h2>

              <p>
                {property.description}
              </p>

            </div>

            <div className="info-divider" />

            <div className="amenities-section">

              <h2>What this place offers</h2>

              <div className="amenities-grid">

                {property.amenities?.map((amenity) => (
                  <div
                    className="amenity"
                    key={amenity}
                  >
                    <span>✓</span>
                    {amenity}
                  </div>
                ))}

              </div>

            </div>

          </section>

          <aside className="booking-card">

            <div className="booking-price">

              <strong>
                ₹{property.price}
              </strong>

              <span>
                / night
              </span>

            </div>

            <div className="booking-rating">
              ★ {property.rating || "New"} ·{" "}
              {property.reviewsCount || 0} reviews
            </div>

            <div className="booking-inputs">

              <div className="booking-input">

                <label>
                  CHECK-IN
                </label>

                <input
                  type="date"
                  disabled
                />

              </div>

              <div className="booking-input">

                <label>
                  CHECK-OUT
                </label>

                <input
                  type="date"
                  disabled
                />

              </div>

              <div className="booking-input full">

                <label>
                  GUESTS
                </label>

                <select
                  defaultValue="1"
                  disabled
                >
                  <option value="1">
                    1 guest
                  </option>

                  <option value="2">
                    2 guests
                  </option>

                  <option value="3">
                    3 guests
                  </option>

                  <option value="4">
                    4 guests
                  </option>

                  <option value="5">
                    5+ guests
                  </option>
                </select>

              </div>

            </div>

            <Link
              to={`/booking/${property._id}`}
              className="reserve-btn"
            >
              Reserve
            </Link>

            <p className="booking-note">
              You won't be charged yet
            </p>

            <div className="price-breakdown">

              <div>
                <span>
                  ₹{property.price} × 1 night
                </span>

                <span>
                  ₹{property.price}
                </span>
              </div>

              <div>
                <span>
                  Service fee
                </span>

                <span>
                  ₹500
                </span>
              </div>

              <div className="total-price">

                <strong>
                  Total
                </strong>

                <strong>
                  ₹{Number(property.price) + 500}
                </strong>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}

export default PropertyDetails;

