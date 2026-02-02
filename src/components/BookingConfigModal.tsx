import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type BookingConfig = {
  tripType: "one_way" | "round_trip";
  adults: number;
  children: number;
  infants: number;
};

type BookingConfigModalProps = {
  open: boolean;
  onClose: () => void;
  config: BookingConfig;
  setConfig: (config: BookingConfig) => void;
  onContinue: () => void;
};

export default function BookingConfigModal({
  open,
  onClose,
  config,
  setConfig,
  onContinue
}: BookingConfigModalProps) {

  const updateCount = (
    field: "adults" | "children" | "infants",
    delta: number
  ) => {
    setConfig({
      ...config,
      [field]: Math.max(0, config[field] + delta)
    });
  };

  // ✅ Backend-aligned validation
  const isValid =
    config.adults >= 1 &&
    config.infants <= config.adults &&
    config.adults + config.children + config.infants > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Trip & Passengers</DialogTitle>

      <DialogContent>
        {/* Trip Type */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontWeight: 600 }}>
            Trip Type
          </Typography>

          <ToggleButtonGroup
            value={config.tripType}
            exclusive
            fullWidth
            onChange={(_, value) => {
              if (value) {
                setConfig({ ...config, tripType: value });
              }
            }}
          >
            <ToggleButton value="one_way">One Way</ToggleButton>
            <ToggleButton value="round_trip">Round Trip</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Passenger Counters */}
        <PassengerCounter
          label="Adults (12+)"
          count={config.adults}
          min={1}
          onIncrease={() => updateCount("adults", 1)}
          onDecrease={() => updateCount("adults", -1)}
        />

        <PassengerCounter
          label="Children (2–11)"
          count={config.children}
          onIncrease={() => updateCount("children", 1)}
          onDecrease={() => updateCount("children", -1)}
        />

        <PassengerCounter
          label="Infants (Under 2)"
          count={config.infants}
          onIncrease={() => updateCount("infants", 1)}
          onDecrease={() => updateCount("infants", -1)}
        />

        {/* Validation Message */}
        {!isValid && (
          <Typography color="error" sx={{ mt: 2, fontSize: 13 }}>
            • At least 1 adult is required  
            <br />
            • Number of infants cannot exceed adults
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          disabled={!isValid}
          onClick={onContinue}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Helper Component ---------- */

function PassengerCounter({
  label,
  count,
  onIncrease,
  onDecrease,
  min = 0
}: {
  label: string;
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2
      }}
    >
      <Typography>{label}</Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={onDecrease}
          disabled={count <= min}
        >
          <RemoveIcon />
        </IconButton>

        <Typography sx={{ minWidth: 24, textAlign: "center" }}>
          {count}
        </Typography>

        <IconButton size="small" onClick={onIncrease}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
