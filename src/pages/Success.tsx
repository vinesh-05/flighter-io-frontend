import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("Verifying your payment…");

  useEffect(() => {
    if (!sessionId) {
      setStatus("Invalid session. Please contact support.");
      return;
    }

    axios
      .post(
        "https://flighter-io-production.up.railway.app/flights/confirm-payment", //http://localhost:8000/flights/confirm-payment
        { session_id: sessionId }
      )
      .then(() => {
        setStatus("🎉 Payment successful! Your ticket has been emailed.");
      })
      .catch(() => {
        setStatus(
          "Payment received. Ticket will be emailed shortly if not already sent."
        );
      });
  }, [sessionId]);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>Payment Successful ✔️</h1>
      <p>{status}</p>

      {sessionId && (
        <p style={{ marginTop: "20px", opacity: 0.6 }}>
          Session ID: {sessionId}
        </p>
      )}
    </div>
  );
};

export default Success;
