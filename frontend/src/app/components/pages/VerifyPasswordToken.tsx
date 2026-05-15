import { motion } from "motion/react";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom"
import Loader from "../loader/loader";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export function VerifyPasswordToken() {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { setAlert } = useAlert()
  const location = useLocation()
  const navigate = useNavigate()
  const [loader, setLoader] = useState(false)

  const [timer, setTimer] = useState(() => {
    const savedTime = sessionStorage.getItem("otpTimer");
    if (!savedTime) return 0;
    const remaining = Math.ceil((parseInt(savedTime) - Date.now()) / 1000);
    if (remaining <= 0) {
      sessionStorage.removeItem("otpTimer");
      return 0;
    }
    return remaining;
  })
  const [canResend, setCanResend] = useState(false)

  useDocumentTitle("Verify OTP | MindCare")

  const handleChange = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    e.target.value = value;
    if (value && i < 3) {
      inputs.current[i + 1]?.focus();
    }

    const token = inputs.current.map((input) => input?.value || "").join("");
    if (token.length === 4) {
      const data = { email: location.state?.email, token }
      try {
        setLoader(true)
        await axios.post("/api/v1/users/verify-password-token", data, { withCredentials: true });
        sessionStorage.removeItem("otpTimer");
        navigate("/reset-password")
      } catch (error: any) {
        setAlert({ message: error.response.data?.detail || "Error occured while verifying token", severity: "error" })
      }
      finally {
        setLoader(false)
      }
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputs.current[i]?.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  const handleResendToken = async () => {
    try {
      setLoader(true)
      const res = await axios.post("/api/v1/users/forget-password", { email: location.state?.email })
      setAlert({ message: res.data?.message || "Password reset token sent successfully", severity: "success" })
      navigate("/verify-token", { state: { email: location.state?.email } })
    } catch (error: any) {
      setAlert({ message: error.response.data?.detail, severity: "error" })
    }
    finally {
      setLoader(false)
      const otpTimer = Date.now() + 30000;
      sessionStorage.setItem("otpTimer", otpTimer.toString());
      setTimer(30);
      setCanResend(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      {loader && <Loader />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="mb-5 text-sm">
          We have sent a reset token to your email. Use it within 6 minutes.
        </p>

        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="number"
              maxLength={1}
              ref={(el) => { inputs.current[i] = el }}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-12 rounded-full border border-accent text-center text-lg"
            />
          ))}
        </div>
        <button
          disabled={!canResend}
          className={`mt-5 text-sm ${canResend ? "text-primary hover:text-primary/80 cursor-pointer" : "text-muted-foreground"} transition-colors`}
          onClick={() => handleResendToken()}
        >
          {canResend ? <div>Resend token</div> : <div>Resend token in <span className="font-medium">{timer}</span></div>}
        </button>
      </motion.div>
    </div>
  );
}