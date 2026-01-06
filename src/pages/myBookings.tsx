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
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Airline</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ticket</TableCell>
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
      )}
    </Box>
  );
}
