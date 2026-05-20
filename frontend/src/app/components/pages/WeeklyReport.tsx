import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, MessageCircle, MapPin, BookOpen, AlertCircle } from "lucide-react";
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

interface SentimentAnalysis {
  positiveCount: number;
  negativeCount: number;
  anxietyIndicators: number;
  stressIndicators: number;
  moodTrend: "improving" | "declining" | "stable";
  severityLevel: "minimal" | "mild" | "moderate" | "severe";
  recommendations: string[];
}
//Abdullah work 
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
  //Abdullah work 
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

        //Abdullah work 
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

  // useEffect(() => {
  //   const savedEntries = localStorage.getItem("journalEntries");
  //   if (savedEntries) {
  //     const allEntries: JournalEntry[] = JSON.parse(savedEntries);

  //     // Get last 7 entries
  //     const recentEntries = allEntries
  //       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //       .slice(0, 7);

  //     setEntries(recentEntries);

  //     // Perform sentiment analysis
  //     const sentimentResult = analyzeSentiment(recentEntries);
  //     setAnalysis(sentimentResult);
  //   }
  // }, []);

  // const analyzeSentiment = (entries: JournalEntry[]): SentimentAnalysis => {
  //   // Keywords for sentiment analysis
  //   const positiveWords = [
  //     "happy", "joy", "excited", "great", "wonderful", "amazing", "love", "grateful",
  //     "thankful", "blessed", "good", "better", "progress", "achievement", "success",
  //     "calm", "peaceful", "relaxed", "proud", "accomplished", "hopeful", "optimistic"
  //   ];

  //   const negativeWords = [
  //     "sad", "depressed", "unhappy", "terrible", "awful", "hate", "angry", "frustrated",
  //     "worried", "anxious", "stressed", "overwhelmed", "exhausted", "tired", "lonely",
  //     "isolated", "hopeless", "helpless", "worthless", "failure", "disappointed"
  //   ];

  //   const anxietyIndicators = [
  //     "anxious", "worried", "nervous", "panic", "fear", "scared", "terrified",
  //     "overthinking", "restless", "uneasy", "tense", "on edge"
  //   ];

  //   const stressIndicators = [
  //     "stressed", "overwhelmed", "pressure", "burden", "exhausted", "burnout",
  //     "too much", "can't cope", "drowning", "breaking down"
  //   ];

  //   let positiveCount = 0;
  //   let negativeCount = 0;
  //   let anxietyCount = 0;
  //   let stressCount = 0;
  //   let moodScores: number[] = [];

  //   const moodValues: Record<string, number> = {
  //     happy: 5,
  //     calm: 4,
  //     neutral: 3,
  //     stressed: 2,
  //     anxious: 2,
  //     sad: 1
  //   };

  //   entries.forEach((entry) => {
  //     const content = entry.content.toLowerCase();

  //     // Count sentiment words
  //     positiveWords.forEach(word => {
  //       if (content.includes(word)) positiveCount++;
  //     });

  //     negativeWords.forEach(word => {
  //       if (content.includes(word)) negativeCount++;
  //     });

  //     anxietyIndicators.forEach(word => {
  //       if (content.includes(word)) anxietyCount++;
  //     });

  //     stressIndicators.forEach(word => {
  //       if (content.includes(word)) stressCount++;
  //     });

  //     // Track mood scores
  //     if (entry.mood && moodValues[entry.mood]) {
  //       moodScores.push(moodValues[entry.mood]);
  //     }
  //   });

  //   // Determine mood trend
  //   let moodTrend: "improving" | "declining" | "stable" = "stable";
  //   if (moodScores.length >= 3) {
  //     const firstHalf = moodScores.slice(0, Math.floor(moodScores.length / 2));
  //     const secondHalf = moodScores.slice(Math.floor(moodScores.length / 2));
  //     const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  //     const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  //     if (secondAvg > firstAvg + 0.5) moodTrend = "improving";
  //     else if (secondAvg < firstAvg - 0.5) moodTrend = "declining";
  //   }

  //   // Calculate severity level
  //   const totalNegative = negativeCount + anxietyCount + stressCount;
  //   const ratio = positiveCount > 0 ? totalNegative / positiveCount : totalNegative;
  //   const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 3;

  //   let severityLevel: "minimal" | "mild" | "moderate" | "severe" = "minimal";

  //   if (ratio > 3 || avgMood < 2 || (anxietyCount > 10 && stressCount > 10)) {
  //     severityLevel = "severe";
  //   } else if (ratio > 2 || avgMood < 2.5 || (anxietyCount > 6 || stressCount > 6)) {
  //     severityLevel = "moderate";
  //   } else if (ratio > 1 || avgMood < 3.5 || (anxietyCount > 3 || stressCount > 3)) {
  //     severityLevel = "mild";
  //   }

  //   // Generate recommendations
  //   const recommendations: string[] = [];

  //   if (anxietyCount > 5) {
  //     recommendations.push("Practice deep breathing exercises and mindfulness meditation");
  //   }
  //   if (stressCount > 5) {
  //     recommendations.push("Consider stress management techniques and regular breaks");
  //   }
  //   if (avgMood < 3) {
  //     recommendations.push("Engage in activities you enjoy and connect with loved ones");
  //   }
  //   if (moodTrend === "declining") {
  //     recommendations.push("Monitor your mental health closely and reach out for support");
  //   }
  //   if (positiveCount < 5) {
  //     recommendations.push("Try to identify and celebrate small wins each day");
  //   }
  //   if (recommendations.length === 0) {
  //     recommendations.push("Keep up with your current self-care routine");
  //     recommendations.push("Continue journaling to track your emotional well-being");
  //   }

  //   return {
  //     positiveCount,
  //     negativeCount,
  //     anxietyIndicators: anxietyCount,
  //     stressIndicators: stressCount,
  //     moodTrend,
  //     severityLevel,
  //     recommendations
  //   };
  // };

  // const getSeverityColor = (level: string) => {
  //   switch (level) {
  //     case "minimal": return { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/20" };
  //     case "mild": return { bg: "bg-chart-2/10", text: "text-chart-2", border: "border-chart-2/20" };
  //     case "moderate": return { bg: "bg-chart-1/10", text: "text-chart-1", border: "border-chart-1/20" };
  //     case "severe": return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
  //     default: return { bg: "bg-muted", text: "text-foreground", border: "border-border" };
  //   }
  // };

  //Abdullah work 
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

  const severityColors = getSeverityColor(analysis.polarity_label);

  // if (!analysis) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Analyzing your journal entries...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // const severityColors = getSeverityColor(analysis.severityLevel);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      // weekday: "short", 
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
            <Calendar className="w-4 h-4 text-primary" />
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
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl ${severityColors.text}`}>
              Overall Status: {analysis.polarity_label} (Score: {Math.round(analysis.weekly_polarity)})
            </h2>
            {analysis.trend === "Improving" ? (
              <TrendingUp className={`w-8 h-8 ${severityColors.text}`} />
            ) : analysis.trend === "Declining" ? (
              <TrendingDown className={`w-8 h-8 ${severityColors.text}`} />
            ) : (
              <div className={`w-8 h-8 rounded-full border-2 ${severityColors.text}`} />
            )}
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
            <div className="text-3xl text-chart-3 mb-2">{analysis.state_counts?.["Normal"] || 0}</div>
            <p className="text-sm text-muted-foreground">
              Mentions of positive emotions and normal state
            </p>
          </div>

          {/* Negative Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground">Depressive Signals</h3>
            </div>
            <div className="text-3xl text-primary mb-2">{analysis.state_counts?.["Depression"] || 0}</div>
            <p className="text-sm text-muted-foreground">
              Entries exhibiting signs of depression
            </p>
          </div>

          {/* Anxiety Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-chart-2/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-foreground">Anxiety Signals</h3>
            </div>
            <div className="text-3xl text-chart-2 mb-2">{analysis.state_counts?.["Anxiety"] || 0}</div>
            <p className="text-sm text-muted-foreground">
              References to anxiety or worry
            </p>
          </div>

          {/* Stress Indicators */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-chart-1/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-foreground">Stress Markers</h3>
            </div>
            <div className="text-3xl text-chart-1 mb-2">{analysis.state_counts?.["Stress"] || 0}</div>
            <p className="text-sm text-muted-foreground">
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
          <h3 className="mb-4 text-foreground">Personalized Recommendations</h3>
          <div className="space-y-3">
            {/* {analysis.recommendations.map((rec, index) => ( */}
            {/* <motion.div
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
            ))} */}
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
          <div className="grid grid-cols-2 gap-4">
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
              Find Clinic
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
