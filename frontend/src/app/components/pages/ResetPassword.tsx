import { motion } from "motion/react";
import { useNavigate } from "react-router-dom"
import { Brain, Eye, EyeOff, Lock } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form"
import axios from "axios"
import { useAlert } from "../../context/AlertContext.tsx";
import { useState } from "react"
import Loader from "../loader/loader.tsx"
import useDocumentTitle from "../../hooks/useDocumentTitle";

interface formData {
    new_password: string
    confirm_new_password: string
}

export function ResetPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm<formData>();
    const { setAlert } = useAlert();
    const navigate = useNavigate()
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loader, setLoader] = useState(false)
    useDocumentTitle("Reset Password | MindCare")

    const handleOnSubmit: SubmitHandler<formData> = async (data) => {
        try {
            setLoader(true);
            const res = await axios.patch("/api/v1/users/reset-password", data, { withCredentials: true });
            setAlert({ message: res.data?.message || "Password Reset Successfully.", severity: "success" })
            navigate("/login");
        } catch (error: any) {
            console.log(error.response.data);
            setAlert({ message: error.response?.data?.detail || "An error occurred while resetting password.", severity: "error" })
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
                    <p className="text-muted-foreground">Reset Your forgotten Password</p>
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
                            <label className="block mb-2 text-card-foreground">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                    minLength={8}
                                    maxLength={128}
                                    placeholder="••••••••"
                                    {...register("new_password", { required: "Enter your new password", minLength: 8, maxLength: 128 })}
                                />
                                <motion.button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none"
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </motion.button>
                            </div>
                            {errors.new_password && (
                                <span className="text-red-500 text-sm mt-1">{errors.new_password.message}</span>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-card-foreground">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                    minLength={8}
                                    maxLength={128}
                                    placeholder="••••••••"
                                    {...register("confirm_new_password", { required: "Enter your confirm new password", minLength: 8, maxLength: 128 })}
                                />
                                <motion.button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none"
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </motion.button>
                            </div>
                            {errors.confirm_new_password && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirm_new_password.message}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md mt-3 cursor-pointer"
                        >
                            Change password
                        </button>
                    </form>

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
    )
}