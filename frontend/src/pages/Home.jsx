import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, Bot, Heart, Phone, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 10000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Location error:", error);
          setLocationLoading(false);
        }
      );
    }
  };

  const handleSOS = async () => {
    setIsEmergency(true);
    
    // Play alert sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn77RgGwU7k9n0yXElBSh+zPDajzsKElyx6OyrWBUIQ5zf8sFuJAUtgs/z2Ik3Bxtpve/im0oMAU6r6PG0YBwGPJPZ88p0JAUpfsrw2I49CxFbsOjuqlgVB0Se4PO+bSMFL4HO8tiKOAcaab3v45xPDBBOqufwtGAcBT2T2fPJdSQFKX7K8NiNPgsRW7Hn7qpYFgdEnuDzvm0jBS+BzvLYijgHGmm97+OcTwwPTqvn8LRgHAU9k9nzyXUkBSl+yvDYjT4LEVux5+6qWBYHRJ7g875tIwUvgc7y2Io4Bxppve/jnE8MD06r5/C0YBwFPZPZ88l1JAUpfsrw2I0+CxFbsefuqlgWB0Se4PO+bSMFL4HO8tiKOAcaab3v45xPDA9Oq+fwtGAcBT2T2fPJdSQFKX7K8NiNPgsRW7Hn7qpYFgdEnuDzvm0jBS+BzvLYijgHGmm97+OcTwwPTqvn8LRgHAU9k9nzyXUkBSl+yvDYjT4LEVux5+6qWBYHRJ7g875tIwUvgc7y2Io4Bxppve/jnE8MD06r5/C0YBwFPZPZ88l1JAUpfsrw2I0+CxFbsefuqlgWB0Se4PO+bSMFL4HO8tiKOAcaab3v45xPDA9Oq+fwtGAcBT2T2fPJdSQFKX7K8NiNPgsRW7Hn7qpYFgdEnuDzvm0jBS+BzvLYijgHGmm97+OcTwwPTqvn8LRgHAU9k9nzyXUkBSl+yvDYjT4LEVux5+6qWBYHRJ7g875tIwUvgc7y');
    audio.play().catch(() => {});

    if (location) {
      const message = `🆘 EMERGENCY ALERT\n\nI need help!\n\nLocation:\nLatitude: ${location.lat}\nLongitude: ${location.lng}\n\nGoogle Maps: https://www.google.com/maps?q=${location.lat},${location.lng}`;
      
      // Save to database
      try {
        await axios.post(`${API}/sos-alert`, {
          latitude: location.lat,
          longitude: location.lng,
        });
        toast.success("Emergency alert sent!", {
          description: "Your location has been recorded"
        });
      } catch (error) {
        console.error("Error saving alert:", error);
        toast.error("Failed to save alert");
      }

      // Show alert to user
      alert(message);
      console.log(message);
    } else {
      toast.error("Location not available", {
        description: "Please enable location services"
      });
    }

    setTimeout(() => setIsEmergency(false), 3000);
  };

  return (
    <div className={`min-h-screen ${isEmergency ? 'emergency-flash' : ''}`}>
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LifeSaver</h1>
              <p className="text-xs text-gray-500">Emergency Help Platform</p>
            </div>
          </div>
          <button
            data-testid="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg btn-transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-20 right-4 z-40 w-64 glass rounded-2xl shadow-xl p-6"
          >
            <nav className="space-y-3">
              <button
                data-testid="nav-map-button"
                onClick={() => { navigate('/map'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl btn-transition text-left"
              >
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Live Location</span>
              </button>
              <button
                data-testid="nav-chat-button"
                onClick={() => { navigate('/chat'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl btn-transition text-left"
              >
                <Bot className="w-5 h-5 text-green-600" />
                <span className="font-medium">AI Assistant</span>
              </button>
              <button
                data-testid="nav-medical-button"
                onClick={() => { navigate('/medical'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl btn-transition text-left"
              >
                <Heart className="w-5 h-5 text-red-600" />
                <span className="font-medium">Medical Info</span>
              </button>
              <button
                data-testid="nav-contacts-button"
                onClick={() => { navigate('/contacts'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl btn-transition text-left"
              >
                <Phone className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Contacts</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Help is One Tap Away
            </h2>
            <p className="text-lg text-gray-600">
              Instantly alert your contacts and get AI-powered emergency guidance
            </p>
          </motion.div>

          {/* SOS Button */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <button
              data-testid="sos-button"
              onClick={handleSOS}
              className="relative w-64 h-64 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl btn-transition sos-pulse hover:shadow-red-500/50 flex flex-col items-center justify-center group"
            >
              <AlertTriangle className="w-24 h-24 text-white mb-4 group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }} />
              <span className="text-3xl font-bold text-white">SOS</span>
              <span className="text-sm text-white/80 mt-2">Press for Help</span>
            </button>
          </motion.div>

          {/* Location Display */}
          {location && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Your Current Location</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Latitude: {location.lat.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Longitude: {location.lng.toFixed(6)}
                  </p>
                  <a
                    data-testid="google-maps-link"
                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <button
              data-testid="quick-map-button"
              onClick={() => navigate('/map')}
              className="glass p-6 rounded-2xl hover:shadow-lg btn-transition text-left group"
            >
              <MapPin className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }} />
              <h3 className="font-semibold text-gray-900 mb-1">Live Map</h3>
              <p className="text-sm text-gray-600">Track your location in real-time</p>
            </button>

            <button
              data-testid="quick-chat-button"
              onClick={() => navigate('/chat')}
              className="glass p-6 rounded-2xl hover:shadow-lg btn-transition text-left group"
            >
              <Bot className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }} />
              <h3 className="font-semibold text-gray-900 mb-1">AI Assistant</h3>
              <p className="text-sm text-gray-600">Get emergency guidance instantly</p>
            </button>

            <button
              data-testid="quick-medical-button"
              onClick={() => navigate('/medical')}
              className="glass p-6 rounded-2xl hover:shadow-lg btn-transition text-left group"
            >
              <Heart className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }} />
              <h3 className="font-semibold text-gray-900 mb-1">Medical Info</h3>
              <p className="text-sm text-gray-600">Store your health details</p>
            </button>

            <button
              data-testid="quick-contacts-button"
              onClick={() => navigate('/contacts')}
              className="glass p-6 rounded-2xl hover:shadow-lg btn-transition text-left group"
            >
              <Phone className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }} />
              <h3 className="font-semibold text-gray-900 mb-1">Emergency Contacts</h3>
              <p className="text-sm text-gray-600">Manage your safety network</p>
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500">
        <p>LifeSaver - Built for Emergent X TPF Vibe Sprint 2 Hackathon</p>
        <p className="mt-1">Stay safe, help is always nearby</p>
      </footer>
    </div>
  );
};

export default Home;