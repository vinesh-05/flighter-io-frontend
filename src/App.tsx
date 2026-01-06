import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";
import Success from "./pages/Success";
import MyBookings from "./pages/myBookings";
export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        {/* Redirect root route */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route path="/my-bookings" element={<MyBookings />} />

      </Routes>

    </BrowserRouter>
  );
}
