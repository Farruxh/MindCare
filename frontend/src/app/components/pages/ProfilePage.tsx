import { motion } from "motion/react";
import { ArrowLeft, User, Mail, Lock, Bell, Moon, Sun, LogOut, MapPin, EyeOff, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance.js";
import { useAuth } from "../../context/AuthContext"
import { useAlert } from "../../context/AlertContext";
import { useForm, SubmitHandler } from "react-hook-form"
import Loader from "../loader/loader";
import { GlobalConfirmBox } from "../Global/GlobalConfirmBox";
import useDocumentTitle from "../../hooks/useDocumentTitle";

interface accountFormData {
  name: string
  email: string
}

interface passwordFormData {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}

export function ProfilePage() {
  const [loader, setLoader] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    text: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => { },
  });
  const closeConfirmDialog = () => setConfirmDialog(prev => ({ ...prev, open: false }));

  const [isEditProfile, setIsEditProfile] = useState(false)
  const [isEmailPreference, setIsEmailPreference] = useState(true)
  const { user, setUser, setIsLoggingOut } = useAuth()
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { register: register1, handleSubmit: handleSubmit1, trigger: trigger1 } = useForm<accountFormData>()
  const { register: register, handleSubmit: handleSubmit, trigger: trigger, formState: { errors } } = useForm<passwordFormData>()
  const [isDarkMode, setIsDarkMode] = useState<"light" | "dark">("light")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const memberSince = user ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""
  useDocumentTitle("Profile | MindCare");

  useEffect(() => {
    if (user?.dark_mode) {
      setIsDarkMode(user.dark_mode);
    }
    if (user && user.is_email_notification !== undefined) {
      setIsEmailPreference(user.is_email_notification);
    }
  }, [user]);

  const handleUpdateAccountDetail: SubmitHandler<accountFormData> = async (data) => {
    try {
      setLoader(true)
      const res = await axiosInstance.patch("/api/v1/users/update-account", data)
      setUser(res.data.data)
      setAlert({ message: res.data?.message || "Account information updated successfully", severity: "success" })
    } catch (error: any) {
      setAlert({ message: error.response?.data.detail || "Failed to Update Account Information", severity: "error" });
    }
    finally {
      setLoader(false)
    }
  }

  const handleToggleDarkMode = async () => {
    const newTheme = isDarkMode === "light" ? "dark" : "light";
    try {
      setLoader(true)
      await axiosInstance.patch("/api/v1/users/update-dark-mode", { theme: newTheme })
      setIsDarkMode(newTheme)
      if (user) {
        setUser({ ...user, dark_mode: newTheme });
      }
    } catch (error: any) {
      setAlert({ message: error.response?.data.detail || "Failed to Update Theme Preference", severity: "error" });
    }
    finally {
      setLoader(false)
    }
  }

  const handleToggleEmailPreference = async () => {
    const newPreference = !isEmailPreference;
    try {
      setLoader(true)
      await axiosInstance.patch("/api/v1/users/update-account", { is_email_notification: newPreference })
      setIsEmailPreference(newPreference)
      if (user) {
        setUser({ ...user, is_email_notification: newPreference });
      }
    } catch (error: any) {
      setAlert({ message: error.response?.data.detail || "Failed to Update Email Preference", severity: "error" });
    }
    finally {
      setLoader(false)
    }
  }

  const handleUpdatePassword: SubmitHandler<passwordFormData> = async (data) => {
    try {
      setLoader(true)
      const res = await axiosInstance.patch("/api/v1/users/update-current-password", data)
      setUser(res.data.data)
      setAlert({ message: res.data?.message || "Password Updated Successfully", severity: "success" })
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
      const res = await axiosInstance.get("/api/v1/users/logout")
      setAlert({ message: res.data?.message || "Logged out successfully", severity: "success" });
      localStorage.clear()
      setUser(null)
      setIsLoggingOut(true)
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "An error occurred while logging out", severity: "error" });
    } finally {
      setLoader(false)
    }
  }
  const handleDeleteAccount = async () => {
    try {
      setLoader(true)
      const res = await axiosInstance.delete("/api/v1/users/delete-account")
      setAlert({ message: res.data?.message || "Account deleted successfully", severity: "success" });
      localStorage.clear()
      setUser(null)
      setIsLoggingOut(true)
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "An error occurred while deleting account", severity: "error" });
    } finally {
      setLoader(false)
    }
  }

  const handleAssessmentDelete = async () => {
    try {
      setLoader(true)
      const res = await axiosInstance.delete("/api/v1/assessments/delete")
      setAlert({ message: res.data?.message || "Assessments deleted successfully", severity: "success" });
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "An error occurred while deleting assessments", severity: "error" });
    } finally {
      setLoader(false)
    }
  }

  const handleSaveLocation = () => {
    if (!navigator.geolocation) {
      setAlert({ message: "Geolocation is not supported by your browser.", severity: "error" });
      return;
    }

    setLoader(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const data = { latitude, longitude }
        try {
          const res = await axiosInstance.patch("/api/v1/users/update-account", data);
          if (res.data?.data) {
            setUser(res.data.data);
          }
          setAlert({ message: "Location saved successfully!", severity: "success" });
        } catch (error: any) {
          console.error("Error saving location:", error);
          setAlert({ message: error || "Failed to save location to your profile.", severity: "error" })
        } finally {
          setLoader(false);
        }
      },
      (error) => {
        setLoader(false);
        setAlert({ message: "Unable to retrieve your location. Check your browser permissions.", severity: "error" });
      }
    );
  };

  return (
    <div className="min-h-screen background">
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
          className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-6 flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 md:gap-0 bg-gradient-to-r from-primary/10 to-secondary/10 text-center md:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-2 md:mt-0">
            <div className="w-24 h-24 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-md md:shadow-none transition-all">
              <span className="text-4xl md:text-3xl font-semibold text-white uppercase transition-all">
                {user?.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="sm:text-left text-center">
              <h3 className="text-2xl md:text-xl font-medium text-foreground mb-1 transition-all">{user?.name}</h3>
              <p className="text-muted-foreground mb-1 md:mb-0 transition-all">{user?.email}</p>
              <p className="text-sm md:text-base text-muted-foreground transition-all"><b>Member Since:</b> {memberSince}</p>
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

        {/* Account Settings */}
        <motion.div
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
                    className="w-full pl-11 pr-4 py-3 bg-input-background text-foreground rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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
                    className="w-full pl-11 pr-4 py-3 bg-input-background text-foreground rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register1("email", { required: true })}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              className="w-full px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
              onClick={async () => {
                if (await trigger1()) {
                  setConfirmDialog({
                    open: true,
                    title: "Confirm Update Account Information",
                    text: "Are you sure you want to update your account information?",
                    confirmText: "Update",
                    cancelText: "Cancel",
                    onConfirm: () => {
                      handleSubmit1(handleUpdateAccountDetail)();
                      closeConfirmDialog();
                    }
                  })
                }
              }
              }
            >
              Update Account Information
            </button>
          </form>
        </motion.div>

        {/* Security */}
        <motion.div
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
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...register("currentPassword", { required: "Enter your current password" })}
                  />
                  <motion.button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none"
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
                {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                  )}
              </div>
              <div>
                <label className="block mb-2 text-card-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    minLength={8}
                    maxLength={128}
                    {...register("newPassword", { required: "Enter your new password", minLength: 8, maxLength: 128 })}
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
                {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
              </div>
              <div>
                <label className="block mb-2 text-card-foreground">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    minLength={8}
                    maxLength={128}
                    {...register("confirmPassword", { required: "Enter your confirm new password", minLength: 8, maxLength: 128 })}
                  />
                  <motion.button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none"
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
              </div>
              <button
                type="button"
                className="px-5 py-2 mt-2 w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
                onClick={async () => {
                  if (await trigger()) {
                    setConfirmDialog({
                      open: true,
                      title: "Confirm Update Current Password",
                      text: "Are you sure you want to update your current password?",
                      confirmText: "Update",
                      cancelText: "Cancel",
                      onConfirm: () => {
                        handleSubmit(handleUpdatePassword)();
                        closeConfirmDialog();
                      }
                    })
                  }
                }
                }
              >
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
                  <div className="text-sm text-muted-foreground">Receive your assessment results via email</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEmailPreference}
                  onChange={() => {
                    handleToggleEmailPreference()
                  }}
                />
                <div className="w-14 h-7 bg-muted peer-checked:bg-slate-700 dark:peer-checked:bg-slate-500 rounded-full transition-colors duration-300" />
                <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-7 transition-all duration-300" />
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-foreground">Current Location</div>
                  <div className="text-sm text-muted-foreground">Get nearby clinic recommendations</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveLocation}
                className="w-full sm:w-auto px-4 py-2 bg-muted hover:bg-primary dark:hover:bg-muted/60 hover:text-white rounded-xl transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-sm hover:shadow-md"
              >
                <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Save My Current Location
              </button>
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
                  checked={isDarkMode === "dark"}
                  onChange={() => {
                    handleToggleDarkMode()
                  }}
                />
                <div className="w-14 h-7 bg-muted peer-checked:bg-primary rounded-full transition-colors duration-300" />
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full peer-checked:translate-x-7 transition-all duration-300 flex items-center justify-center shadow-sm">
                  {isDarkMode === "dark" ? (
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
              onClick={() => setConfirmDialog({
                open: true,
                title: "Confirm Logout",
                text: "Are you sure you want to log out of your account?",
                confirmText: "Log Out",
                cancelText: "Cancel",
                onConfirm: () => {
                  closeConfirmDialog();
                  handleLogOut();
                }
              })}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-muted hover:bg-primary dark:hover:bg-muted/80 hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
            <button
              onClick={() => setConfirmDialog({
                open: true,
                title: "Delete All Assessments",
                text: "Are you sure you want to delete all your assessments? This action cannot be undone.",
                confirmText: "Delete",
                cancelText: "Cancel",
                onConfirm: () => {
                  closeConfirmDialog();
                  handleAssessmentDelete();
                }
              })}
              className="w-full px-5 py-3 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all duration-300 cursor-pointer">
              Delete All Assessments
            </button>
            <button
              onClick={() => setConfirmDialog({
                open: true,
                title: "Delete Account",
                text: "Are you sure you want to permanently delete your account? This cannot be undone.",
                confirmText: "Delete Account",
                cancelText: "Cancel",
                onConfirm: () => {
                  closeConfirmDialog();
                  handleDeleteAccount();
                }
              })}
              className="w-full px-5 py-3 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all duration-300 cursor-pointer">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>

      <GlobalConfirmBox
        open={confirmDialog.open}
        title={confirmDialog.title}
        text={confirmDialog.text}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </div>
  );
}
