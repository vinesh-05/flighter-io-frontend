import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
// import ReactMarkdown from "react-markdown";
import api from "../api/axios";
import FlightCardList from "../components/FlightCardList";
const extractPaymentUrl = (text: string) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(regex);

  if (!matches) return null;

  // Return ONLY Stripe/payment links
  return matches.find(url =>
    url.includes("stripe") ||
    url.includes("checkout") ||
    url.includes("pay")
  ) || null;
};

export default function Chat() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

const sendMessage = async () => {
  if (!input.trim()) return;

  // Add user message
  setMessages((prev) => [...prev, { sender: "user", text: input }]);

  try {
    const res = await api.post("/chat/message", { message: input });

    // Extract backend fields
    const bot_response = res.data.bot_response;
    const flights = res.data.flights;
    const origin = res.data.origin;
    const destination = res.data.destination;
    const date = res.data.date;

    // --- Ensure bot text is always a STRING ---
    let botText = bot_response;

    // 🟡 Payment response object
    if (typeof bot_response === "object") {
      botText = `PAYMENT_DATA_JSON::${JSON.stringify(bot_response)}`;
    }

    // 🔵 Flights response
    if (flights && flights.length > 0) {
      botText = `FLIGHT_DATA_JSON::${JSON.stringify(
        { origin, destination, date, flights }
      )}`;
    }

    // Store final bot message
    setMessages((prev) => [...prev, { sender: "bot", text: botText }]);

  } catch (err: any) {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Error: " + err.message }
    ]);
  }

  setInput("");
};

return (
  <Box 
    sx={{ 
      height: "100vh", 
      width: "100vw",
      display: "flex", 
      flexDirection: "column",
      background: "#f1f1f1"
    }}
  >

    {/* Header */}
    <Box 
      sx={{ 
        p: 2, 
        background: "#1976d2", 
        color: "white",
        fontSize: "22px",
        fontWeight: "bold"
      }}
    >
      Travel Assistant Chat
    </Box>

    {/* Chat messages area */}
    <Box 
      sx={{ 
        flexGrow: 1,
        overflowY: "auto", 
        p: 2,
        color: "black"
      }}
    >
      {messages.map((m, i) => {
        const text = String(m.text);
        const paymentUrl = extractPaymentUrl(text);
        const cleanedText = paymentUrl ? text.replace(paymentUrl, "") : text;

        // Flight cards detection
        if (text.startsWith("FLIGHT_DATA_JSON::")) {
          const data = JSON.parse(text.replace("FLIGHT_DATA_JSON::", ""));
          return (
            <Box key={i} sx={{ mb: 2 }}>
              <FlightCardList data={data} />
            </Box>
          );
        }

        return (
          <Box
            key={i}
            sx={{
              textAlign: m.sender === "user" ? "right" : "left",
              mb: 1,
              p: 1.5,
              maxWidth: "80%",
              ml: m.sender === "user" ? "auto" : "0",
              background: m.sender === "user" ? "#f1f1f1" : "white",
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {cleanedText}
            </Typography>

            {/* Payment Button */}
            {paymentUrl && (
              <Button
                variant="contained"
                color="warning"
                href={paymentUrl}
                target="_blank"
                sx={{ mt: 1 }}
              >
                Pay Now
              </Button>
            )}
          </Box>
        );
      })}
    </Box>

    {/* Input area */}
    <Box 
      sx={{ 
        display: "flex", 
        p: 2, 
        gap: 1, 
        background: "white",
        borderTop: "1px solid #f1f1f1"
      }}
    >
      <TextField
        fullWidth
        label="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button variant="contained" onClick={sendMessage}>
        Send
      </Button>
    </Box>

  </Box>
);
}