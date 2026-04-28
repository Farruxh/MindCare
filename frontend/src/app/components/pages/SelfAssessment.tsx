import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../context/AlertContext"
import Loader from "../loader/loader";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// PSS-10 (Perceived Stress Scale) — max score: 40
// GAD-7 (Generalized Anxiety Disorder) — max score: 21
// PHQ-9 (Patient Health Questionnaire) — max score: 27

const questionsByType = {
  stress: [
    "In the last month, how often have you been upset because of something that happened unexpectedly?",
    "In the last month, how often have you felt that you were unable to control the important things in your life?",
    "In the last month, how often have you felt nervous and stressed?",
    "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    "In the last month, how often have you felt that things were going your way?",
    "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    "In the last month, how often have you been able to control irritations in your life?",
    "In the last month, how often have you felt that you were on top of things?",
    "In the last month, how often have you been angered because of things that happened that were outside of your control?",
    "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
  ],
  anxiety: [
    "Feeling nervous, anxious, or on edge?",
    "Not being able to stop or control worrying?",
    "Worrying too much about different things?",
    "Trouble relaxing?",
    "Being so restless that it is hard to sit still?",
    "Becoming easily annoyed or irritable?",
    "Feeling afraid, as if something awful might happen?",
  ],
  depression: [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much?",
    "Feeling tired or having little energy?",
    "Poor appetite or overeating?",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    "Trouble concentrating on things, such as reading the newspaper or watching television?",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
    "Thoughts that you would be better off dead or of hurting yourself in some way?",
  ],
};

// ─── Answer Options (0–3 scale for all 3 scales) ──────────────────────────────
const options = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

// ─── Assessment Type Config ───────────────────────────────────────────────────
const assessmentTypes = [
  { id: "stress", label: "Stress", color: "bg-red-600" },
  { id: "anxiety", label: "Anxiety", color: "bg-gray-600" },
  { id: "depression", label: "Depression", color: "bg-blue-900" },
];

// ─── Severity Calculators (per official scale thresholds) ─────────────────────

function getStressSeverity(score: number): string {
  // PSS-10: 0-13 Low, 14-26 Moderate, 27-40 High
  if (score <= 13) return "Low";
  if (score <= 26) return "Moderate";
  return "High";
}

function getAnxietySeverity(score: number): string {
  // GAD-7: 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-21 Severe
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  return "Severe";
}

function getDepressionSeverity(score: number): string {
  // PHQ-9: 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-19 Moderately Severe, 20-27 Severe
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  if (score <= 19) return "Moderately Severe";
  return "Severe";
}

function getSeverityForType(type: string, score: number): string {
  if (type === "stress") return getStressSeverity(score);
  if (type === "anxiety") return getAnxietySeverity(score);
  if (type === "depression") return getDepressionSeverity(score);
  return "Unknown";
}

// ─── UI Styling per severity ──────────────────────────────────────────────────
function getSeverityStyle(severity: string) {
  const map: Record<string, { color: string; bgColor: string; message: string }> = {
    Minimal: { color: "text-green-600", bgColor: "bg-green-50", message: "You're doing well! Continue your healthy habits." },
    Low: { color: "text-green-600", bgColor: "bg-green-50", message: "Stress levels are manageable. Keep it up!" },
    Mild: { color: "text-yellow-600", bgColor: "bg-yellow-50", message: "Some concerns detected. Consider self-care practices." },
    Moderate: { color: "text-orange-600", bgColor: "bg-orange-50", message: "Noticeable symptoms. We recommend professional support." },
    High: { color: "text-orange-600", bgColor: "bg-orange-50", message: "High stress detected. Consider reaching out for support." },
    "Moderately Severe": { color: "text-red-500", bgColor: "bg-red-50", message: "Significant symptoms. Please consider professional help." },
    Severe: { color: "text-red-600", bgColor: "bg-red-50", message: "Significant concerns. Please consider reaching out to a professional." },
  };
  return map[severity] ?? map["Minimal"];
}

