import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<string>("Verifying your payment…");

  useEffect(() => {
    if (!sessionId) {
      setStatus("Invalid session. Please contact support.");
      return;
    }

    axios
axios
  .post(
    "https://flighter-io-frontend.vercel.app/flights/confirm-payment",
    { session_id: sessionId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  )
  .then(() => {
    setStatus("🎉 Your payment is confirmed! Your ticket has been emailed.");
  })
  .catch(() => {
    setStatus("❌ Could not confirm payment. Please contact support.");
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
