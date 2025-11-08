import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Plus, Trash2, User, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relationship: "",
    email: "",
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API}/emergency-contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${API}/emergency-contacts`, formData);
      
      // Store user's own phone for notifications
      if (formData.relationship.toLowerCase().includes('me') || 
          formData.relationship.toLowerCase() === 'self') {
        localStorage.setItem('userPhone', formData.phone);
      }
      
      toast.success("Contact added successfully", {
        description: "They will receive alerts when you press SOS"
      });
      setFormData({ name: "", phone: "", relationship: "", email: "" });
      setShowForm(false);
      await loadContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await axios.delete(`${API}/emergency-contacts/${id}`);
      toast.success("Contact deleted successfully");
      await loadContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-button"
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg btn-transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Emergency Contacts</h1>
                <p className="text-xs text-gray-500">Manage your safety network</p>
              </div>
            </div>
          </div>
          <button
            data-testid="add-contact-button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 btn-transition font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Add Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-3xl p-8 mb-8 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Emergency Contact</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      data-testid="contact-name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      data-testid="contact-phone-input"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      data-testid="contact-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <input
                      data-testid="contact-relationship-input"
                      type="text"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Mother, Father, Friend, etc."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      data-testid="save-contact-button"
                      onClick={handleAdd}
                      disabled={!formData.name || !formData.phone || !formData.relationship}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 btn-transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                    >
                      Save Contact
                    </button>
                    <button
                      data-testid="cancel-button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ name: "", phone: "", relationship: "", email: "" });
                      }}
                      className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 btn-transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contacts List */}
          {contacts.length > 0 ? (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-3xl p-6 hover:shadow-2xl card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-xl mb-1" data-testid={`contact-name-${index}`}>
                          {contact.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Phone className="w-4 h-4" />
                          <p data-testid={`contact-phone-${index}`}>{contact.phone}</p>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Mail className="w-4 h-4" />
                            <p className="text-sm">{contact.email}</p>
                          </div>
                        )}
                        <p className="text-sm font-semibold text-purple-600" data-testid={`contact-relationship-${index}`}>
                          {contact.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        data-testid={`call-button-${index}`}
                        href={`tel:${contact.phone}`}
                        className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 btn-transition shadow-lg"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                      <button
                        data-testid={`delete-button-${index}`}
                        onClick={() => handleDelete(contact.id)}
                        className="p-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 btn-transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-3xl p-16 text-center shadow-xl"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg float-animation">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Emergency Contacts Yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Add trusted contacts who will receive alerts when you press the SOS button
              </p>
              <button
                data-testid="add-first-contact-button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 btn-transition font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Your First Contact
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmergencyContacts;