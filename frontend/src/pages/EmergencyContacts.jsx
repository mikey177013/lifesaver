import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Plus, Trash2, User } from "lucide-react";
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
      toast.success("Contact added successfully");
      setFormData({ name: "", phone: "", relationship: "" });
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
    <div className="min-h-screen bg-gray-50">
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
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-xl">
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
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 btn-transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
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
                className="glass rounded-3xl p-8 mb-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Emergency Contact</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      data-testid="contact-name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      data-testid="contact-phone-input"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <input
                      data-testid="contact-relationship-input"
                      type="text"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Mother, Father, Friend, etc."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      data-testid="save-contact-button"
                      onClick={handleAdd}
                      disabled={!formData.name || !formData.phone || !formData.relationship}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 btn-transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Save Contact
                    </button>
                    <button
                      data-testid="cancel-button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ name: "", phone: "", relationship: "" });
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 btn-transition font-medium"
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
                  className="glass rounded-2xl p-6 hover:shadow-lg"
                  style={{ transition: 'box-shadow 0.2s ease' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-purple-100 p-4 rounded-xl">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg" data-testid={`contact-name-${index}`}>
                          {contact.name}
                        </h3>
                        <p className="text-gray-600" data-testid={`contact-phone-${index}`}>
                          {contact.phone}
                        </p>
                        <p className="text-sm text-purple-600 font-medium" data-testid={`contact-relationship-${index}`}>
                          {contact.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        data-testid={`call-button-${index}`}
                        href={`tel:${contact.phone}`}
                        className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 btn-transition"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                      <button
                        data-testid={`delete-button-${index}`}
                        onClick={() => handleDelete(contact.id)}
                        className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 btn-transition"
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
              className="glass rounded-3xl p-12 text-center"
            >
              <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Emergency Contacts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add trusted contacts who can be reached during emergencies
              </p>
              <button
                data-testid="add-first-contact-button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 btn-transition font-medium"
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