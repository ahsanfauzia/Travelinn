import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loader from "../components/Loader";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=85";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [error, setError] = useState("");

  const today = new Date()
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error(
            "Property ID is missing."
          );
        }

        const response = await fetch(
          `${API_URL}/api/properties/${id}`
        );

        const data = await response.json();

        console.log(
          "Booking property response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch property."
          );
        }

        if (!data.property) {
          throw new Error(
            "Property data was not returned by the server."
          );
        }

        setProperty(data.property);
      } catch (error) {
        console.error(
          "Booking property error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const startDate =
      new Date(checkIn);

    const endDate =
      new Date(checkOut);

    const difference =
      endDate.getTime() -
      startDate.getTime();

    const nights = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    return nights > 0 ? nights : 0;
  };

  const nights =
    calculateNights();

  const pricePerNight =
    Number(property?.price) || 0;

  const subtotal =
    pricePerNight * nights;

  const serviceFee =
    Math.round(subtotal * 0.1);

  const total =
    subtotal + serviceFee;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!checkIn) {
      setError(
        "Please select your check-in date."
      );
      return;
    }

    if (!checkOut) {
      setError(
        "Please select your check-out date."
      );
      return;
    }

    if (nights <= 0) {
      setError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (
      property?.guests &&
      Number(guests) >
        Number(property.guests)
    ) {
      setError(
        `This property allows maximum ${property.guests} guests.`
      );
      return;
    }

    try {
      setBookingLoading(true);

      const response = await fetch(
        API_URL + "/api/bookings",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            propertyId: id,
            checkIn,
            checkOut,
            guests: Number(guests),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Create booking response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create booking."
        );
      }

      const bookingId =
        data.booking?._id ||
        data.booking?.id ||
        data._id;

      if (!bookingId) {
        throw new Error(
          "Booking was created, but booking ID was not returned."
        );
      }

      navigate(
        `/payment/${bookingId}`
      );
    } catch (error) {
      console.error(
        "Booking creation error:",
        error
      );

      setError(
        error.message
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!property) {
    return (
      <main className="page-title">
        <div className="container">

          <h1>
            {error ||
              "Property not found"}
          </h1>

          <button
            type="button"
            className="reserve-btn"
            onClick={() =>
              navigate("/properties")
            }
          >
            Back to properties
          </button>

        </div>
      </main>
    );
  }

  const propertyImage =
    property.images?.[0] ||
    FALLBACK_IMAGE;

  return (
    <main className="booking-page">

      <div className="container">

        <div className="booking-layout">

          <section className="booking-form-card">

            <div className="booking-header">

              <p className="section-label">
                RESERVE
              </p>

              <h1>
                Reserve your stay
              </h1>

              <p>
                Choose your dates and number
                of guests to continue.
              </p>

            </div>

            {error && (
              <div className="api-error">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
            >

              <div className="form-group">

                <label htmlFor="checkIn">
                  Check-in
                </label>

                <input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(event) => {
                    setCheckIn(
                      event.target.value
                    );

                    if (
                      checkOut &&
                      event.target.value >=
                        checkOut
                    ) {
                      setCheckOut("");
                    }
                  }}
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="checkOut">
                  Check-out
                </label>

                <input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  min={
                    checkIn ||
                    today
                  }
                  onChange={(event) =>
                    setCheckOut(
                      event.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="guests">
                  Guests
                </label>

                <select
                  id="guests"
                  value={guests}
                  onChange={(event) =>
                    setGuests(
                      event.target.value
                    )
                  }
                >

                  {Array.from(
                    {
                      length:
                        Math.min(
                          Number(
                            property.guests
                          ) || 10,
                          10
                        ),
                    },
                    (_, index) => (
                      <option
                        key={index + 1}
                        value={index + 1}
                      >
                        {index + 1}{" "}
                        {index === 0
                          ? "guest"
                          : "guests"}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="booking-total-preview">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  bookingLoading
                }
              >
                {bookingLoading
                  ? "Creating booking..."
                  : "Continue to payment"}
              </button>

            </form>

          </section>

          <aside className="booking-summary-card">

            <img
              src={propertyImage}
              alt={property.title}
              className="booking-property-image"
              onError={(event) => {
                event.currentTarget.src =
                  FALLBACK_IMAGE;
              }}
            />

            <div className="booking-summary-content">

              <h2>
                {property.title}
              </h2>

              <p className="location">
                {property.location?.city ||
                  "Location"}
                {property.location?.country
                  ? `, ${property.location.country}`
                  : ""}
              </p>

              <div className="booking-summary-divider" />

              <div className="price-row">

                <span>
                  ₹{pricePerNight.toLocaleString(
                    "en-IN"
                  )}{" "}
                  × {nights}{" "}
                  {nights === 1
                    ? "night"
                    : "nights"}
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="price-row">

                <span>
                  Service fee
                </span>

                <strong>
                  ₹
                  {serviceFee.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="booking-summary-divider" />

              <div className="price-row total">

                <strong>
                  Total
                </strong>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Booking;