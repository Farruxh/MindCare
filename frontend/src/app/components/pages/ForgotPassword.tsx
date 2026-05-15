import { motion } from "motion/react"
import { Brain, Mail } from "lucide-react"
import { useForm, SubmitHandler } from "react-hook-form"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAlert } from "../../context/AlertContext"
import Loader from "../loader/loader"
import { useState } from "react"
import useDocumentTitle from "../../hooks/useDocumentTitle"

interface formData {
    email: string
}

export function ForgotPassword() {
    const { register, handleSubmit } = useForm<formData>()
    const [loader, setLoader] = useState(false)
    const navigate = useNavigate()
    const { setAlert } = useAlert()
    useDocumentTitle("Forgot Password | MindCare")

    const handleSubmitEmail: SubmitHandler<formData> = async (data) => {
        try {
            setLoader(true)
            const res = await axios.post("/api/v1/users/forget-password", data)
            setAlert({ message: res.data?.message || "Password reset token sent successfully", severity: "success" })
            sessionStorage.setItem("otpTimer", (Date.now() + 30000).toString())
            navigate("/verify-token" , {state: {email: data.email}})
        } catch (error: any) {
            setAlert({ message: error.response.data?.detail, severity: "error" })
        }
        finally {
            setLoader(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex items-center justify-center px-6 py-12">
            {loader && <Loader />}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <Brain className="w-8 h-8 text-primary" />
                        <span className="text-2xl tracking-tight text-foreground">MindCare</span>
                    </div>
                </div>

                {/* Forgot password box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-card rounded-2xl shadow-lg border border-border p-8"
                >
                    <form onSubmit={handleSubmit(handleSubmitEmail)} className="space-y-5">
                        <div>
                            <label className="block mb-6 text-card-foreground">Please enter your registered email for a reset token</label>
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
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                        >
                            Send Reset Token →
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