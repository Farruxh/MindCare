import { motion } from "motion/react";
import { ArrowLeft, User, Mail, Lock, Bell, Shield, Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"
import { useAlert } from "../../context/AlertContext";
import { useForm, SubmitHandler } from "react-hook-form"
import Loader from "../loader/loader";
import { useTheme } from "../../context/ThemeContext"

interface accountFormData {
  name: string
  email: string
}

interface formData {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}

export function ProfilePage() {
  const [loader, setLoader] = useState(false)
  const [isEditProfile, setIsEditProfile] = useState(false)
  const [ isEmailPreference, setIsEmailPreference ] = useState( () => {
    return JSON.parse(localStorage.getItem("isEmailPreference") ?? "true")  
  })
  const { user, setUser, isLoading } = useAuth()
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { register: register1, handleSubmit: handleSubmit1 } = useForm<accountFormData>()
  const { register: register, handleSubmit: handleSubmit } = useForm<formData>()
  const { isDarkMode, setIsDarkMode } = useTheme()

  useEffect(() => {
    if (!isLoading && !user) navigate("/login")
  }, [isLoading, user])

  const handleUpdateAccountDetail: SubmitHandler<accountFormData> = async (data) => {
    try {
      setLoader(true)
      const res = await axios.patch("/api/v1/users/update-account", data, { withCredentials: true })
      setUser(res.data.data)
      setAlert({ message: res.data?.message || "Account information updated successfully", severity: "success" })
      navigate("/profile")
    } catch (error: any) {
      setAlert({ message: error.response?.data.detail || "Failed to Update Account Information", severity: "error" });
    }
    finally {
      setLoader(false)
    }
  }

  const handleUpdatePassword: SubmitHandler<formData> = async (data) => {
    try {
      setLoader(true)
      const res = await axios.patch("/api/v1/users/update-current-password", data, { withCredentials: true })
      setUser(res.data.data)
      setAlert({ message: res.data?.message || "Password Updated Successfully", severity: "success" })
      navigate("/profile")
    } catch (error: any) {
      setAlert({ message: error.response?.data.detail || "Failed to Update Password", severity: "error" });
    }
    finally {
      setLoader(false)
    }
  }

  const handleLogOut = async () => {
    try {
      setLoader(true)
      const res = await axios.get("/api/v1/users/logout", { withCredentials: true })
      setAlert({ message: res.data?.message || "Logged out successfully", severity: "success" });
      localStorage.clear()
      navigate("/");
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "An error occurred while logging out", severity: "error" });
    } finally {
      setLoader(false)
    }
  }
  const handleOnDelete = async () => {
    try {
      setLoader(true)
      const res = await axios.get("/api/v1/users/delete-account", { withCredentials: true })
      setAlert({ message: res.data?.message || "Account deleted successfully", severity: "success" });
      navigate("/");
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "An error occurred while deleting account out", severity: "error" });
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className="min-h-screen background">
      {/* bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 */}
      {loader && <Loader />}
      {/* Header */}
      <div className="bg-card backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            title="Dashboard"
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-foreground">Profile Settings</h2>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-6 md:flex items-center justify-between  bg-gradient-to-r from-primary/10 to-secondary/10"
        >
          <div className="sm:flex items-center gap-6 my-3">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              {/* <User className="w-10 h-10 text-white" /> */}
              <span className="text-3xl font-semibold text-white uppercase">
                {user?.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h3 className="text-xl text-foreground mb-1">{user?.name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            className={`px-5 py-2 rounded-xl transition-colors cursor-pointer ${isEditProfile
              ? "bg-primary text-primary-foreground "
              : "bg-muted hover:bg-muted/80"
              }`}
            onClick={() => setIsEditProfile((prev) => !prev)}
          >
            Edit Account
          </button>
        </motion.div>
        {/* className="w-8 h-8 text-primary animate-spin" */}

        {/* Account Settings */}
        <motion.div
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          animate={isEditProfile ? { opacity: 1, y: 0 } : { opacity: 0, y: -20, display: "none" }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-6"
        >
          <h3 className="mb-6 text-foreground">Account Information</h3>
          <form onSubmit={handleSubmit1(handleUpdateAccountDetail)}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-2 text-card-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    defaultValue={user?.name || ""}
                    // placeholder={user?.name || ""}
                    className="w-full pl-11 pr-4 py-3 bg-input-background text-gray-900 rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register1("name", { required: true })}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-card-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    // placeholder={user?.email || ""}
                    className="w-full pl-11 pr-4 py-3 bg-input-background text-gray-900 rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register1("email", { required: true })}
                  />
                </div>
              </div>
            </div>
            <button className="w-full px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer">
              Update Account Information
            </button>
          </form>
        </motion.div>

        {/* Security */}
        <motion.div
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          animate={isEditProfile ? { opacity: 1, y: 0 } : { opacity: 0, y: -20, display: "none" }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-6"
        >
          <h3 className="mb-6 text-foreground">Security</h3>
          <form onSubmit={handleSubmit(handleUpdatePassword)}>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-card-foreground">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    // placeholder="Enter current password"
                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register("currentPassword", { required: true })}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-card-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    // placeholder="Enter new password"
                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register("newPassword", { required: true })}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-card-foreground">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    // placeholder="Confirm new password"
                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register("confirmPassword", { required: true })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2 mt-2 w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer">
                Update Password
              </button>
            </div>
          </form>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-6"
        >
          <h3 className="mb-6 text-foreground">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-foreground">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive updates and reminders</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isEmailPreference} 
                onChange={() => {
                  setIsEmailPreference(!isEmailPreference)
                  localStorage.setItem("isEmailPreference", JSON.stringify(!isEmailPreference))
                }}
                />
                <div className="w-14 h-7 bg-muted peer-checked:bg-slate-700 dark:peer-checked:bg-slate-500 rounded-full transition-colors duration-300" />
                <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-7 transition-all duration-300" />
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-foreground">Privacy Mode</div>
                  <div className="text-sm text-muted-foreground">Enhanced data protection</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-7 bg-muted peer-checked:bg-slate-700 dark:peer-checked:bg-slate-500 rounded-full transition-colors duration-300" />
                <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-7 transition-all duration-300" />
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-foreground">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">Enable eye comfort dark mode</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isDarkMode}
                  onChange={() => {
                    setIsDarkMode(!isDarkMode)
                    localStorage.setItem("darkMode", JSON.stringify(!isEmailPreference))
                  }}
                />
                <div className="w-14 h-7 bg-muted peer-checked:bg-primary rounded-full transition-colors duration-300" />
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full peer-checked:translate-x-7 transition-all duration-300 flex items-center justify-center shadow-sm">
                  {isDarkMode ? (
                    <Moon className="w-3 h-3 text-slate-700" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-sm border border-destructive/45 p-8"
        >
          <h3 className="mb-6 text-foreground">Account Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => handleLogOut()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-muted hover:bg-primary dark:hover:bg-muted/80 hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
            <button
              onClick={() => handleOnDelete()}
              className="w-full px-5 py-3 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all duration-300 cursor-pointer">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