export function SelfAssessment() {
  const [loader, setLoader] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const isEmailPreference = JSON.parse(localStorage.getItem("isEmailPreference") ?? "true")
  const [answersByType, setAnswersByType] = useState<Record<string, number[]>>({})
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  const { setAlert } = useAlert()
  useDocumentTitle("Assessments | MindCare");

  const questionsWithTypes = selectedTypes.flatMap((type) =>
    questionsByType[type as keyof typeof questionsByType].map((q) => ({ question: q, type }))
  );

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const startAssessment = () => {
    if (selectedTypes.length === 0) return;
    setStarted(true);
    const initialAnswers: Record<string, number[]> = {};
    selectedTypes.forEach((type) => { initialAnswers[type] = []; });
    setAnswersByType(initialAnswers);
  };

  const handleAnswer = async (value: number) => {
    const { type } = questionsWithTypes[currentQuestion];
    const updatedAnswers = { ...answersByType, [type]: [...answersByType[type], value] };
    setAnswersByType(updatedAnswers);

    if (currentQuestion < questionsWithTypes.length - 1) {
      setTimeout(() => setCurrentQuestion((q) => q + 1), 300);
    } else {
      const scores: Record<string, number> = {};
      const severities: Record<string, string> = {};
      selectedTypes.forEach((t) => {
        const answers = updatedAnswers[t] || [];
        scores[t] = answers.reduce((sum, val) => sum + val, 0);
        severities[t] = getSeverityForType(t, scores[t]);
      });

      await handleSaveResults(scores, severities);
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleSaveResults = async (
    scores: Record<string, number>,
    severities: Record<string, string>,
  ) => {
    const payload = {
      anxiety_score: scores["anxiety"] ?? null,
      anxiety_severity: severities["anxiety"] ?? null,
      depression_score: scores["depression"] ?? null,
      depression_severity: severities["depression"] ?? null,
      stress_score: scores["stress"] ?? null,
      stress_severity: severities["stress"] ?? null,
      isEmailPreference: isEmailPreference
    };

    try {
      console.log(isEmailPreference);
      setLoader(true)
      const [res] = await Promise.all([
        axios.post("/api/v1/assessments/create", payload, { withCredentials: true }),
        axios.post("/api/v1/users/recent-activity/create", { activity_type: "Completed Mental Health Assessment" }, { withCredentials: true })
      ])
      setAlert({ message: res.data.message || "Assessment results saved successfully!", severity: "success" })
    } catch (error: any) {
      setAlert({ message: error.response?.data?.message || "Failed to save assessment results. ", severity: "error" })
    } finally {
      setLoader(false)
    }
  };

  const handleOnMapClick = () => {
    try {
      setLoader(true)
      navigate("/clinics")
    } finally {
      setLoader(false)
    }
  }

  if (!started) {
    return (
      <div className="min-h-screen background">
        {loader && <Loader />}

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

        <div className="max-w-2xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-lg border border-border p-8"
          >
            <h2 className="text-2xl mb-3 text-center">Self-Assessment</h2>
            <p className="text-muted-foreground text-center mb-8">
              Select one or more areas you'd like to assess
            </p>

            <div className="space-y-4 mb-8">
              {assessmentTypes.map((type, index) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleType(type.id)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${type.color} text-white p-4 rounded-xl w-14 h-14 flex items-center justify-center text-lg font-bold`}>
                        {type.label[0]}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-foreground mb-1">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.id === "stress" && "PSS-10 · 10 questions"}
                          {type.id === "anxiety" && "GAD-7 · 7 questions"}
                          {type.id === "depression" && "PHQ-9 · 9 questions"}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <button
              onClick={startAssessment}
              disabled={selectedTypes.length === 0}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              Start Assessment ({selectedTypes.length} selected)
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scores: Record<string, number> = {};
    const severities: Record<string, string> = {};

    selectedTypes.forEach((type) => {
      const answers = answersByType[type] || [];
      scores[type] = answers.reduce((sum, val) => sum + val, 0);
      severities[type] = getSeverityForType(type, scores[type]);
    });

    const hasSevereResult = Object.values(severities).some(s =>
      ["Severe", "Moderately Severe", "High"].includes(s)
    );

    return (
      <div className="min-h-screen background">
        {loader && <Loader />}
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

        <div className="max-w-3xl mx-auto px-6 py-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-block"
            >
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl mb-2">Assessment Complete</h2>
            <p className="text-muted-foreground">Here are your results for each category</p>
          </motion.div>

          {/* Per-condition results */}
          <div className="space-y-6 mb-8">
            {selectedTypes.map((type, index) => {
              const typeConfig = assessmentTypes.find((t) => t.id === type)!;
              const score = scores[type];
              const maxScore = questionsByType[type as keyof typeof questionsByType].length * 3;
              const percentage = (score / maxScore) * 100;
              const severity = severities[type];
              const style = getSeverityStyle(severity);

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-card rounded-2xl shadow-lg border border-border p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`${typeConfig.color} text-white p-3 rounded-xl w-12 h-12 flex items-center justify-center font-bold`}>
                      {typeConfig.label[0]}
                    </div>
                    <div>
                      <h3 className="text-xl text-foreground">{typeConfig.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {type === "stress" ? "PSS-10" : type === "anxiety" ? "GAD-7" : "PHQ-9"} Results
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Score Circle */}
                    <div className="flex justify-center items-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
                          <motion.circle
                            cx="64" cy="64" r="56"
                            stroke="currentColor" strokeWidth="10" fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
                            transition={{ duration: 1, ease: "easeOut", delay: index * 0.2 }}
                            className="text-primary"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl text-primary">{score}</div>
                            <div className="text-xs text-muted-foreground">/ {maxScore}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Severity */}
                    <div className="flex flex-col justify-center">
                      <div className={`${style.bgColor} rounded-xl p-4`}>
                        <div className={`text-lg mb-2 ${style.color}`}>{severity}</div>
                        <p className="text-sm text-muted-foreground">{style.message}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: selectedTypes.length * 0.2 + 0.2 }}
            className="bg-card rounded-2xl shadow-sm border border-border p-6"
          >
            <h4 className="mb-4 text-foreground text-center">What would you like to do next?</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={ () => navigate("/assistant") }
                className="py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 dark:hover:bg-muted/80 transition-all duration-300 cursor-pointer"
              >
                Talk to AI
              </button>
              <button
                onClick={hasSevereResult ? handleOnMapClick : undefined}
                disabled={!hasSevereResult}
                className={`py-3 rounded-xl transition-all duration-300 ${hasSevereResult
                  ? "bg-primary text-secondary-foreground hover:bg-primary/80 cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  }`}
              >
                Find Help
              </button>
            </div>
            {!hasSevereResult && (
              <p className="text-sm text-muted-foreground text-center mt-3">
                Professional help options are available for severe cases
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Question Screen ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen background">
      {loader && <Loader />}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-5 mb-4">
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
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questionsWithTypes.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentQuestion + 1) / questionsWithTypes.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questionsWithTypes.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-2xl shadow-lg border border-border p-8 mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            {questionsWithTypes[currentQuestion]?.type}
          </p>
          <h3 className="text-xl mb-6 text-foreground">
            {questionsWithTypes[currentQuestion]?.question}
          </h3>

          <div className="space-y-3">
            {options.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 text-left bg-muted/30 hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all duration-300 cursor-pointer"
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
