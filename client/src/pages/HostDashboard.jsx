import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function HostDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        API_URL + "/api/host/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch dashboard"
        );
      }

      setDashboard(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const deleteProperty = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/properties/${propertyId}`,
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
          data.message || "Failed to delete property"
        );
      }

      await fetchDashboard();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="host-dashboard">
      <div className="container">

        <div className="dashboard-header">

          <div>
            <p className="section-label">
              HOST
            </p>

            <h1>
              Host dashboard
            </h1>
          </div>

          <Link
            to="/host/add-property"
            className="reserve-btn"
          >
            Add property
          </Link>

        </div>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        {dashboard && (
          <>
            <div className="dashboard-stats">

              <div className="dashboard-stat">
                <span>
                  Properties
                </span>

                <strong>
                  {dashboard.stats.totalProperties}
                </strong>
              </div>

              <div className="dashboard-stat">
                <span>
                  Bookings
                </span>

                <strong>
                  {dashboard.stats.totalBookings}
                </strong>
              </div>

              <div className="dashboard-stat">
                <span>
                  Confirmed
                </span>

                <strong>
                  {dashboard.stats.confirmedBookings}
                </strong>
              </div>

              <div className="dashboard-stat">
                <span>
                  Revenue
                </span>

                <strong>
                  ₹{dashboard.stats.totalRevenue}
                </strong>
              </div>

            </div>

            <section className="dashboard-section">

              <div className="dashboard-section-header">

                <h2>
                  Your properties
                </h2>

                <Link
                  to="/host/add-property"
                  className="text-link"
                >
                  Add new
                </Link>

              </div>

              {dashboard.properties.length === 0 ? (
                <div className="empty-state">

                  <h3>
                    No properties yet
                  </h3>

                  <p>
                    Add your first property to start hosting.
                  </p>

                </div>
              ) : (
                <div className="dashboard-property-list">

                  {dashboard.properties.map(
                    (property) => (
                      <div
                        className="dashboard-property"
                        key={property._id}
                      >

                        <img
                          src={property.images?.[0]}
                          alt={property.title}
                        />

                        <div>

                          <h3>
                            {property.title}
                          </h3>

                          <p>
                            {property.location?.city},{" "}
                            {property.location?.country}
                          </p>

                          <strong>
                            ₹{property.price} / night
                          </strong>

                          <div className="property-management-actions">

                            <Link
                              to={`/host/edit-property/${property._id}`}
                              className="edit-property-btn"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="delete-property-btn"
                              onClick={() =>
                                deleteProperty(property._id)
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            <section className="dashboard-section">

              <h2>
                Recent bookings
              </h2>

              {dashboard.bookings.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No bookings received yet.
                  </p>
                </div>
              ) : (
                <div className="host-bookings">

                  {dashboard.bookings.map(
                    (booking) => (
                      <div
                        className="host-booking"
                        key={booking._id}
                      >

                        <div>

                          <strong>
                            {booking.property?.title}
                          </strong>

                          <p>
                            Guest:{" "}
                            {booking.user?.name}
                          </p>

                          <p>
                            {new Date(
                              booking.checkIn
                            ).toLocaleDateString()}{" "}
                            -
                            {" "}
                            {new Date(
                              booking.checkOut
                            ).toLocaleDateString()}
                          </p>

                        </div>

                        <div>

                          <strong>
                            ₹{booking.totalPrice}
                          </strong>

                          <span
                            className={`booking-status ${booking.status}`}
                          >
                            {booking.status}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

          </>
        )}

      </div>
    </main>
  );
}

export default HostDashboard;