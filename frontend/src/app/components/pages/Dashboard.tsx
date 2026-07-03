import { motion } from "motion/react";
import { Brain, MessageCircle, ClipboardList, Sparkles, MapPin, User, LogOut, BookOpen, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axiosInstance from "../../../api/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"
import { useAlert } from "../../context/AlertContext"
import { useEffect, useState } from "react"
import Loader from "../loader/loader";
import { GlobalConfirmBox } from "../Global/GlobalConfirmBox";
import useDocumentTitle from "../../hooks/useDocumentTitle";


export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setAlert } = useAlert();
  const { setUser, setIsLoggingOut } = useAuth()
  useDocumentTitle("Dashboard | MindCare");
  const [loader, setLoader] = useState(false)
  const [assessmentHistory, setAssessmentHistory] = useState<{
    created_at: string;
    anxiety_score: number | null;
    anxiety_severity: string | null;
    depression_score: number | null;
    depression_severity: string | null;
    stress_score: number | null;
    stress_severity: string | null;
  }[]>([])
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    text: "",
    confirmText: "confirm",
    cancelText: "cancel",
    onConfirm: () => { }
  })
  const closeConfirmDialog = () => setConfirmDialog(prev => ({ ...prev, open: false }))
  const [recentActivity, setRecentActivity] = useState<{
    type: string;
    created_at: string;
  }[]>([])

  useEffect(() => {
    const getAssessmentHistory = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/assessments/my-assessment")
        setAssessmentHistory(res.data.data ?? [])
      } catch (error: any) {
        setAlert({ message: error.response.data?.detail || "Unable to fetch assessment history", severity: "error" });
      }
    }
    getAssessmentHistory()
  }, [])

  useEffect(() => {
    const getRecentActivity = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/users/recent-activity/get")
        const formattedActivities = res.data.data.map((activity: any) => ({
          type: activity.activity_type,
          created_at: activity.created_at
        }));
        setRecentActivity(formattedActivities);
      } catch (error: any) {
        setAlert({ message: error.response.data?.detail || "Unable to fetch recent activity", severity: "error" });
      }
    }
    getRecentActivity()
  }, [])


  const chartData = assessmentHistory.map((row) => ({
    date: new Date(row.created_at).toLocaleDateString(),
    anxiety: row.anxiety_score ?? 0,
    anxiety_severity: row.anxiety_severity ?? "None",
    depression: row.depression_score ?? 0,
    depression_severity: row.depression_severity ?? "None",
    stress: row.stress_score ?? 0,
    stress_severity: row.stress_severity ?? "None"
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    })
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  const handleLogout = async () => {
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

  return (
    <div className="min-h-screen background ">
      {loader && <Loader />}
      {/* Header */}
      <div className="bg-card backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary" />
            <span className="text-xl tracking-tight">MindCare</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              title="My Profile"
              onClick={() => navigate("/profile")}
              className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              title="Log out"
              type="button"
              onClick={() => {
                setConfirmDialog({
                  open: true,
                  title: "Confirm Logout",
                  text: "Are you sure you want to log out of your account??",
                  confirmText: "Logout",
                  cancelText: "Cancel",
                  onConfirm: () => {
                    closeConfirmDialog()
                    handleLogout()
                  }
                });
              }}
              className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl mb-2">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's your mental wellness overview</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { icon: <MessageCircle />, label: "Start Chat", color: "bg-primary", path: "/assistant" },
            { icon: <ClipboardList />, label: "Assessment", color: "bg-secondary", path: "/assessment" },
            { icon: <BookOpen />, label: "Daily Journal", color: "bg-chart-4", path: "/daily-journal" },
            { icon: <Sparkles />, label: "Meditation", color: "bg-accent", path: "/meditation" },
            { icon: <MapPin />, label: "Find Clinics", color: "bg-chart-2", path: "/clinics" }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={ () => navigate(action.path) }
              className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              <div className={`${action.color} text-white p-3 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <div className="text-foreground">{action.label}</div>
            </motion.button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Assessment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-6"
          >
            <h3 className="mb-6 text-foreground">Assessment Progress</h3>
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -35, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                    <XAxis dataKey="date" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "12px"
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const severity = props.payload[`${name}_severity` as keyof typeof props.payload];
                      const label = name.charAt(0).toUpperCase() + name.slice(1);
                      return severity ? [`${value} (${severity})`, label] : [value, label];
                      }}
                    />
                    <Line type="monotone" dataKey="stress" stroke="#DC2626" strokeWidth={3} activeDot={{ r: 7 }} dot={false} />
                    <Line type="monotone" dataKey="anxiety" stroke="#4B5563" strokeWidth={3} activeDot={{ r: 7 }} dot={false} />
                    <Line type="monotone" dataKey="depression" stroke="#1E3A5F" strokeWidth={3} activeDot={{ r: 7 }} dot={false} />
                    
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">Wellness Insights:</span> Your assessment progress is shown here to give you a visual representation of your trends through this graph.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-22 px-8 gap-6 text-center">
                <div className="w-18 h-18 rounded-full bg-muted border border-border flex items-center justify-center">
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2 max-w-xs">
                  <p className="text-base font-medium text-foreground">No progress data yet</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Complete your first assessment to start tracking your mental wellness journey over time.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl shadow-sm border border-border p-6"
          >
            <h3 className="mb-6 text-foreground">Recent Sessions</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="text-sm text-muted-foreground mb-1">{formatDate(activity?.created_at)}</div>
                    <div className="text-foreground mb-1">{activity?.type}</div>
                  </div>
                ))
              ) : (
                <p className="text-center text-base font-medium text-foreground">
                  No recent activities yet
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wellness Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20"
        >
          <div className="flex gap-4 sm:flex-row flex-col sm:text-left text-center sm:items-start items-center">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-2 text-foreground">Wellness Tip</h3>
              <p className="text-muted-foreground">
                Take 5 minutes today for deep breathing. It can help reduce stress and improve focus. Try our guided meditation exercises to get started.
              </p>
              <button
                onClick={() => navigate("/meditation")}
                className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
              >
                Try Now
              </button>
            </div>
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