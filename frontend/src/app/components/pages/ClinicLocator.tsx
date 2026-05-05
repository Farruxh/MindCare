import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MapPin, Phone, ExternalLink, Home } from "lucide-react";
import { useState } from "react";
import Loader from "../loader/loader";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"
import useDocumentTitle from "../../hooks/useDocumentTitle";


interface Clinic {
  name: string;
  address: string;
  phone: string;
  mapUrl: string;
}

export function ClinicLocator() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loader, setIsLoader] = useState(false)
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const { setAlert } = useAlert();
  const { user } = useAuth();
  useDocumentTitle("Clinic Locator | MindCare");

  const handleCurrentLocationSearch = () => {
    if (!navigator.geolocation) {
      setAlert({ message: "Geolocation is not supported by your browser.", severity: "error" })
      return;
    }
    setIsLoader(true)
    setClinics([]);
    setSearchQuery("Your Location");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const [res] = await Promise.all([
            axios.get("/api/v1/clinics/nearest", {params: { user_lat: latitude, user_lon: longitude }, withCredentials: true}),
            axios.post("/api/v1/users/recent-activity/create", { activity_type: "Searched nearby clinics" }, { withCredentials: true })
          ])
          const data = res.data.data;

          if (data && data.length > 0) {
            setClinics(
              data.map((clinic: any) => ({
                name: clinic.name,
                address: clinic.location,
                phone: clinic.contact_no,
                mapUrl: `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
              }))
            );
          } else {
            setAlert({ message: "We couldn't find any clinics near your location.", severity: "error" })
          }
        } catch (error) {
          console.error("Error fetching nearest clinics:", error);
          setAlert({ message: "Sorry, there was an error fetching clinics near your location.", severity: "error" })
        } finally {
          setIsLoader(false)
        }
      },
      (error) => {
        console.error("Error getting location: ", error);
        setIsLoader(false)
        setAlert({ message: "Unable to retrieve your location. Please check your browser permissions.", severity: "error" })
      }
    );
  };

  const handleStoredLocationSearch = async () => {
    const lat = user?.latitude;
    const lon = user?.longitude;

    if (!lat || !lon) {
      setAlert({ message: "No stored location found in your profile.", severity: "error" });
      return;
    }

    setIsLoader(true);
    setClinics([]);
    setSearchQuery("Your Stored Location");

    try {
      const [res] = await Promise.all([
        axios.get("/api/v1/clinics/nearest", {
        params: { user_lat: lat, user_lon: lon },
        withCredentials: true}), 
        axios.post("/api/v1/users/recent-activity/create", { activity_type: "Searched nearby clinics" }, { withCredentials: true })
      ])
      const data = res.data.data;

      if (data && data.length > 0) {
        setClinics(
          data.map((clinic: any) => ({
            name: clinic.name,
            address: clinic.location,
            phone: clinic.contact_no,
            mapUrl: `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
          }))
        );
      } else {
        setAlert({ message: "We couldn't find any clinics near your stored location.", severity: "error" });
      }
    } catch (error) {
      console.error("Error fetching nearest clinics:", error);
      setAlert({ message: "Sorry, there was an error fetching clinics near your stored location.", severity: "error" });
    } finally {
      setIsLoader(false);
    }
  };

  return (
    <div className="h-screen background flex flex-col">
      {/* Header */}
      {loader && <Loader />}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center gap-4 shadow-sm shrink-0"
      >
        <button
          onClick={() => navigate("/dashboard")}
          title="Dashboard"
          className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <MapPin className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-foreground">Clinic Locator</h2>
            <p className="text-sm text-muted-foreground">Find Professional help near you</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {searchQuery && clinics.length > 0 && (
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-foreground">Showing clinics near your location</h3>
              <p className="text-muted-foreground text-sm">We found {clinics.length} options for you</p>
            </div>
          )}

          {clinics.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <MapPin className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground/70 mb-2">Find Professional Mental Health Support</h3>
              <p className="text-center max-w-sm">Choose an option to find clinics near your current or saved location</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {clinics.map((clinic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:border-secondary/30"
                >
                  <h4 className="text-foreground font-semibold mb-3 group-hover:text-secondary transition-colors">{clinic.name}</h4>
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="p-2 bg-secondary/10 rounded-lg shrink-0">
                        <MapPin className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="mt-1 leading-relaxed">{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-2 bg-secondary/10 rounded-lg shrink-0">
                        <Phone className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="font-medium">{clinic.phone}</span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-auto">
                    <a
                      href={clinic.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all duration-300 text-sm font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Map
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-sm border-t border-border px-6 py-4 shrink-0"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={handleCurrentLocationSearch}
            className="px-6 py-3 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border border-accent/20 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer flex-1"
          >
            <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Find Clinics NearBy My Current Location</span>
          </button>
          <button
            onClick={handleStoredLocationSearch}
            className="px-6 py-3 bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground border border-secondary/20 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer flex-1"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Find Clinics NearBy My Stored Location</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}