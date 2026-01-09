import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
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
  const navigate = useNavigate()
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
    const res = await api.get(
        `/bookings/${bookingId}/ticket`,
        { responseType: "blob" }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    window.open(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

 return (
  <Box sx={{ minHeight: "100vh", background: "#f1f1f1" }}>
    {/* 🔵 Header */}
    <Box
      sx={{
        background: "#1976d2",
        color: "white",
        px: 4,
        py: 2,
      }}
    > 
      <Button
      sx={{ position: "absolute", bottom: "90",
        left: 1540, // above input
         background: "#ff0000ff", 
         color: "white", 
         boxShadow: 3,
          "&:hover": { 
            background: "#d44747ff", 
          },
         }}
          onClick={() => goBack()}
           >
            Home
          </Button>
          
      <Typography variant="h5" fontWeight="bold">
        My Bookings
      </Typography>
    </Box>

    {/* ⚪ Content Area */}
    <Box p={4}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        <Box
          sx={{
            background: "white",
            borderRadius: 2,
            boxShadow: 1,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f5f5f5" }}>
                <TableCell><b>Airline</b></TableCell>
                <TableCell><b>Route</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Price</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Ticket</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.airline}</TableCell>
                  <TableCell>
                    {b.from} → {b.to}
                  </TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>₹{b.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={b.status.toUpperCase()}
                      color={b.status === "paid" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {b.has_ticket ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => downloadTicket(b.id)}
                      >
                        Download
                      </Button>
                    ) : (
                      <Button size="small" disabled>
                        —
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  </Box>
);

}
