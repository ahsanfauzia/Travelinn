import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import Loader from "../components/Loader";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          API_URL + "/api/properties"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch properties"
          );
        }

        setProperties(data.properties);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-overlay">
          <div className="container hero-content">
            <p className="hero-label">
              FIND YOUR NEXT STAY
            </p>

            <h1>
              Stay somewhere
              <br />
              unforgettable.
            </h1>

            <p>
              Discover beautiful homes, apartments, villas and
              unique stays around the world.
            </p>
          </div>
        </div>
      </section>

      <div className="container search-container">
        <SearchBar />
      </div>

      <section className="container properties-section">
        <div className="section-header">
          <div>
            <p className="section-label">
              EXPLORE
            </p>

            <h2>
              Popular stays
            </h2>
          </div>

          <a href="/properties">
            View all
          </a>
        </div>

        {loading && <Loader />}

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="empty-state">
            <h3>No properties available</h3>
            <p>
              Add a property from the backend to see it here.
            </p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="property-grid">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;