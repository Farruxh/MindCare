import { motion } from "motion/react";
import { Brain, MessageCircle, ClipboardList, Sparkles, MapPin, User, LogOut, BookOpen, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"
import { useAlert } from "../../context/AlertContext"
import { useEffect, useState } from "react"
import Loader from "../loader/loader";


const recentSessions = [
  { id: 1, date: "2 hours ago", topic: "Stress Assessment", duration: "25 min" },
  { id: 2, date: "Yesterday", topic: "Anxiety Relief", duration: "18 min" },
  { id: 3, date: "3 days ago", topic: "General Chat", duration: "32 min" }
];


export function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { setAlert } = useAlert();
  const [loader, setLoader] = useState(false)
  const [assessmentHistory, setAssessmentHistory] = useState<{
    created_at: string;
    anxiety_score: number | null;
    depression_score: number | null;
    stress_score: number | null;
  }[]>([])

  useEffect(() => {
    if (!isLoading && !user) navigate("/login")
  }, [isLoading, user])

  useEffect(() => {
    const getAssessmentHistory = async () => {
      try {
        const res = await axios.get("/api/v1/assessments/my-assessment", { withCredentials: true })
        setAssessmentHistory(res.data.data ?? [])
      } catch (error: any) {
        setAlert({ message: error.response.data?.detail || "Unable to fetch assessment history", severity: "error" });
      }
    }
    getAssessmentHistory()
  }, [])

  const chartData = assessmentHistory.map((row) => ({
    date: new Date(row.created_at).toLocaleDateString(),
    anxiety: row.anxiety_score ?? 0,
    depression: row.depression_score ?? 0,
    stress: row.stress_score ?? 0,
  }));

  const handleOnLogout = async () => {
    try {
      setLoader(true)
      const res = await axios.get("/api/v1//users/logout", { withCredentials: true })
      setAlert({ message: res.data?.message || "Logged out successfully", severity: "success" });
      localStorage.clear()
      navigate("/");
    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "An error occurred while logging out", severity: "error" });
    } finally {
      setLoader(false)
    }
  }

  const handleOnClick = async () => {
    try {
      setLoader(true)
      const res = await axios.post("/api/v1/chats/", { withCredentials: true })
      const chat_id = res.data?.data.chat_id
      navigate(`/assistant/${chat_id}`)
    } catch (error: any) {
      console.log(error.response?.data?.detail);
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
              onClick={() => handleOnLogout()}
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
              onClick={() => action.path == "/assistant" ? handleOnClick() : navigate(action.path)}
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
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                    <XAxis dataKey="date" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e8eaed",
                        borderRadius: "12px",
                        padding: "12px"
                      }}
                    />
                    <Line type="monotone" dataKey="stress" stroke="#DC2626" strokeWidth={3} activeDot={{ r: 7 }} dot={false} />
                    <Line type="monotone" dataKey="depression" stroke="#1E3A5F" strokeWidth={3} activeDot={{ r: 7 }} dot={false} />
                    <Line type="monotone" dataKey="anxiety" stroke="#4B5563" strokeWidth={3} activeDot={{ r: 7 }} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary">Great progress!</span> Your scores show improvement over the past month. Keep up with your self-care routine.
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
              {recentSessions.map((session) => (
                <div key={session.id} className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="text-sm text-muted-foreground mb-1">{session.date}</div>
                  <div className="text-foreground mb-1">{session.topic}</div>
                  <div className="text-sm text-primary">{session.duration}</div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
            >
              View All Sessions
            </button>
          </motion.div>
        </div>

        {/* Wellness Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-2 text-foreground">Daily Wellness Tip</h3>
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
    </div>
  );
}