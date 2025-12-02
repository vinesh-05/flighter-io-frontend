import { Card, CardContent, Typography, Box } from "@mui/material";

export default function FlightCardList({ data }: any) {
  const { origin, destination, date, flights } = data;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Flights from {origin} → {destination} on {date}
      </Typography>

      {flights.map((f: any, index: number) => (
        <Card key={index} sx={{ mb: 2, p: 1 }}>
          <CardContent>
            <Typography><b>Flight ID:</b> {f.id}</Typography>
            <Typography><b>Airline:</b> {f.airline}</Typography>
            <Typography><b>Price:</b> {f.price}</Typography>
            <Typography><b>Duration:</b> {f.duration}</Typography>
            <Typography>
              <b>Departure:</b> {f.departure_time} → <b>Arrival:</b> {f.arrival_time}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
