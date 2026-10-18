import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          API_URL + "/api/admin/dashboard",
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
              "Failed to load dashboard"
          );
        }

        setStats(data.stats);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

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
              Admin dashboard
            </h1>
          </div>
        </div>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        {stats && (
          <div className="admin-stats">

            <div className="admin-stat">
              <span>
                Total users
              </span>

              <strong>
                {stats.totalUsers}
              </strong>
            </div>

            <div className="admin-stat">
              <span>
                Hosts
              </span>

              <strong>
                {stats.totalHosts}
              </strong>
            </div>

            <div className="admin-stat">
              <span>
                Properties
              </span>

              <strong>
                {stats.totalProperties}
              </strong>
            </div>

            <div className="admin-stat">
              <span>
                Bookings
              </span>

              <strong>
                {stats.totalBookings}
              </strong>
            </div>

            <div className="admin-stat">
              <span>
                Confirmed
              </span>

              <strong>
                {stats.confirmedBookings}
              </strong>
            </div>

            <div className="admin-stat">
              <span>
                Revenue
              </span>

              <strong>
                ₹{stats.totalRevenue}
              </strong>
            </div>

          </div>
        )}

        <div className="admin-navigation">

          <button
            onClick={() =>
              navigate("/admin/users")
            }
          >
            Manage users
          </button>

          <button
            onClick={() =>
              navigate("/admin/properties")
            }
          >
            Manage properties
          </button>

          <button
            onClick={() =>
              navigate("/admin/bookings")
            }
          >
            Manage bookings
          </button>

        </div>

      </div>
    </main>
  );
}

export default AdminDashboard;