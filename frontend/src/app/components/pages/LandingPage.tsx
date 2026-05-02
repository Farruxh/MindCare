import { motion } from "motion/react";
import { Brain, MessageCircle, ClipboardList, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export function LandingPage() {
  const navigate = useNavigate();
  useDocumentTitle("MindCare")
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Start Chat",
      description: "Connect with our AI therapist for personalized support",
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "Self-Assessment",
      description: "Evaluate your mental well-being with guided questions",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Meditation Exercises",
      description: "Find peace with guided relaxation techniques",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Clinic Locator",
      description: "Discover mental health professionals near you",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      {/* Navigation */}
      <nav className="px-6 py-5 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Brain className="w-7 h-7 text-primary" />
          <span className="text-xl tracking-tight text-foreground">MindCare</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex gap-3"
        >
          <button
            onClick={() => navigate("login")}
            className="px-5 py-2 rounded-xl text-foreground hover:bg-muted/50 transition-all duration-300 cursor-pointer border-border"
          >
            Login
          </button>
          <button
            onClick={() => navigate("signup")}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-sm cursor-pointer"
          >
            Sign Up
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          {...fadeInUp}
          className="text-center mb-16"
        >
          <h1 className="text-5xl mb-5 text-foreground tracking-tight">
            Your Mental Wellness,
            <br />
            <span className="text-primary">Our Priority</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional AI-powered support for your mental health journey.
            Accessible, private, and always here when you need us.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.button
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 text-left border border-border hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center gap-8 px-8 py-4 bg-card rounded-2xl shadow-sm border border-border">
          {/* <div className="inline-flex items-center gap-8 px-8 py-4 bg-card rounded-2xl shadow-sm border border-border"> */}
            <div className="text-center">
              <div className="text-2xl text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="hidden md:block w-px h-10 bg-border"></div>
            {/* <div className="w-px h-10 bg-border"></div> */}
            <div className="text-center">
              <div className="text-2xl text-primary mb-1">Private</div>
              <div className="text-sm text-muted-foreground">& Secure</div>
            </div>
            <div className="hidden md:block w-px h-10 bg-border"></div>

            {/* <div className="w-px h-10 bg-border"></div> */}
            <div className="text-center">
              <div className="text-2xl text-primary mb-1">Professional</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
