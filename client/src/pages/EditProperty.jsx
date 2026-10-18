import { API_URL } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/properties/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch property"
          );
        }

        const property = data.property;

        setFormData({
          title: property.title || "",
          description: property.description || "",
          city: property.location?.city || "",
          country: property.location?.country || "India",
          propertyType: property.propertyType || "apartment",
          price: property.price || "",
          guests: property.guests || "",
          bedrooms: property.bedrooms || "",
          beds: property.beds || "",
          bathrooms: property.bathrooms || "",
          images: property.images?.join("\n") || "",
          amenities: property.amenities?.join(", ") || "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/properties/${id}`,
        {
          method: "PUT",

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
          data.message || "Failed to update property"
        );
      }

      navigate("/host/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-title">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="page-title">
        <h1>{error || "Property not found"}</h1>
      </div>
    );
  }

  return (
    <main className="host-form-page">
      <div className="container">

        <div className="host-form-card">

          <div className="host-form-header">
            <p className="section-label">
              HOST
            </p>

            <h1>
              Edit property
            </h1>

            <p>
              Update your property information.
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
                  <option value="apartment">
                    Apartment
                  </option>

                  <option value="villa">
                    Villa
                  </option>

                  <option value="hotel">
                    Hotel
                  </option>

                  <option value="house">
                    House
                  </option>

                  <option value="cabin">
                    Cabin
                  </option>

                  <option value="resort">
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
                value={formData.amenities}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={saving}
            >
              {saving
                ? "Saving changes..."
                : "Save changes"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}

export default EditProperty;