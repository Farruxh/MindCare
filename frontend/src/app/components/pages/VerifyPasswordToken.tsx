import { motion } from "motion/react";
import { useRef, useState } from "react";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";

export default function VerifyCode() {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { setAlert } = useAlert()
  const navigate = useNavigate()
  const [email, setEmail] = useState()

  const handleChange = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    e.target.value = value;
    if (value && i < 3) {
      inputs.current[i + 1]?.focus();
    }

    const token = inputs.current.map((input) => input?.value || "").join("");
    if (token.length === 4) {
        try {
           const res = await axios.post("/api/v1/users/verify-password-token", {token} , { withCredentials: true }); 
           navigate("/reset-password")
        } catch (error: any) {
            setAlert({message: error.response.data?.detail || "Error occured while verifying token" , severity: "error"})
        }
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputs.current[i]?.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="mb-5 text-sm">
          We have sent you a reset code to your email. Use it within 6 minutes.
        </p>

        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              ref={(el) => { inputs.current[i] = el }}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-12 rounded-full border border-accent text-center text-lg"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}