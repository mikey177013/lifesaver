import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, Bot, Heart, Phone, Menu, X, Bell } from "lucide-react";
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
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem('userName'));
  const [tempName, setTempName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') || '');

  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userPhone) {
      fetchNotifications();
      const notifInterval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(notifInterval);
    }
  }, [userPhone]);

  const fetchNotifications = async () => {
    if (!userPhone) return;
    try {
      const response = await axios.get(`${API}/notifications/${userPhone}`);
      setNotifications(response.data.filter(n => !n.read));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  };

  const saveName = () => {
    if (tempName.trim()) {
      localStorage.setItem('userName', tempName);
      setUserName(tempName);
      setShowNamePrompt(false);
      toast.success('Welcome to LifeSaver!', {
        description: `Hi ${tempName}! Your emergency profile is ready.`
      });
    }
  };

  const handleSOS = async () => {
    if (!userName) {
      toast.error('Please enter your name first');
      setShowNamePrompt(true);
      return;
    }

    setIsEmergency(true);
    
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn77RgGwU7k9n0yXElBSh+zPDajzsKElyx6OyrWBUIQ5zf8sFuJAUtgs/z2Ik3Bxtpve/im0oMAU6r6PG0YBwGPJPZ88p0JAUpfsrw2I49CxFbsOjuqlgVB0Se4PO+bSMFL4HO8tiKOAcaab3v45xPDBBOqufwtGAcBT2T2fPJdSQFKX7K8NiNPgsRW7Hn7qpYFgdEnuDzvm0jBS+BzvLYijgHGmm97+OcTwwPTqvn8LRgHAU9k9nzyXUkBSl+yvDYjT4LEVux5+6qWBYHRJ7g875tIwUvgc7y2Io4Bxppve/jnE8MD06r5/C0YBwFPZPZ88l1JAUpfsrw2I0+CxFbsefuqlgWB0Se4PO+bSMFL4HO8tiKOAcaab3v45xPDA9Oq+fwtGAcBT2T2fPJdSQFKX7K8NiNPgsRW7Hn7qpYFgdEnuDzvm0jBS+BzvLYijgHGmm97+OcTwwPTqvn8LRgHAU9k9nzyXUkBSl+yvDYjT4LEVux5+6qWBYHRJ7g875tIwUvgc7y2Io4Bxppve/jnE8MD06r5/C0YBwFPZPZ88l1JAUpfsrw2I0+CxFbsefuqlgWB0Se4PO+bSMFL4HO8tiKOAcaab3v45xPDA9Oq+fwtGAcBT2T2fPJdSQFKX7K8NiNPgsRW7Hn7qpYFgdEnuDzvm0jBS+BzvLYijgHGmm97+OcTwwPTqvn8LRgHAU9k9nzyXUkBSl+yvDYjT4LEVux5+6qWBYHRJ7g875tIwUvgc7y');
    audio.play().catch(() => {});

    if (location) {
      const message = `🆘 EMERGENCY ALERT\n\nI need help!\n\nLocation:\nLatitude: ${location.lat}\nLongitude: ${location.lng}\n\nGoogle Maps: https://www.google.com/maps?q=${location.lat},${location.lng}`;
      
      try {
        await axios.post(`${API}/sos-alert`, {
          user_name: userName,
          latitude: location.lat,
          longitude: location.lng,
        });
        toast.success("Emergency alert sent!", {
          description: "All emergency contacts have been notified"
        });
      } catch (error) {
        console.error("Error saving alert:", error);
        toast.error("Failed to send alert");
      }

      console.log(message);
    } else {
      toast.error("Location not available", {
        description: "Please enable location services"
      });
    }

    setTimeout(() => setIsEmergency(false), 3000);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className={`min-h-screen ${isEmergency ? 'emergency-flash' : ''}`}>
      {/* Name Prompt Modal */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full"
            >
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Welcome to LifeSaver</h2>
              <p className="text-gray-600 text-center mb-6">Please enter your name to get started</p>
              <input
                data-testid="name-input-modal"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveName()}
                placeholder="Your name"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6 text-lg"
                autoFocus
              />
              <button
                data-testid="save-name-button"
                onClick={saveName}
                disabled={!tempName.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 btn-transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">LifeSaver</h1>
              <p className="text-xs text-gray-500">Emergency Help Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 hover:bg-gray-100 rounded-xl btn-transition"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold notification-bounce">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              data-testid="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-3 hover:bg-gray-100 rounded-xl btn-transition"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-20 right-4 z-40 w-96 glass rounded-3xl shadow-2xl p-6 notification-panel"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-600" />
              Emergency Alerts
            </h3>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-red-50 border-2 border-red-200 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-900 mb-1">{notif.sender_name}</p>
                        <p className="text-sm text-red-800 mb-2">{notif.message}</p>
                        <a
                          href={`https://www.google.com/maps?q=${notif.latitude},${notif.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          View Location
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="mt-3 w-full text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Mark as Read
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No new alerts</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-20 right-4 z-40 w-72 glass rounded-3xl shadow-2xl p-6"
          >
            <nav className="space-y-3">
              <button
                data-testid="nav-map-button"
                onClick={() => { navigate('/map'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl btn-transition text-left group"
              >
                <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }}>
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold">Live Location</span>
              </button>
              <button
                data-testid="nav-chat-button"
                onClick={() => { navigate('/chat'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl btn-transition text-left group"
              >
                <div className="bg-green-100 p-2 rounded-lg group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }}>
                  <Bot className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold">AI Assistant</span>
              </button>
              <button
                data-testid="nav-medical-button"
                onClick={() => { navigate('/medical'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl btn-transition text-left group"
              >
                <div className="bg-red-100 p-2 rounded-lg group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }}>
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-semibold">Medical Info</span>
              </button>
              <button
                data-testid="nav-contacts-button"
                onClick={() => { navigate('/contacts'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl btn-transition text-left group"
              >
                <div className="bg-purple-100 p-2 rounded-lg group-hover:scale-110" style={{ transition: 'transform 0.2s ease' }}>
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-semibold">Contacts</span>
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
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-4 leading-tight">
              Help is One Tap Away
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              Instantly alert your contacts and get AI-powered emergency guidance
            </p>
            {userName && (
              <p className="text-sm text-gray-500 mt-3">
                Welcome back, <span className="font-semibold text-red-600">{userName}</span>
              </p>
            )}
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
              className="relative w-72 h-72 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full shadow-2xl btn-transition sos-pulse hover:shadow-red-500/50 flex flex-col items-center justify-center group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100" style={{ transition: 'opacity 0.3s ease' }}></div>
              <AlertTriangle className="w-28 h-28 text-white mb-4 group-hover:scale-110 relative z-10" style={{ transition: 'transform 0.3s ease', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
              <span className="text-4xl font-black text-white relative z-10" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>SOS</span>
              <span className="text-sm text-white/90 mt-3 font-semibold relative z-10">Press for Help</span>
            </button>
          </motion.div>

          {/* Location Display */}
          {location && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl p-6 mb-8 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Your Current Location</h3>
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-700 mb-1 font-medium">
                      📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                  <a
                    data-testid="google-maps-link"
                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold group"
                  >
                    View on Google Maps 
                    <span className="group-hover:translate-x-1" style={{ transition: 'transform 0.2s ease' }}>→</span>
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
              className="glass p-6 rounded-3xl hover:shadow-2xl btn-transition text-left group card-hover"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 shadow-lg" style={{ transition: 'transform 0.3s ease' }}>
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Live Map</h3>
              <p className="text-sm text-gray-600">Track your location in real-time</p>
            </button>

            <button
              data-testid="quick-chat-button"
              onClick={() => navigate('/chat')}
              className="glass p-6 rounded-3xl hover:shadow-2xl btn-transition text-left group card-hover"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 shadow-lg" style={{ transition: 'transform 0.3s ease' }}>
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">AI Assistant</h3>
              <p className="text-sm text-gray-600">Get emergency guidance instantly</p>
            </button>

            <button
              data-testid="quick-medical-button"
              onClick={() => navigate('/medical')}
              className="glass p-6 rounded-3xl hover:shadow-2xl btn-transition text-left group card-hover"
            >
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 shadow-lg" style={{ transition: 'transform 0.3s ease' }}>
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Medical Info</h3>
              <p className="text-sm text-gray-600">Store your health details</p>
            </button>

            <button
              data-testid="quick-contacts-button"
              onClick={() => navigate('/contacts')}
              className="glass p-6 rounded-3xl hover:shadow-2xl btn-transition text-left group card-hover"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 shadow-lg" style={{ transition: 'transform 0.3s ease' }}>
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Emergency Contacts</h3>
              <p className="text-sm text-gray-600">Manage your safety network</p>
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500">
        <p className="font-semibold">LifeSaver - Built for Emergent X TPF Vibe Sprint 2 Hackathon</p>
        <p className="mt-1">Stay safe, help is always nearby 🫶</p>
      </footer>
    </div>
  );
};

export default Home;