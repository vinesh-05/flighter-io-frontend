import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Menu,
  Button,
  TextField,
  // Typography,
  MenuItem,
  Divider
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";

type Gender = "MALE" | "FEMALE" | "OTHER";
type PassengerType = "ADULT" | "CHILD" | "INFANT";

type Passenger = {
  full_name: string;
  dob: string;
  gender: Gender;

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

/* ---------- HELPERS ---------- */

function getPassengerType(dob: string, travelDate: string): PassengerType {
  const birth = new Date(dob);
  const travel = new Date(travelDate);

  let age = travel.getFullYear() - birth.getFullYear();
  const m = travel.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && travel.getDate() < birth.getDate())) age--;

  if (age < 2) return "INFANT";
  if (age < 12) return "CHILD";
  return "ADULT";
}

export default function PassengerDetailsModal({
  open,
  onClose,
  flight,
  bookingConfig
}: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedPassengers, setSavedPassengers] = useState<Passenger[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePassengerIndex, setActivePassengerIndex] = useState<number | null>(null);
  const [showAutofillDialog, setShowAutofillDialog] = useState(false);

  /* ---------- INIT PASSENGERS ---------- */

  useEffect(() => {
    if (!open) return;
api.get("/details/get")
  .then(res => {
    console.log("Saved passengers:", res.data);
    setSavedPassengers(res.data);
  });

    const list: Passenger[] = [];

    const total =
      bookingConfig.adults +
      bookingConfig.children +
      bookingConfig.infants;

    for (let i = 0; i < total; i++) {
      list.push({
        full_name: "",
        dob: "",
        gender: "MALE"
      });
    }

    setPassengers(list);
  }, [open, bookingConfig]);

  /* ---------- HELPERS ---------- */

  const autofillPassenger = (index: number, data: Passenger) => {
  setPassengers(prev =>
    prev.map((p, i) =>
      i === index
        ? {
            ...p,
            full_name: data.full_name,
            dob: String(data.dob).slice(0, 10), // 🔥 IMPORTANT
            gender: data.gender,
            email: data.email,
            phone: data.phone,
            address: data.address,
            guardian_index: undefined
          }
        : p
    )
  );
};



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
    .map((p, i) =>
      p.dob && getPassengerType(p.dob, flight.date) === "ADULT"
        ? i
        : null
    )
    .filter((i) => i !== null) as number[];

  const isValid = passengers.every((p,_idx) => {
    if (!p.full_name || !p.dob) return false;

   const type = p.dob
  ? getPassengerType(p.dob, flight.date)
  : null;

    if (!type) return false;

    if (type === "ADULT") {
      return !!p.email && !!p.phone && !!p.address;
    }

    return p.guardian_index !== undefined;
  });

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const primaryAdultIndex = passengers.findIndex(
  (p) =>
    p.dob &&
    getPassengerType(p.dob, flight.date) === "ADULT"
);

      if (primaryAdultIndex === -1) {
        alert("At least one adult is required");
        return;
      }

      const payload = {
        flight: {
          flight_id: flight.flight_id,
          airline: flight.airline,
          price: flight.price,
          date: flight.date,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time
        },
        trip_type: bookingConfig.tripType,
        booking_contact_email:
          passengers[primaryAdultIndex].email!,
        passengers
      };

      const bookingRes = await api.post(
        "/bookings/create",
        payload
      );

      const stripeRes = await api.post(
        "/payments/create-session",
        {
          booking_id: bookingRes.data.booking_id
        }
      );

      window.location.href = stripeRes.data.checkout_url;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      alert(
        typeof detail === "string"
          ? detail
          : JSON.stringify(detail, null, 2)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Passenger Details</DialogTitle>

      <DialogContent>
        {passengers.map((p, index) => {
      const type = p.dob
        ? getPassengerType(p.dob, flight.date)
        : null;

      console.log("Passenger", index + 1, {
        dob: p.dob,
        flightDate: flight.date,
        computedType: type
      });



          return (
            <Box
              key={index}
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid #eee",
                borderRadius: 2
              }}
            >

              
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setActivePassengerIndex(index);
                setShowAutofillDialog(true);
              }}
            >
              Autofill
            </Button>




              <TextField
                fullWidth
                label="Full Name"
                sx={{ mb: 2 }}
                value={p.full_name}
                onChange={(e) =>
                  updatePassenger(index, "full_name", e.target.value)
                }
              />

              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                value={p.dob}
                onChange={(e) =>
                  updatePassenger(index, "dob", e.target.value)
                }
              />

              <TextField
                select
                fullWidth
                label="Gender"
                sx={{ mb: 2 }}
                value={p.gender}
                onChange={(e) =>
                  updatePassenger(index, "gender", e.target.value)
                }
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>

              {type === "ADULT" && (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    sx={{ mb: 2 }}
                    value={p.email || ""}
                    onChange={(e) =>
                      updatePassenger(index, "email", e.target.value)
                    }
                  />

                  <TextField
                    fullWidth
                    label="Phone"
                    sx={{ mb: 2 }}
                    value={p.phone || ""}
                    onChange={(e) =>
                      updatePassenger(index, "phone", e.target.value)
                    }
                  />

                  <TextField
                    fullWidth
                    label="Address"
                    value={p.address || ""}
                    onChange={(e) =>
                      updatePassenger(index, "address", e.target.value)
                    }
                  />
                </>
              )}

              {type && type !== "ADULT" && (
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
                      {passengers[i]?.full_name || `Adult ${i + 1}`}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
          );
        })}
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
     <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        disablePortal   // 🔥 THIS IS THE KEY LINE
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={() => {
          setAnchorEl(null);
          setActivePassengerIndex(null);
        }}
      >

      {savedPassengers.map((sp, i) => (
        <MenuItem
          key={i}
          onClick={() => {
            if (activePassengerIndex !== null) {
              autofillPassenger(activePassengerIndex, sp);
            }
            setAnchorEl(null);
            setActivePassengerIndex(null);
          }}
        >
          {sp.full_name}
        </MenuItem>
      ))}
    </Menu>

  <Dialog
    open={showAutofillDialog}
    onClose={() => setShowAutofillDialog(false)}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle>Select Saved Passenger</DialogTitle>

    <DialogContent dividers>
      {savedPassengers.length === 0 ? (
        <Box sx={{ py: 2 }}>No saved passengers</Box>
      ) : (
        savedPassengers.map((sp, i) => (
          <Box
            key={i}
            sx={{
              p: 1.5,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": { backgroundColor: "#f5f5f5" }
            }}
            onClick={() => {
              if (activePassengerIndex !== null) {
                autofillPassenger(activePassengerIndex, sp);
              }
              setShowAutofillDialog(false);
              setActivePassengerIndex(null);
            }}
          >
            <strong>{sp.full_name}</strong>
            <div style={{ fontSize: 12, color: "#666" }}>
              {sp.dob}
            </div>
          </Box>
        ))
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={() => setShowAutofillDialog(false)}>Cancel</Button>
    </DialogActions>
  </Dialog>

    </Dialog>
  );
}
