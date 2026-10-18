import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Booking from "./pages/Booking";
import Payment from "./pages/Payment";

import Wishlist from "./pages/Wishlist";
import MyBookings from "./pages/MyBookings";

import HostDashboard from "./pages/HostDashboard";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProperties from "./pages/AdminProperties";
import AdminBookings from "./pages/AdminBookings";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Public Pages */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/property/:id"
          element={<PropertyDetails />}
        />

        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Booking */}

        <Route
          path="/booking/:id"
          element={<Booking />}
        />

        <Route
          path="/payment/:bookingId"
          element={<Payment />}
        />

        <Route
          path="/my-bookings"
          element={<MyBookings />}
        />

        {/* Wishlist */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* Host */}

        <Route
          path="/host/dashboard"
          element={<HostDashboard />}
        />

        <Route
          path="/host/add-property"
          element={<AddProperty />}
        />

        <Route
          path="/host/edit-property/:id"
          element={<EditProperty />}
        />

        {/* Admin */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/properties"
          element={<AdminProperties />}
        />

        <Route
          path="/admin/bookings"
          element={<AdminBookings />}
        />

        {/* 404 */}

        <Route
          path="*"
          element={
            <div className="page-title">
              <h1>Page not found</h1>
            </div>
          }
        />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;