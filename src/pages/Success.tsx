import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Success = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("Processing your payment…");

  useEffect(() => {
    if (!sessionId) {
      setStatus("Invalid session. Please contact support.");
      return;
    }

    // Stripe webhook handles confirmation + email
    setStatus("🎉 Payment successful! Your ticket will be emailed shortly.");
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
