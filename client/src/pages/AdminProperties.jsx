import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function AdminProperties() {
  const navigate = useNavigate();

  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchProperties = async () => {
    const token =
      localStorage.getItem("token");

    try {
      const response = await fetch(
        API_URL + "/api/admin/properties",
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
            "Failed to fetch properties"
        );
      }

      setProperties(
        data.properties
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

    fetchProperties();
  }, [navigate]);

  const deleteProperty =
    async (id) => {
      const confirmed =
        window.confirm(
          "Delete this property?"
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem("token");

      try {
        const response =
          await fetch(
            `${API_URL}/api/admin/properties/${id}`,
            {
              method: "DELETE",

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
              "Failed to delete property"
          );
        }

        setProperties(
          (current) =>
            current.filter(
              (property) =>
                property._id !== id
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
              Properties
            </h1>
          </div>

        </div>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        <div className="admin-property-grid">

          {properties.map(
            (property) => (
              <div
                className="admin-property-card"
                key={property._id}
              >

                <img
                  src={
                    property.images?.[0]
                  }
                  alt={
                    property.title
                  }
                />

                <div className="admin-property-info">

                  <h3>
                    {property.title}
                  </h3>

                  <p>
                    {property.location?.city},{" "}
                    {property.location?.country}
                  </p>

                  <p>
                    Host:{" "}
                    {property.host?.name}
                  </p>

                  <strong>
                    ₹{property.price}
                    {" "}
                    / night
                  </strong>

                  <button
                    className="admin-delete-btn"
                    onClick={() =>
                      deleteProperty(
                        property._id
                      )
                    }
                  >
                    Delete property
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}

export default AdminProperties;