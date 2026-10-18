import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          API_URL + "/api/bookings/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch bookings"
          );
        }

        setBookings(data.bookings || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const cancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Cancellation failed"
        );
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: "cancelled",
              }
            : booking
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="my-bookings-page">
      <div className="container">

        <div className="properties-page-header">
          <p className="section-label">
            TRAVEL
          </p>

          <h1>
            My bookings
          </h1>
        </div>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="empty-state">
            <h2>
              No bookings yet
            </h2>

            <p>
              Find a beautiful stay and start your next trip.
            </p>

            <Link
              to="/properties"
              className="reserve-btn booking-empty-btn"
            >
              Explore stays
            </Link>
          </div>
        )}

        <div className="bookings-list">

          {bookings.map((booking) => {
            const image =
              booking.property?.images?.[0];

            return (
              <div
                className="booking-list-card"
                key={booking._id}
              >

                {image && (
                  <img
                    src={image}
                    alt={booking.property?.title || "Property"}
                  />
                )}

                <div className="booking-list-info">

                  <h2>
                    {booking.property?.title}
                  </h2>

                  <p>
                    {booking.property?.location?.city},{" "}
                    {booking.property?.location?.country}
                  </p>

                  <div className="booking-dates">

                    <span>
                      <strong>
                        Check-in
                      </strong>

                      {new Date(
                        booking.checkIn
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      <strong>
                        Check-out
                      </strong>

                      {new Date(
                        booking.checkOut
                      ).toLocaleDateString()}
                    </span>

                  </div>

                  <p>
                    {booking.guests} guests ·{" "}
                    {booking.nights} nights
                  </p>

                  <strong>
                    ₹{booking.totalPrice}
                  </strong>

                </div>

                <div className="booking-list-actions">

                  <span
                    className={`booking-status ${booking.status}`}
                  >
                    {booking.status}
                  </span>

                  {booking.status === "pending" && (
                    <button
                      type="button"
                      className="reserve-btn"
                      onClick={() =>
                        navigate(`/payment/${booking._id}`)
                      }
                    >
                      Pay Now
                    </button>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      type="button"
                      onClick={() =>
                        cancelBooking(booking._id)
                      }
                    >
                      Cancel
                    </button>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </main>
  );
}

export default MyBookings;