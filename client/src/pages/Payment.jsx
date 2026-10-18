import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const startPayment = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        API_URL + "/api/payments/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            bookingId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create payment"
        );
      }

      const options = {
        key: data.keyId,

        amount: Math.round(
          data.amount * 100
        ),

        currency: data.currency,

        name: "TravelInn",

        description:
          "Hotel booking payment",

        order_id: data.orderId,

        handler: async function (
          paymentResponse
        ) {
          await verifyPayment(
            paymentResponse
          );
        },

        prefill: {
          name: JSON.parse(
            localStorage.getItem("user") ||
              "{}"
          ).name || "",

          email: JSON.parse(
            localStorage.getItem("user") ||
              "{}"
          ).email || "",
        },

        theme: {
          color: "#222222",
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load"
        );
      }

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          setError(
            response.error?.description ||
              "Payment failed"
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const verifyPayment = async (
    paymentResponse
  ) => {
    const token =
      localStorage.getItem("token");

    try {
      const response = await fetch(
        API_URL + "/api/payments/verify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            bookingId,

            razorpay_order_id:
              paymentResponse.razorpay_order_id,

            razorpay_payment_id:
              paymentResponse.razorpay_payment_id,

            razorpay_signature:
              paymentResponse.razorpay_signature,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Payment verification failed"
        );
      }

      navigate("/my-bookings");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    startPayment();
  }, []);

  return (
    <main className="payment-page">

      <div className="payment-card">

        {loading && !error && (
          <>
            <div className="payment-loader" />

            <h1>
              Opening secure payment...
            </h1>

            <p>
              Please wait while we connect
              you to Razorpay.
            </p>
          </>
        )}

        {error && (
          <>
            <h1>
              Payment failed
            </h1>

            <p>
              {error}
            </p>

            <button
              className="auth-submit"
              onClick={startPayment}
            >
              Try again
            </button>

            <button
              className="payment-back-btn"
              onClick={() =>
                navigate(
                  "/my-bookings"
                )
              }
            >
              Back to bookings
            </button>
          </>
        )}

      </div>

    </main>
  );
}

export default Payment;