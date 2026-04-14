import { motion } from "motion/react";
import { ArrowLeft, Play, Pause, Wind, Headphones, Heart, Waves } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

export function MeditationPage() {
  const [activeTab, setActiveTab] = useState<"breathing" | "meditation" | "audio" | "grounding">("breathing");
  const [breathingActive, setBreathingActive] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const toggleSession = (title: string) => {
    if (activeSession === title) {
      setActiveSession(null);
      setSessionTimeElapsed(0);
    } else {
      setActiveSession(title);
      setSessionTimeElapsed(0);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const audioTracks = [
    { 
      id: 1, 
      title: "Ocean Waves", 
      duration: "10 min", 
      description: "Gentle ocean sounds for relaxation",
      src: "/audio/Ocean_waves.wav"
    },
    { 
      id: 2, 
      title: "Rain Forest", 
      duration: "15 min", 
      description: "Peaceful rainforest ambience",
      src: "/audio/Rain_forest.wav"
    },
    { 
      id: 3, 
      title: "Mountain Stream", 
      duration: "12 min", 
      description: "Flowing water and nature sounds",
      src: "/audio/Mountain_stream.wav"
    },
    { 
      id: 4, 
      title: "Forest Birds", 
      duration: "20 min", 
      description: "Calming bird songs in a forest setting",
      src: "/audio/Forest_birds.wav"
    },
    {
      id: 5,
      title: "Rain and Thunder",
      duration: "15 min",
      description: "Relaxing rain with distant thunder",
      src: "/audio/rain_thunder.wav"
    },
    {
      id: 6,
      title: "Sea waves",
      duration: "10 min",
      description: "Soothing sea waves crashing on the shore",
      src: "/audio/sea_waves.wav"
    }
  ];

  const sessions = {
  "body-scan": {
    title: "Body Scan",
    duration: 600, // 10 min
    steps: [
      { time: 0,   text: "Find a comfortable position and gently close your eyes." },
      { time: 30,  text: "Take three deep breaths. Inhale slowly... and exhale." },
      { time: 60,  text: "Bring your attention to the top of your head. Notice any sensations." },
      { time: 120, text: "Slowly move your awareness down to your forehead and eyes. Relax any tension." },
      { time: 180, text: "Shift focus to your neck and shoulders. Let them drop and soften." },
      { time: 240, text: "Move attention to your chest. Feel it rise and fall with each breath." },
      { time: 300, text: "Bring awareness to your stomach. Notice any tightness and let it go." },
      { time: 360, text: "Focus on your hands and arms. Feel the weight of them resting." },
      { time: 420, text: "Move down to your legs and feet. Notice any sensations without judgment." },
      { time: 480, text: "Now scan your entire body as one. You are fully relaxed." },
      { time: 540, text: "Take a deep breath. Slowly bring your awareness back to the room." },
      { time: 580, text: "Gently open your eyes. Your session is almost complete." },
    ]
  },

  "mindful-awareness": {
    title: "Mindful Awareness",
    duration: 600,
    steps: [
      { time: 0,   text: "Sit comfortably and gently close your eyes." },
      { time: 30,  text: "Begin to notice your breath. Don't control it — just observe." },
      { time: 90,  text: "Notice the sounds around you without labeling them. Just listen." },
      { time: 150, text: "If thoughts arise, acknowledge them and gently return to your breath." },
      { time: 210, text: "Notice the feeling of air on your skin. Stay present." },
      { time: 270, text: "Observe any emotions you feel right now without judgment." },
      { time: 330, text: "Bring awareness to this present moment. Nothing to fix, nowhere to be." },
      { time: 390, text: "Notice the stillness beneath all the noise. Rest in it." },
      { time: 450, text: "Your mind may wander — that is okay. Gently return each time." },
      { time: 510, text: "Take a slow deep breath. Feel fully present and aware." },
      { time: 570, text: "Begin to gently return. Wiggle your fingers and slowly open your eyes." },
    ]
  },

  "loving-kindness": {
    title: "Loving Kindness",
    duration: 600,
    steps: [
      { time: 0,   text: "Sit comfortably. Place one hand gently over your heart." },
      { time: 40,  text: "Take a deep breath and bring your attention inward." },
      { time: 90,  text: "Silently repeat: 'May I be happy. May I be healthy. May I be at peace.'" },
      { time: 150, text: "Feel warmth growing in your chest with each repetition." },
      { time: 210, text: "Now think of someone you love. Send them the same warmth." },
      { time: 270, text: "'May you be happy. May you be healthy. May you be at peace.'" },
      { time: 330, text: "Expand this feeling to your friends and family." },
      { time: 390, text: "Now extend it to people you don't know — strangers everywhere." },
      { time: 450, text: "Even extend it to those who have hurt you. Wish them peace." },
      { time: 510, text: "Finally, expand this love to all living beings on earth." },
      { time: 570, text: "Take a deep breath. Feel the warmth. Slowly open your eyes." },
    ]
  },

  "breath-focus": {
    title: "Breath Focus",
    duration: 300, // 5 min
    steps: [
      { time: 0,   text: "Sit upright and close your eyes gently." },
      { time: 20,  text: "Breathe in through your nose for 4 counts... 1, 2, 3, 4." },
      { time: 50,  text: "Hold gently for 4 counts... 1, 2, 3, 4." },
      { time: 80,  text: "Exhale slowly for 4 counts... 1, 2, 3, 4." },
      { time: 110, text: "Hold for 4 counts... 1, 2, 3, 4. This is Box Breathing." },
      { time: 150, text: "Continue this rhythm. Inhale... hold... exhale... hold." },
      { time: 200, text: "If your mind wanders, return to counting your breath." },
      { time: 240, text: "Feel your body becoming calmer with each cycle." },
      { time: 270, text: "Two more cycles. Breathe in... hold... out... hold." },
      { time: 285, text: "Take one final deep breath. Hold. And slowly release." },
    ]
  },
  "progressive-relaxation": {
    title: "Progressive Relaxation",
    duration: 600,
    steps: [
      { time: 0,   text: "Lie down or sit comfortably. Close your eyes." },
      { time: 30,  text: "Take three slow deep breaths. Let your body settle." },
      { time: 70,  text: "Tense your feet tightly for 5 seconds... now release. Feel the difference." },
      { time: 130, text: "Tense your calves for 5 seconds... and release. Let them go soft." },
      { time: 190, text: "Tense your thighs for 5 seconds... and release. Feel them relax." },
      { time: 250, text: "Tense your stomach muscles for 5 seconds... and release." },
      { time: 310, text: "Squeeze your hands into fists for 5 seconds... and release." },
      { time: 370, text: "Tense your shoulders up to your ears for 5 seconds... and release." },
      { time: 430, text: "Scrunch your face tightly for 5 seconds... and release. Soften everything." },
      { time: 490, text: "Your whole body is now relaxed. Breathe slowly and enjoy this stillness." },
      { time: 550, text: "Take one final deep breath. Slowly bring awareness back to the room." },
      { time: 585, text: "Gently open your eyes. You have completed your session." },
    ]
  },

  "visualization": {
    title: "Calm Place Visualization",
    duration: 600,
    steps: [
      { time: 0,   text: "Close your eyes and take a few slow deep breaths." },
      { time: 40,  text: "Imagine a place where you feel completely safe and peaceful." },
      { time: 90,  text: "It could be a beach, a forest, a garden — anywhere that feels calm." },
      { time: 150, text: "Look around this place. What do you see? Notice the colors and light." },
      { time: 210, text: "What sounds do you hear? Waves, wind, birds — just notice them." },
      { time: 270, text: "Feel the ground beneath you. Is it warm sand, soft grass, cool stone?" },
      { time: 330, text: "Take a deep breath — what do you smell in this place?" },
      { time: 390, text: "Feel completely safe here. Nothing can disturb you in this moment." },
      { time: 450, text: "Stay in this place for a little longer. You are at peace." },
      { time: 510, text: "Know that you can return to this place whenever you need calm." },
      { time: 560, text: "Take a deep breath. Begin to bring your awareness back slowly." },
      { time: 585, text: "Gently open your eyes. Carry this peace with you." },
    ]
  }
};

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
    <div className="min-h-screen background"> 
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
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
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
                <div className="relative w-48 h-48 md:w-64 md:h-64">
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
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 transition-all duration-300 shadow-sm cursor-pointer"
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
            {Object.values(sessions).map((sessionData, index) => {
              const isActive = activeSession === sessionData.title;
              const remainingTime = Math.max(0, sessionData.duration - sessionTimeElapsed);
              
              let currentText = "";
              let currentStepTime = 0;

              if (isActive) {
                const currentStep = [...sessionData.steps].reverse().find(s => s.time <= sessionTimeElapsed);
                const nextStep = sessionData.steps.find(s => s.time > sessionTimeElapsed);

                if (currentStep) {
                  currentText = currentStep.text;
                  const nextTime = nextStep ? nextStep.time : sessionData.duration;
                  currentStepTime = nextTime - sessionTimeElapsed;
                }
              }

              return (
                <motion.div
                  key={sessionData.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-foreground mb-1">{sessionData.title}</h4>
                      <p className="text-sm text-muted-foreground">{Math.floor(sessionData.duration / 60)} min session</p>
                      {isActive && currentText && (
                        <p className="text-sm font-medium text-foreground mt-4 transition-opacity duration-300">
                          {currentText} ({currentStepTime} secs)
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-foreground rounded-full text-sm whitespace-nowrap">
                      {isActive ? formatTime(remainingTime) : `${Math.floor(sessionData.duration / 60)} min`}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleSession(sessionData.title)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
                  >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isActive ? "Stop Session" : "Start Session"}
                  </button>
                </motion.div>
              );
            })}
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
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 text-center lg:text-left">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Headphones className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className="text-foreground mb-1">{track.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
                    <div className="flex flex-col gap-3 mt-2">
                      {track.src && (
                        <audio controls src={track.src} className="w-full h-10" />
                      )}
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
