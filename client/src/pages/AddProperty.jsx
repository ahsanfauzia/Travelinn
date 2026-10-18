import { API_URL } from "../api.js";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddProperty() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    country: "India",
    propertyType: "Apartment",
    price: "",
    guests: "",
    bedrooms: "",
    beds: "",
    bathrooms: "",
    images: "",
    amenities: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        API_URL + "/api/properties",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title,
            description: formData.description,

            location: {
              city: formData.city,
              country: formData.country,
            },

            propertyType: formData.propertyType,

            price: Number(formData.price),
            guests: Number(formData.guests),
            bedrooms: Number(formData.bedrooms),
            beds: Number(formData.beds),
            bathrooms: Number(formData.bathrooms),

            images: formData.images
              .split("\n")
              .map((url) => url.trim())
              .filter(Boolean),

            amenities: formData.amenities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create property"
        );
      }

      navigate("/host/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="host-form-page">
      <div className="container">

        <div className="host-form-card">

          <div className="host-form-header">
            <p className="section-label">
              HOST
            </p>

            <h1>
              Add a property
            </h1>

            <p>
              Create a listing and start hosting guests.
            </p>
          </div>

          {error && (
            <div className="api-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>
                Property title
              </label>

              <input
                type="text"
                name="title"
                placeholder="Beautiful beach villa"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe your property..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="Goa"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Property type
                </label>

                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                >
                  <option value="Apartment">
                    Apartment
                  </option>

                  <option value="Villa">
                    Villa
                  </option>

                  <option value="Hotel">
                    Hotel
                  </option>

                  <option value="House">
                    House
                  </option>

                  <option value="Cabin">
                    Cabin
                  </option>

                  <option value="Resort">
                    Resort
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Price per night
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  placeholder="4500"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Guests
                </label>

                <input
                  type="number"
                  name="guests"
                  min="1"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Beds
                </label>

                <input
                  type="number"
                  name="beds"
                  min="0"
                  value={formData.beds}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-group">
              <label>
                Image URLs
              </label>

              <textarea
                name="images"
                placeholder="Paste one image URL per line"
                value={formData.images}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>
                Amenities
              </label>

              <input
                type="text"
                name="amenities"
                placeholder="WiFi, Pool, Kitchen, Parking"
                value={formData.amenities}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating property..."
                : "Create property"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}

export default AddProperty;
