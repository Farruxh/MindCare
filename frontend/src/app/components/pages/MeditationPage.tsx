import { motion } from "motion/react";
import { ArrowLeft, Play, Pause, Wind, Headphones, Heart, Waves } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"

interface MeditationPageProps {
  onNavigate: (page: string) => void;
}

export function MeditationPage() {
  const [activeTab, setActiveTab] = useState<"breathing" | "meditation" | "audio" | "grounding">("breathing");
  const [breathingActive, setBreathingActive] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const navigate = useNavigate()

  const audioTracks = [
    { id: 1, title: "Ocean Waves", duration: "10 min", description: "Gentle ocean sounds for relaxation" },
    { id: 2, title: "Rain Forest", duration: "15 min", description: "Peaceful rainforest ambience" },
    { id: 3, title: "Mountain Stream", duration: "12 min", description: "Flowing water and nature sounds" },
    { id: 4, title: "Night Crickets", duration: "20 min", description: "Calming evening soundscape" }
  ];

  const meditations = [
    { title: "Body Scan", duration: "10 min", difficulty: "Beginner" },
    { title: "Mindful Awareness", duration: "15 min", difficulty: "Intermediate" },
    { title: "Loving Kindness", duration: "12 min", difficulty: "Beginner" },
    { title: "Breath Focus", duration: "8 min", difficulty: "All Levels" }
  ];

  const groundingTechniques = [
    {
      title: "5-4-3-2-1 Technique",
      description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
      steps: ["Look around and name 5 things you can see", "Notice 4 things you can touch", "Listen for 3 things you can hear", "Identify 2 things you can smell", "Name 1 thing you can taste"]
    },
    {
      title: "Square Breathing",
      description: "Breathe in a pattern of 4 counts to calm your nervous system.",
      steps: ["Breathe in for 4 counts", "Hold for 4 counts", "Breathe out for 4 counts", "Hold for 4 counts", "Repeat 4 times"]
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Tense and relax different muscle groups to release physical tension.",
      steps: ["Start with your toes, tense for 5 seconds", "Release and notice the relaxation", "Move up to your calves", "Continue through each muscle group", "End with your face and head"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-foreground">Meditation & Relaxation</h2>
            <p className="text-sm text-muted-foreground">Find your inner peace</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: "breathing", label: "Breathing", icon: <Wind className="w-4 h-4" /> },
            { id: "meditation", label: "Guided Meditation", icon: <Heart className="w-4 h-4" /> },
            { id: "audio", label: "Relaxing Audio", icon: <Headphones className="w-4 h-4" /> },
            { id: "grounding", label: "Grounding", icon: <Waves className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Breathing Exercise */}
        {activeTab === "breathing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
              <h3 className="text-2xl mb-4 text-foreground">Deep Breathing Exercise</h3>
              <p className="text-muted-foreground mb-8">
                Follow the circle to regulate your breathing and calm your mind
              </p>

              {/* Breathing Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64">
                  <motion.div
                    animate={
                      breathingActive
                        ? {
                            scale: [1, 1.3, 1.3, 1],
                            opacity: [0.3, 0.6, 0.6, 0.3]
                          }
                        : { scale: 1, opacity: 0.3 }
                    }
                    transition={
                      breathingActive
                        ? {
                            duration: 16,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        : {}
                    }
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={
                        breathingActive
                          ? {
                              opacity: [0, 1, 1, 1, 0]
                            }
                          : { opacity: 1 }
                      }
                      transition={
                        breathingActive
                          ? {
                              duration: 16,
                              repeat: Infinity,
                              times: [0, 0.25, 0.5, 0.75, 1]
                            }
                          : {}
                      }
                      className="text-2xl text-foreground"
                    >
                      {breathingActive ? "Breathe" : "Ready"}
                    </motion.div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBreathingActive(!breathingActive)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm"
              >
                {breathingActive ? "Stop" : "Start Exercise"}
              </button>

              <div className="mt-8 p-4 bg-muted/30 rounded-xl text-left">
                <h4 className="mb-2 text-foreground">Instructions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Breathe in slowly as the circle expands (4 seconds)</li>
                  <li>• Hold your breath as it stays large (4 seconds)</li>
                  <li>• Breathe out slowly as it contracts (4 seconds)</li>
                  <li>• Hold as it stays small (4 seconds)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Guided Meditation */}
        {activeTab === "meditation" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {meditations.map((meditation, index) => (
              <motion.div
                key={meditation.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-foreground mb-1">{meditation.title}</h4>
                    <p className="text-sm text-muted-foreground">{meditation.difficulty}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {meditation.duration}
                  </span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300">
                  <Play className="w-4 h-4" />
                  Start Session
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Relaxing Audio */}
        {activeTab === "audio" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {audioTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Headphones className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-foreground mb-1">{track.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{track.duration}</span>
                      <button
                        onClick={() => setAudioPlaying(audioPlaying === track.id ? null : track.id)}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300"
                      >
                        {audioPlaying === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Grounding Techniques */}
        {activeTab === "grounding" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {groundingTechniques.map((technique, index) => (
              <motion.div
                key={technique.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-sm border border-border p-6"
              >
                <h4 className="text-foreground mb-2">{technique.title}</h4>
                <p className="text-muted-foreground mb-4">{technique.description}</p>
                <div className="space-y-2">
                  {technique.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                        {stepIndex + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
