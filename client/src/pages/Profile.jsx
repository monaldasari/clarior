import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  User, Phone, Building, Briefcase, MapPin, 
  Globe, Save, Camera, Trash2
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import api from "../api/api";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company: "",
    department: "",
    job_title: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    time_zone: "UTC",
    language: "en",
    theme_preference: "system"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        company: user.company || "",
        department: user.department || "",
        job_title: user.job_title || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        time_zone: user.time_zone || "UTC",
        language: user.language || "en",
        theme_preference: user.theme_preference || "system"
      });
      setAvatarPreview(user.profile_picture_url || null);
    }
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      formData.full_name, formData.phone, formData.company, 
      formData.department, formData.job_title, formData.bio, 
      formData.location, formData.website, formData.linkedin, 
      formData.github, avatarPreview
    ];
    const filled = fields.filter(f => f && String(f).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const uploadData = new FormData();
    uploadData.append("avatar", file);

    setIsUploading(true);
    try {
      const res = await api.post("/api/users/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      addToast("Profile picture updated successfully", "success");
      setAvatarPreview(res.data.profile_picture_url);
      await refreshUser(); // Update user in AuthContext so Topbar/Sidebar reflect new avatar
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || "Failed to upload avatar", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await api.put("/api/users/me", { ...formData, profile_picture_url: null });
      setAvatarPreview(null);
      addToast("Profile picture removed", "info");
    } catch (_err) {
      addToast("Failed to remove profile picture", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/api/users/me", formData);
      addToast("Profile updated successfully", "success");
      await refreshUser(); // Refresh user object in AuthContext
    } catch (_err) {
      addToast("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const initial = formData.full_name ? formData.full_name.charAt(0).toUpperCase() : "U";
  const completion = calculateCompletion();

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="text-cyan-500" />
          My Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your personal information, contact info, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Summary & Avatar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 text-center">
            {/* Avatar Section */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full border-4 border-cyan-500/20 bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white text-4xl shadow-md overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              
              <label className="absolute bottom-1 right-1 p-2 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 cursor-pointer transition">
                <Camera size={16} />
                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </label>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{formData.full_name || "Clarior User"}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate mb-4">{user?.email}</p>

            <div className="flex justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                {user?.role || "Employee"}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                user?.status === "Active" 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/50" 
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50"
              }`}>
                {user?.status || "Active"}
              </span>
            </div>

            {/* Profile Completion */}
            <div className="text-left bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                <span>Profile Completion</span>
                <span>{completion}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {avatarPreview && (
              <button 
                onClick={handleRemoveAvatar}
                className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 mx-auto transition"
              >
                <Trash2 size={14} /> Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Right Form: Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Company</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Job Title</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Sales, Marketing, HR, etc."
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="San Francisco, CA"
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Profiles */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
                  Social Connections
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Website</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">LinkedIn</label>
                    <div className="relative">
                      <FaLinkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">GitHub</label>
                    <div className="relative">
                      <FaGithub size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Share a short bio with your colleagues..."
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm resize-none"
                />
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
                  System Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Time Zone</label>
                    <div className="relative">
                      <Globe2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        name="time_zone"
                        value={formData.time_zone}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm cursor-pointer"
                      >
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="EST">EST (GMT-5)</option>
                        <option value="PST">PST (GMT-8)</option>
                        <option value="IST">IST (GMT+5:30)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm cursor-pointer"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Theme Theme</label>
                    <div className="relative">
                      <select
                        name="theme_preference"
                        value={formData.theme_preference}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm cursor-pointer"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:from-cyan-600 hover:to-blue-600 transition shadow-lg shadow-cyan-500/30 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
