import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const MapView = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 10000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            data-testid="back-button"
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg btn-transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Live Location</h1>
            <p className="text-xs text-gray-500">Updated every 10 seconds</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {location ? (
            <>
              {/* Map Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl overflow-hidden shadow-xl mb-6"
              >
                <div className="map-container" style={{ height: '500px' }}>
                  <iframe
                    data-testid="google-maps-iframe"
                    title="Live Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${location.lat},${location.lng}&output=embed`}
                  ></iframe>
                </div>
              </motion.div>

              {/* Location Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 mb-6"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-3">Coordinates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Latitude</p>
                        <p className="text-lg font-semibold text-gray-900" data-testid="latitude-display">
                          {location.lat.toFixed(6)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Longitude</p>
                        <p className="text-lg font-semibold text-gray-900" data-testid="longitude-display">
                          {location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  data-testid="open-in-google-maps"
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 btn-transition font-medium"
                >
                  <Navigation className="w-5 h-5" />
                  Open in Google Maps
                </a>
              </motion.div>

              {/* Share Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-3">Share Your Location</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Copy this link to share your location with emergency contacts:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <code className="text-sm text-gray-700 break-all">
                    https://www.google.com/maps?q={location.lat},{location.lng}
                  </code>
                </div>
                <button
                  data-testid="copy-location-button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://www.google.com/maps?q=${location.lat},${location.lng}`
                    );
                    alert('Location link copied to clipboard!');
                  }}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 btn-transition font-medium"
                >
                  Copy Link
                </button>
              </motion.div>
            </>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Getting your location...
              </h3>
              <p className="text-gray-600">
                Please enable location services in your browser
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapView;