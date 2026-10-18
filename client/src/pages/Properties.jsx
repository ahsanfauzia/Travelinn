import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../components/Loader";

const fallbackImage =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=85";

function Properties() {
  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          API_URL + "/api/properties"
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
          data.properties || []
        );
      } catch (error) {
        console.error(
          "Properties error:",
          error
        );

        setError(
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="properties-page">

      <div className="container">

        <div className="page-header">

          <p className="section-label">
            EXPLORE
          </p>

          <h1>
            Find your next stay
          </h1>

          <p>
            Discover unique places to stay
            around the world.
          </p>

        </div>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="empty-state">

            <h2>
              No properties found
            </h2>

            <p>
              Try adding a property from
              your host dashboard.
            </p>

          </div>
        ) : (
          <div className="property-grid">

            {properties.map(
              (property) => {

                const image =
                  property.images &&
                  property.images.length > 0
                    ? property.images[0]
                    : fallbackImage;

                return (
                  <article
                    className="property-card"
                    key={property._id}
                  >

                    <Link
                      to={`/property/${property._id}`}
                    >

                      <div className="property-card-image-wrapper">

                        <img
                          src={image}
                          alt={property.title}
                          className="property-card-image"
                          onError={(event) => {
                            event.currentTarget.src =
                              fallbackImage;
                          }}
                        />

                      </div>

                    </Link>

                    <div className="property-card-content">

                      <div className="property-card-top">

                        <div>

                          <h3>
                            {property.title}
                          </h3>

                          <p>
                            {property.location?.city},{" "}
                            {property.location?.country}
                          </p>

                        </div>

                        <span>
                          ★{" "}
                          {property.rating ||
                            "New"}
                        </span>

                      </div>

                      <div className="property-card-bottom">

                        <strong>
                          ₹
                          {Number(
                            property.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <span>
                          / night
                        </span>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>

    </main>
  );
}

export default Properties;