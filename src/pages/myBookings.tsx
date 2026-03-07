import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  IconButton,
  Skeleton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: number;
  airline: string;
  from: string;
  to: string;
  date: string;
  price: number;
  status: string;
  has_ticket: boolean;
  created_at: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/chat");
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/flights/history");
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const downloadTicket = async (bookingId: number) => {
    try {
      const res = await api.get(
        `/bookings/${bookingId}/ticket`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url);
    } catch (err) {
      console.error("Failed to download ticket", err);
      alert("Ticket download failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 🔵 Sticky Header */}
      <Paper
        elevation={0}
        sx={{
          p: "12px 24px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <IconButton onClick={goBack} sx={{ color: "#5f6368" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1976d2', color: 'white', borderRadius: '8px', p: 0.8 }}>
          <FlightTakeoffIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
          My Bookings
        </Typography>
      </Paper>

      {/* ⚪ Content Area */}
      <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 4 } }}>
        
        {/* Table Header (Hidden on Mobile) */}
        {!loading && bookings.length > 0 && (
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "1.5fr 1.5fr 1.5fr 1fr 1fr 1.5fr",
              gap: 2,
              px: 3,
              pb: 2,
              mb: 2,
              borderBottom: "2px solid #e2e8f0"
            }}
          >
            {["Airline", "Route", "Date", "Price", "Status", "Ticket"].map((head) => (
              <Typography key={head} sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                {head}
              </Typography>
            ))}
          </Box>
        )}

        {/* Loading Skeletons */}
        {loading && [1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2, borderRadius: "16px", bgcolor: "#ffffff" }} />
        ))}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <ConfirmationNumberOutlinedIcon sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 600 }}>No bookings found</Typography>
            <Typography sx={{ color: "#94a3b8", mb: 3 }}>You haven't booked any flights yet.</Typography>
            <Button variant="contained" onClick={goBack} sx={{ borderRadius: "50px", px: 4, py: 1.5, fontWeight: 700, boxShadow: "none", bgcolor: "#1976d2" }}>
              Search Flights
            </Button>
          </Box>
        )}

        {/* Booking Cards */}
        {!loading && bookings.map((b) => (
          <Paper
            key={b.id}
            elevation={0}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.5fr 1.5fr 1.5fr 1fr 1fr 1.5fr" },
              gap: { xs: 2, md: 2 },
              alignItems: "center",
              p: 3,
              mb: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#b3d4ff",
                boxShadow: "0 8px 24px rgba(25, 118, 210, 0.08)",
                transform: "translateY(-2px)"
              }
            }}
          >
            {/* Airline */}
            <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, justifyContent: "space-between" }}>
              <Typography sx={{ display: { xs: "block", md: "none" }, color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Airline</Typography>
              <Typography sx={{ fontWeight: 700, color: "#202124" }}>{b.airline}</Typography>
            </Box>

            {/* Route */}
            <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, justifyContent: "space-between" }}>
              <Typography sx={{ display: { xs: "block", md: "none" }, color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Route</Typography>
              <Typography sx={{ fontWeight: 600, color: "#5f6368" }}>{b.from} → {b.to}</Typography>
            </Box>

            {/* Date */}
            <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, justifyContent: "space-between" }}>
              <Typography sx={{ display: { xs: "block", md: "none" }, color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Date</Typography>
              <Typography sx={{ fontWeight: 500, color: "#202124" }}>
                {new Date(b.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, justifyContent: "space-between" }}>
              <Typography sx={{ display: { xs: "block", md: "none" }, color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Price</Typography>
              <Typography sx={{ fontWeight: 800, color: "#0288d1" }}>
                ₹{Number(b.price).toLocaleString("en-IN")}
              </Typography>
            </Box>

            {/* Status */}
            <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, justifyContent: "space-between", alignItems: { xs: "center", md: "flex-start" } }}>
              <Typography sx={{ display: { xs: "block", md: "none" }, color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Status</Typography>
              <Chip
                label={b.status.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: b.status.toLowerCase() === "paid" ? "#e6f4ea" : "#fff3e0",
                  color: b.status.toLowerCase() === "paid" ? "#137333" : "#e65100",
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                  borderRadius: "8px",
                  px: 1
                }}
              />
            </Box>

            {/* Ticket Action */}
            <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mt: { xs: 2, md: 0 } }}>
              {b.has_ticket ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={() => downloadTicket(b.id)}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#1976d2",
                    borderColor: "#bbdefb",
                    width: { xs: "100%", md: "auto" },
                    "&:hover": {
                      backgroundColor: "#f4f9ff",
                      borderColor: "#1976d2"
                    }
                  }}
                >
                  Download
                </Button>
              ) : (
                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>
                  Unavailable
                </Typography>
              )}
            </Box>

          </Paper>
        ))}
      </Box>
    </Box>
  );
}