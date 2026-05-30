import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, MessageCircle, MapPin, BookOpen, AlertCircle, Brain, Zap, CloudRain } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../context/AlertContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

interface JournalEntry {
  id: string;
  created_at: string;
  content: string;
  mood?: string;
}

interface WeeklyReportResponse {
  weekly_polarity: number;
  polarity_label: string;
  dominant_state: string;
  trend: string;
  state_counts: Record<string, number>;
  entry_count: number;
}

export function WeeklyReport() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analysis, setAnalysis] = useState<WeeklyReportResponse | null>(null);
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  useDocumentTitle("Weekly Wellness Report | MindCare");

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const [entriesRes, reportRes] = await Promise.all([
          axios.get("/api/v1/journal/weekly", { withCredentials: true }),
          axios.get("/api/v1/mental_health/latest-report", { withCredentials: true })
        ]);

        if (entriesRes.data?.data) {
          setEntries(entriesRes.data.data);
        }

        if (reportRes.data?.data) {
          setAnalysis(reportRes.data.data);
        }
      } catch (error: any) {
        setAlert({ message: error.response?.data?.detail || "Failed to fetch weekly data.", severity: "error" });
        console.error("Error fetching weekly data:", error);
      }
    };
    fetchWeeklyData();
  }, [])

  // Generate recommendations
  const recommendations: string[] = [];
  if (analysis?.dominant_state === "Anxiety") {
    if(analysis.state_counts?.["Anxiety"] > 7) {
      recommendations.push("Seek professional support, your anxiety levels are significantly elevated");
      recommendations.push("Practice deep breathing exercises multiple times daily");
      recommendations.push("Avoid caffeine and prioritize 7-8 hours of sleep");
    }
    else if(analysis.state_counts?.["Anxiety"] > 3) {
      recommendations.push("Try grounding techniques like the 5-4-3-2-1 method");
      recommendations.push("Limit exposure to stressful news or social media");
    }
    else{
      recommendations.push("Maintain your current routine and monitor your feelings");
      recommendations.push("Light exercise like walking can help manage mild anxiety");
    }
  } 
  else if (analysis?.dominant_state === "Stress") {
    if(analysis.state_counts?.["Stress"] > 7) {
      recommendations.push("Consider speaking with a mental health professional");
      recommendations.push("Break your responsibilities into smaller manageable tasks");
      recommendations.push("Set clear boundaries between work and personal time");
    }
    else if(analysis.state_counts?.["Stress"] > 3) {
      recommendations.push("Schedule regular breaks throughout your day");
      recommendations.push("Talk to someone you trust about what you're feeling");
    }
    else{
      recommendations.push("Keep journaling to stay aware of your stress triggers");
      recommendations.push("Maintain a consistent sleep schedule");
    }
  }
  else if (analysis?.dominant_state === "Depression") {
    if(analysis.state_counts?.["Depression"] > 7) {
      recommendations.push("Engage in light physical activity, even a short walk can help");
      recommendations.push("Connect with a friend or loved one today");
      recommendations.push("Consider speaking with a mental health professional");
    }
    else if(analysis.state_counts?.["Depression"] > 3) {
      recommendations.push("Try to identify and celebrate small wins each day");
      recommendations.push("Engage in activities you usually enjoy, even if motivation is low");
    }
    else{
      recommendations.push("Continue journaling to track your emotional well-being");
      recommendations.push("Maintain social connections, even if it's just a quick chat");
    }
  }
  else{
    recommendations.push("Keep up with your current self-care routine");
    recommendations.push("Continue journaling to track your emotional well-being");
  }  
  

  const isSevere = analysis?.polarity_label === "At Risk";

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your journal entries with ML...</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (label: string) => {
    switch (label) {
      case "Healthy": return { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/20" };
      case "Moderate": return { bg: "bg-chart-1/10", text: "text-chart-1", border: "border-chart-1/20" };
      case "At Risk": return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
      default: return { bg: "bg-muted", text: "text-foreground", border: "border-border" };
    }
  };
  const getIconColor = (state: string) => {
    switch (state) {
      case "Normal": return "bg-white";
      case "Anxiety": return "bg-[#4B5563]";
      case "Stress": return "bg-[#DC2626]";
      case "Depression": return "bg-[#1E3A5F]";
      default: return "text-foreground";
    }
  };

  const severityColors = getSeverityColor(analysis.polarity_label);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", { 
      year: "numeric",
      month: "short",
      day: "numeric"
    })
    return formattedDate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/daily-journal")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Journal
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Report Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Calendar className="w-8 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Last 7 Days Analysis ({formatDate(entries[0]?.created_at)} to {formatDate(entries[entries.length - 1]?.created_at)})</span>
          </div>
          <h1 className="text-3xl mb-2">Your Weekly Mental Wellness Report</h1>
          <p className="text-muted-foreground">Based on {entries.length} journal entries</p>
        </motion.div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${severityColors.bg} border ${severityColors.border} rounded-2xl p-8 mb-6`}
        >
        <div className="grid grid-cols-1 place-items-center md:flex md:items-center md:justify-between mb-4 gap-4 md:gap-0">
          <h2 className={`text-2xl ${severityColors.text} text-center md:text-left`}>
              Overall Status: {analysis.polarity_label} (Score: {Math.round(analysis.weekly_polarity)})
            </h2>
            {/* {analysis.trend === "Improving" ? (
              <TrendingUp className={`w-8 h-8 ${severityColors.text}`} />
            ) : analysis.trend === "Declining" ? (
              <TrendingDown className={`w-8 h-8 ${severityColors.text}`} />
            ) : ( */}
            <div className={`w-10 h-10 rounded-full border-2 ${getIconColor(analysis.dominant_state)}`} ></div>
             {/* )}  */}
          </div>
          <p className="text-muted-foreground">
            Your mood is {analysis.trend.toLowerCase()} over the past week.
            Dominant state detected: <strong>{analysis.dominant_state}</strong>
          </p>
        </motion.div>

        {/* Sentiment Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-6"
        >
          {/* Positive Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-chart-3/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-foreground">Healthy Entries</h3>
            </div>
            <div className="text-3xl text-chart-3 text-center md:text-left mb-2">{analysis.state_counts?.["Normal"] || 0}</div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Mentions of positive emotions and normal state
            </p>
          </div>

          {/* Negative Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <CloudRain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground">Depressive Signals</h3>
            </div>
            <div className="text-3xl text-primary text-center md:text-left mb-2">{analysis.state_counts?.["Depression"] || 0}</div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Entries exhibiting signs of depression
            </p>
          </div>

          {/* Anxiety Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-chart-2/20 rounded-xl">
                <Brain className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-foreground">Anxiety Signals</h3>
            </div>
            <div className="text-3xl text-chart-2 text-center md:text-left mb-2">{analysis.state_counts?.["Anxiety"] || 0}</div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              References to anxiety or worry
            </p>
          </div>

          {/* Stress Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-chart-1/20 rounded-xl">
                <Zap className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-foreground">Stress Markers</h3>
            </div>
            <div className="text-3xl text-chart-1 text-center md:text-left mb-2">{analysis.state_counts?.["Stress"] || 0}</div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Mentions of stress or feeling overwhelmed
            </p>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6"
        >
          <h3 className="mb-4 text-foreground text-center">Personalized Recommendations (for {analysis?.dominant_state})</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm text-primary">{index + 1}</span>
                </div>
                <p className="text-muted-foreground">{rec}</p>
              </motion.div>
            ))}
          </div>
         </motion.div> 

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-6"
        >
          <h4 className="mb-4 text-foreground text-center">What would you like to do next?</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/assistant")}
              className="flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              Talk to AI Assistant
            </button>
            <button
              onClick={isSevere ? () => navigate("/clinics") : undefined}
              disabled={!isSevere}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl transition-all duration-300 ${isSevere
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                }`}
            >
              <MapPin className="w-5 h-5" />
              Find Clinics
            </button>
          </div>
          {!isSevere && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Professional help is available for severe cases. Keep journaling and monitoring your wellness.
            </p>
          )}
        </motion.div>

        {/* Continue Journaling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => navigate("/daily-journal")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            Continue Journaling
          </button>
        </motion.div>
      </div>
    </div>
  );
}
