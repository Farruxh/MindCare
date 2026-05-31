import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Calendar, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { useAlert } from "../../context/AlertContext";
import Loader from "../loader/loader";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import axios from "axios";

interface JournalEntry {
  content: string;
  created_at: string;
}

export function DailyJournal() {
  useDocumentTitle("Daily Journal | MindCare");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [viewMode, setViewMode] = useState<"write" | "history">("write");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const [seeAll, setSeeAll] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoader(true);
        const res = await axios.get("/api/v1/journal/all", { withCredentials: true });
        setEntries(res.data.data ?? []);
      } catch (error: any) {
        setAlert({ message: error.response?.data?.detail || "Failed to load journal entries.", severity: "error" });
      } finally {
        setLoader(false);
      }
    };
    fetchEntries();
  }, []);

  const handleSubmit = async () => {
    if (!currentEntry.trim()) return;

    try {
      setLoader(true);
      const [res] = await Promise.all([
        axios.post("/api/v1/journal/create", {
          content: currentEntry
        }, { withCredentials: true }),
        axios.post("/api/v1/users/recent-activity/create", { activity_type: "Created a journal entry" }, { withCredentials: true })
      ]);

      setAlert({ message: res.data?.message || "Entry saved successfully!", severity: "success" });
      setCurrentEntry("");

      // Refresh entries list to show the new/appended entry in history
      const entriesRes = await axios.get("/api/v1/journal/all", { withCredentials: true });
      setEntries(entriesRes.data.data ?? []);

    } catch (error: any) {
      setAlert({ message: error.response?.data?.detail || "Failed to save entry.", severity: "error" });
    } finally {
      setLoader(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <div className="background">
      {loader && <Loader />}
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* View Toggle & Weekly Report Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("write")}
              className={`px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer w-full sm:w-auto ${viewMode === "write"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              How Was My Day
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer w-full sm:w-auto ${viewMode === "history"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              History ({entries.length})
            </button>
          </div>

          <button
            onClick={() => navigate("/weekly-report")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 w-full sm:w-auto ${"bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer"
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            Weekly Report
          </button>
        </div>

        {/* Write Entry View */}
        {viewMode === "write" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Date Display */}
            <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span className="text-lg">{new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}</span>
            </div>

            {/* Notebook Style Journal */}
            <div className="relative">
              {/* Notebook Paper Effect */}
              <div
                className="bg-input-background rounded-lg shadow-2xl border overflow-hidden relative"
                style={{
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)"
                }}
              >
                {/* Red Margin Line */}
                <div className="sm:absolute left-16 top-0 bottom-0 w-0.5 bg-red-300/40 z-10"></div>

                {/* Ruled Lines Background */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 39px, #cbd5e1 39px, #cbd5e1 40px)",
                    backgroundSize: "100% 40px",
                    backgroundPosition: "0 12px",
                    opacity: 0.5
                  }}
                ></div>

                {/* Writing Area */}
                <div className="relative p-12 sm:pl-20">
                  <textarea
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                    placeholder="Dear Diary,

Write about your day here..."
                    className="w-full h-96 bg-transparent border-none resize-none focus:outline-none text-slate-800 placeholder:text-slate-400"
                    style={{
                      color: "var(--foreground)",
                      lineHeight: "40px",
                      letterSpacing: "0.01em",
                      paddingTop: "0px"
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!currentEntry.trim()}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* History View */}
        {viewMode === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {entries.length === 0 ? (
              <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl mb-2 text-foreground">No entries yet</h3>
                <p className="text-muted-foreground">Start writing your first journal entry today!</p>
              </div>
            ) : (
              [...entries]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, seeAll ? entries.length : 4)
                .map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-input-background rounded-md shadow-md border p-8 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{formatDate(entry.created_at)}</span>
                    </div>
                    <p
                      className="text-foreground whitespace-pre-wrap"
                      style={{
                        fontSize: "15px",
                        lineHeight: "1.8"
                      }}
                    >
                      {entry.content}
                    </p>
                  </motion.div>
                ))
            )}
            {entries.length > 4 && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ layout: { duration: 0.4, ease: "easeInOut" }, duration: 0.4 }}
              className="mt-6 text-center"
            >
              <motion.button
                onClick={() =>{ 
                  setSeeAll(prev => !prev);
                }}
                className="inline-flex items-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all duration-300 cursor-pointer"
              >
                {seeAll ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
                {seeAll ? "See Less" : "See All" }
              </motion.button>
            </motion.div>
            )}
          </motion.div>
          
        )}
      </div>
    </div>
  );
}