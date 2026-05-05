import { motion } from "motion/react";
import { useNavigate } from "react-router-dom"
import { Brain, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form"
import axios from "axios"
import { useAlert } from "../../context/AlertContext.tsx";
import { useState } from "react";
import Loader from "../loader/loader.tsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";


interface formData {
  name: string,
  email: string,
  password: string,
  gender: string
}

export function SignUpPage() {
  const { register, handleSubmit } = useForm<formData>();
  const { setAlert } = useAlert();
  const navigate = useNavigate()
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useDocumentTitle("Sign Up | MindCare")

  const handleOnSubmit: SubmitHandler<formData> = async (data) => {
    try {
      setLoader(true);
      const res = await axios.post("/api/v1/users/register-user", data);
      setAlert({ message: res.data.message || "Account Successfully Created.", severity: "success" })
      navigate("/login"); 
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail[0]?.msg || "An error occurred during signup.", severity: "error" })
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex items-center justify-center px-6 py-12">
      {loader && <Loader />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl tracking-tight text-foreground">MindCare</span>
          </div>
          <p className="text-muted-foreground">Begin your journey to better mental health</p>
        </div>

        {/* Sign Up Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl shadow-lg border border-border p-8"
        > 
          <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-card-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="John Doe"
                  {...register("name", { required: true })}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-card-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="your.email@example.com"
                  {...register("email", { required: true })}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-card-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-11 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  minLength={8}
                  maxLength={128}
                  placeholder="••••••••••"
                  {...register("password", { required: true })}
                />
                <motion.button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none" 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-card-foreground">Gender</label>
              <div className="flex gap-6 justify-center space-x-16">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="male"
                    {...register("gender", { required: true })}
                  />
                  <span>Male</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="female"
                    {...register("gender", { required: true })}
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md mt-6 cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          ← Back to home
        </motion.button>
      </motion.div>
    </div>
  );
}
