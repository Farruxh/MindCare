import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

interface DailyJournalProps {
  onNavigate: (page: string) => void;
}

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export function DailyJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"write" | "history">("write");
  const navigate = useNavigate()

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    // Check if there's a draft for today
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = savedEntries ? JSON.parse(savedEntries).find((e: JournalEntry) => e.date === today) : null;
    if (todayEntry) {
      setCurrentEntry(todayEntry.content);
    }
  }, []);

  const handleSubmit = () => {
    const today = new Date().toISOString().split("T")[0];
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      content: currentEntry
    };

    // Remove any existing entry for today before adding new one
    const filteredEntries = entries.filter(e => e.date !== today);
    const updatedEntries = [...filteredEntries, newEntry];
    
    setEntries(updatedEntries);
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const canViewReport = entries.length >= 7;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard") }
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-xl">Daily Journal</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* View Toggle & Weekly Report Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("write")}
              className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                viewMode === "write"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              How Was My Day
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                viewMode === "history"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              History ({entries.length})
            </button>
          </div>

          <button
            // onClick={() => onNavigate("weekly-report")}
            disabled={!canViewReport}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              canViewReport
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Weekly Report
            {!canViewReport && <span className="text-xs">({entries.length}/7)</span>}
          </button>
        </div>

        {/* Write Entry View */}
        {viewMode === "write" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Date Display */}
            <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
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
                className="bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden relative"
                style={{
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)"
                }}
              >
                {/* Red Margin Line */}
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300/40 z-10"></div>
                
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
                <div className="relative p-12 pl-20">
                  <textarea
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                    placeholder="Dear Diary,

Write about your day here..."
                    className="w-full h-96 bg-transparent border-none resize-none focus:outline-none text-slate-800 placeholder:text-slate-400"
                    style={{
                      fontFamily: "'Merriweather', serif",
                      fontSize: "16px",
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
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Submit
                </button>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-primary rounded-2xl px-8 py-4 shadow-2xl"
                >
                  <p className="text-primary text-center">Entry saved successfully!</p>
                </motion.div>
              )}
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
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-md border border-slate-200 p-8 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{formatDate(entry.date)}</span>
                    </div>
                    <p 
                      className="text-slate-700 whitespace-pre-wrap"
                      style={{
                        fontFamily: "'Merriweather', serif",
                        fontSize: "15px",
                        lineHeight: "1.8"
                      }}
                    >
                      {entry.content}
                    </p>
                  </motion.div>
                ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}