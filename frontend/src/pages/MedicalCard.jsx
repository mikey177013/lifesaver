import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Save, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MedicalCard = () => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    blood_group: "",
    allergies: "",
    medical_conditions: "",
    medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    loadMedicalInfo();
  }, []);

  const loadMedicalInfo = async () => {
    try {
      const response = await axios.get(`${API}/medical-info`);
      if (response.data && response.data.length > 0) {
        const info = response.data[0];
        setMedicalInfo(info);
        setFormData({
          name: info.name,
          blood_group: info.blood_group,
          allergies: info.allergies || "",
          medical_conditions: info.medical_conditions || "",
          medications: info.medications || "",
          emergency_contact_name: info.emergency_contact_name,
          emergency_contact_phone: info.emergency_contact_phone,
        });
      } else {
        setEditing(true);
      }
    } catch (error) {
      console.error("Error loading medical info:", error);
      setEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      if (medicalInfo) {
        await axios.put(`${API}/medical-info/${medicalInfo.id}`, formData);
        toast.success("Medical info updated successfully");
      } else {
        await axios.post(`${API}/medical-info`, formData);
        toast.success("Medical info saved successfully");
      }
      await loadMedicalInfo();
      setEditing(false);
    } catch (error) {
      console.error("Error saving medical info:", error);
      toast.error("Failed to save medical info");
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Medical Info</h1>
                <p className="text-xs text-gray-500">Store your health details</p>
              </div>
            </div>
          </div>
          {!editing && medicalInfo && (
            <button
              data-testid="edit-button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 btn-transition font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {editing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {medicalInfo ? "Edit Medical Information" : "Add Medical Information"}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    data-testid="name-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    data-testid="blood-group-select"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    data-testid="allergies-input"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="List any known allergies..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    data-testid="conditions-input"
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="Diabetes, Asthma, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications
                  </label>
                  <textarea
                    data-testid="medications-input"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="List current medications..."
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Emergency Contact
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name *
                      </label>
                      <input
                        data-testid="emergency-name-input"
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Emergency contact name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone *
                      </label>
                      <input
                        data-testid="emergency-phone-input"
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    data-testid="save-button"
                    onClick={handleSave}
                    disabled={!formData.name || !formData.blood_group || !formData.emergency_contact_name || !formData.emergency_contact_phone}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 btn-transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Save Information
                  </button>
                  {medicalInfo && (
                    <button
                      data-testid="cancel-button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 btn-transition font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            medicalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Medical Card */}
                <div className="glass rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-red-100 p-4 rounded-2xl">
                      <Heart className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{medicalInfo.name}</h2>
                      <p className="text-gray-600">Medical Information Card</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 rounded-2xl p-6">
                      <p className="text-sm text-gray-600 mb-1">Blood Group</p>
                      <p className="text-3xl font-bold text-red-600" data-testid="blood-group-display">
                        {medicalInfo.blood_group}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
                      <p className="font-semibold text-gray-900">{medicalInfo.emergency_contact_name}</p>
                      <p className="text-gray-600 text-sm" data-testid="emergency-contact-display">
                        {medicalInfo.emergency_contact_phone}
                      </p>
                    </div>
                  </div>

                  {medicalInfo.allergies && (
                    <div className="mt-6 bg-yellow-50 rounded-2xl p-6">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Allergies</p>
                      <p className="text-gray-700">{medicalInfo.allergies}</p>
                    </div>
                  )}

                  {medicalInfo.medical_conditions && (
                    <div className="mt-6 bg-blue-50 rounded-2xl p-6">
                      <p className="text-sm font-semibold text-blue-800 mb-2">Medical Conditions</p>
                      <p className="text-gray-700">{medicalInfo.medical_conditions}</p>
                    </div>
                  )}

                  {medicalInfo.medications && (
                    <div className="mt-6 bg-purple-50 rounded-2xl p-6">
                      <p className="text-sm font-semibold text-purple-800 mb-2">Current Medications</p>
                      <p className="text-gray-700">{medicalInfo.medications}</p>
                    </div>
                  )}
                </div>

                {/* Info Note */}
                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> This information is stored securely and can be accessed offline. 
                    Keep it up to date for emergency responders.
                  </p>
                </div>
              </motion.div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicalCard;