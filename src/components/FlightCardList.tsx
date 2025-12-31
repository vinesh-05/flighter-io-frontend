import { Card, CardContent, Typography, Box, Button } from "@mui/material";

export default function FlightCardList({ data, onSelect }: any) {
  const { origin, destination, date, flights } = data;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Flights from {origin} → {destination} on {date}
      </Typography>

      {flights.map((f: any, index: number) => (
        <Card
          key={index}
          sx={{
            mb: 2,
            p: 1,
            cursor: "pointer",
            "&:hover": { backgroundColor: "#f5faff" }
          }}
          onClick={() => onSelect(f.id)}
        >
          <CardContent>
            <Typography><b>Flight ID:</b> {f.id}</Typography>
            <Typography><b>Airline:</b> {f.airline}</Typography>
            <Typography><b>Price:</b> {f.price}</Typography>
            <Typography><b>Duration:</b> {f.duration}</Typography>
            <Typography>
              <b>Departure:</b> {f.departure_time} → <b>Arrival:</b> {f.arrival_time}
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={(e) => {
                e.stopPropagation();   // prevent double trigger
                onSelect(f.id);
              }}
            >
              Book this flight
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
