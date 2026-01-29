import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Divider
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";

type Passenger = {
  type: "adult" | "child" | "infant";
  name: string;
  age: number;
  email?: string;
  phone?: string;
  address?: string;
  guardian_index?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  flight: any;
  bookingConfig: {
    tripType: "one_way" | "round_trip";
    adults: number;
    children: number;
    infants: number;
  };
};

export default function PassengerDetailsModal({
  open,
  onClose,
  flight,
  bookingConfig
}: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- INIT PASSENGERS ---------- */

  useEffect(() => {
    if (!open) return;

    const list: Passenger[] = [];

    for (let i = 0; i < bookingConfig.adults; i++) {
      list.push({
        type: "adult",
        name: "",
        age: 18,
        email: "",
        phone: "",
        address: ""
      });
    }

    for (let i = 0; i < bookingConfig.children; i++) {
      list.push({
        type: "child",
        name: "",
        age: 7,
        guardian_index: 0
      });
    }

    for (let i = 0; i < bookingConfig.infants; i++) {
      list.push({
        type: "infant",
        name: "",
        age: 1,
        guardian_index: 0
      });
    }

    setPassengers(list);
  }, [open, bookingConfig]);

  /* ---------- HELPERS ---------- */

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: any
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const adultIndices = passengers
    .map((p, i) => (p.type === "adult" ? i : null))
    .filter((i) => i !== null) as number[];

  const isValid = passengers.every((p) => {
    if (!p.name || p.age === undefined) return false;

    if (p.type === "adult") {
      return p.age >= 16 && !!p.email && !!p.phone;
    }

    if (p.type === "child") {
      return p.age > 6 && p.age < 16 && p.guardian_index !== undefined;
    }

    if (p.type === "infant") {
      return p.age <= 6 && p.guardian_index !== undefined;
    }

    return true;
  });

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1️⃣ Validate primary adult
      const primaryAdult = passengers.find((p) => p.type === "adult");

      if (!primaryAdult?.email) {
        alert("At least one adult must have a valid email");
        setLoading(false);
        return;
      }

      // 2️⃣ Validate guardians
      for (const p of passengers) {
        if (p.type !== "adult") {
          if (
            p.guardian_index === undefined ||
            passengers[p.guardian_index]?.type !== "adult"
          ) {
            alert("Each child/infant must have a valid adult guardian");
            setLoading(false);
            return;
          }
        }
      }

      // 3️⃣ Sanitize ALL numeric fields
const sanitizedPassengers = passengers.map((p) => {
  const clean: any = {
    type: p.type,
    name: p.name,
    age: Number(p.age)
  };

  if (p.type === "adult") {
    // 🔥 FORCE phone & email for adults
    clean.email = p.email?.trim();
    clean.phone = p.phone?.trim();
  }

  if (p.address?.trim()) clean.address = p.address;

  if (p.guardian_index !== undefined) {
    clean.guardian_index = Number(p.guardian_index);
  }

  return clean;
});


    const payload = {
    flight: {
        flight_id: flight.flight_id,
        airline: flight.airline,
        price: flight.price,          // already a number
        date: flight.date,            // MUST be non-null
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time
    },
    trip_type: bookingConfig.tripType,
    booking_contact_email: primaryAdult.email!,
    passengers: sanitizedPassengers
    };
      console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
      console.log("FLIGHT DATE:", payload.flight.date);
    console.log("FLIGHT PRICE:", payload.flight.price, typeof payload.flight.price);

      // 4️⃣ Create booking
      const bookingRes = await api.post("/bookings/create", payload);

      // 5️⃣ Create Stripe session
      const stripeRes = await api.post("/payments/create-session", {
        booking_id: bookingRes.data.booking_id
      });

      // 6️⃣ Redirect to Stripe
      window.location.href = stripeRes.data.checkout_url;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let message = "Booking failed";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg).join("\n");
      } else if (typeof detail === "object") {
        message = JSON.stringify(detail, null, 2);
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Passenger Details</DialogTitle>

      <DialogContent>
        {passengers.map((p, index) => (
          <Box
            key={index}
            sx={{
              mb: 3,
              p: 2,
              border: "1px solid #eee",
              borderRadius: 2
            }}
          >
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              {p.type.toUpperCase()} {index + 1}
            </Typography>

            <TextField
              fullWidth
              label="Name"
              sx={{ mb: 2 }}
              value={p.name}
              onChange={(e) =>
                updatePassenger(index, "name", e.target.value)
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Age"
              sx={{ mb: 2 }}
              value={p.age}
              onChange={(e) =>
                updatePassenger(index, "age", Number(e.target.value))
              }
            />

            {p.type === "adult" && (
              <>
                <TextField
                  fullWidth
                  label="Email"
                  sx={{ mb: 2 }}
                  value={p.email}
                  onChange={(e) =>
                    updatePassenger(index, "email", e.target.value)
                  }
                />

                <TextField
                  fullWidth
                  label="Phone"
                  sx={{ mb: 2 }}
                  value={p.phone}
                  onChange={(e) =>
                    updatePassenger(index, "phone", e.target.value)
                  }
                />

                <TextField
                  fullWidth
                  label="Address"
                  value={p.address}
                  onChange={(e) =>
                    updatePassenger(index, "address", e.target.value)
                  }
                />
              </>
            )}

            {p.type !== "adult" && (
              <TextField
                select
                fullWidth
                label="Guardian"
                value={p.guardian_index ?? ""}
                onChange={(e) =>
                  updatePassenger(
                    index,
                    "guardian_index",
                    Number(e.target.value)
                  )
                }
              >
                {adultIndices.map((i) => (
                  <MenuItem key={i} value={i}>
                    {passengers[i]?.name || `Adult ${i + 1}`}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        ))}
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={onClose}>Back</Button>

        <Button
          variant="contained"
          disabled={!isValid || loading}
          onClick={handleSubmit}
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
