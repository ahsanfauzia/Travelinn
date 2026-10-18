import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchBookings = async () => {
    const token =
      localStorage.getItem("token");

    try {
      const response = await fetch(
        API_URL + "/api/admin/bookings",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch bookings"
        );
      }

      setBookings(
        data.bookings
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const updateStatus =
    async (id, status) => {
      const token =
        localStorage.getItem("token");

      try {
        const response =
          await fetch(
            `${API_URL}/api/admin/bookings/${id}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                status,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update booking"
          );
        }

        setBookings(
          (current) =>
            current.map(
              (booking) =>
                booking._id === id
                  ? {
                      ...booking,
                      status,
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
    <main className="admin-page">

      <div className="container">

        <div className="admin-header">

          <div>
            <p className="section-label">
              ADMIN
            </p>

            <h1>
              Bookings
            </h1>
          </div>

        </div>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  Property
                </th>

                <th>
                  Guest
                </th>

                <th>
                  Dates
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {bookings.map(
                (booking) => (
                  <tr
                    key={booking._id}
                  >

                    <td>
                      {
                        booking
                          .property
                          ?.title
                      }
                    </td>

                    <td>
                      {
                        booking
                          .user
                          ?.name
                      }
                    </td>

                    <td>
                      {new Date(
                        booking.checkIn
                      ).toLocaleDateString()}
                      {" - "}
                      {new Date(
                        booking.checkOut
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      ₹
                      {
                        booking.totalPrice
                      }
                    </td>

                    <td>
                      <span
                        className={`booking-status ${booking.status}`}
                      >
                        {
                          booking.status
                        }
                      </span>
                    </td>

                    <td>

                      {booking.status ===
                        "confirmed" && (
                        <button
                          className="admin-cancel-btn"
                          onClick={() =>
                            updateStatus(
                              booking._id,
                              "cancelled"
                            )
                          }
                        >
                          Cancel
                        </button>
                      )}

                      {booking.status ===
                        "confirmed" && (
                        <button
                          className="admin-complete-btn"
                          onClick={() =>
                            updateStatus(
                              booking._id,
                              "completed"
                            )
                          }
                        >
                          Complete
                        </button>
                      )}

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}

export default AdminBookings;