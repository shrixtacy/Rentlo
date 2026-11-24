import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Upload, Image as ImageIcon, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CATEGORIES = ['cameras', 'tools', 'bikes', 'camping', 'electronics', 'sports', 'books', 'party', 'other'];
const TOTAL_STEPS = 4;

export default function CreateListing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Step 2
  const [pricePerDay, setPricePerDay] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [rules, setRules] = useState('');

  // Step 3
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Step 4
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const url = URL.createObjectURL(f);
      setImagePreviews((prev) => [...prev, url]);
    });
  };

  const removeImage = (i) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!title.trim()) { toast.error('Title is required'); return false; }
      if (!description.trim()) { toast.error('Description is required'); return false; }
      if (!category) { toast.error('Category is required'); return false; }
    }
    if (step === 2) {
      if (!pricePerDay || Number(pricePerDay) <= 0) { toast.error('Enter a valid price per day'); return false; }
      if (!securityDeposit || Number(securityDeposit) < 0) { toast.error('Enter a valid security deposit'); return false; }
      if (!itemValue || Number(itemValue) <= 0) { toast.error('Enter item value'); return false; }
    }
    if (step === 4) {
      if (!city.trim()) { toast.error('City is required'); return false; }
      if (!state.trim()) { toast.error('State is required'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePublish = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('category', category);
      form.append('pricePerDay', pricePerDay);
      form.append('securityDeposit', securityDeposit);
      form.append('itemValue', itemValue);
      if (rules) form.append('rules', rules);
      form.append('address', address);
      form.append('city', city);
      form.append('state', state);
      form.append('pincode', pincode);
      if (lat) form.append('lat', lat);
      if (lng) form.append('lng', lng);
      imageFiles.forEach((f) => form.append('images', f));

      const res = await api.post('/listings', form);
      toast.success('Listing published!');
      const newId = res.data?.data?.id;
      if (newId) {
        navigate(`/listings/${newId}`);
      } else {
        navigate('/rentals');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish listing');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Details', 'Pricing', 'Photos', 'Location'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-extrabold text-dark mb-2">List an Item</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {stepLabels.map((label, i) => {
          const s = i + 1;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s < step ? 'bg-primary text-dark' : s === step ? 'bg-primary text-dark ring-4 ring-primary/30' : 'bg-gray-200 text-muted'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <span className={`text-xs mt-1 ${s === step ? 'text-dark font-semibold' : 'text-muted'}`}>{label}</span>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${s < step ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-bold text-dark mb-4">Item Details</h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Title"
                  placeholder="e.g. Sony A7III Camera"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-dark">Description</label>
                  <textarea
                    placeholder="Describe your item, its condition, what's included..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-full px-4 py-3 bg-white text-dark placeholder:text-muted transition-all resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-dark">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-full px-4 py-3 bg-white text-dark transition-all capitalize"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-bold text-dark mb-4">Pricing</h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Price per day (₹)"
                  type="number"
                  placeholder="500"
                  min="1"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                />
                <Input
                  label="Security Deposit (₹)"
                  type="number"
                  placeholder="1000"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                />
                <Input
                  label="Item Value (₹)"
                  type="number"
                  placeholder="20000"
                  min="1"
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-dark">Rules <span className="text-muted font-normal">(optional)</span></label>
                  <textarea
                    placeholder="e.g. Handle with care, No outdoor use without permission..."
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    rows={3}
                    className="rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-full px-4 py-3 bg-white text-dark placeholder:text-muted transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-bold text-dark mb-4">Photos</h2>
              <p className="text-muted text-sm mb-4">Add up to 5 photos. Good photos get more bookings.</p>

              {/* Upload area */}
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                  imageFiles.length >= 5 ? 'border-gray-200 opacity-50 cursor-not-allowed' : 'border-primary/40 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <Upload size={32} className="text-muted mb-2" />
                <p className="text-sm font-medium text-dark">Click to add photos</p>
                <p className="text-xs text-muted mt-1">{imageFiles.length}/5 photos added</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={imageFiles.length >= 5}
                />
              </label>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden">
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X size={12} />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-dark text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <ImageIcon size={24} className="text-muted" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Location
              </h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Address"
                  placeholder="123, MG Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    placeholder="Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    label="State *"
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <Input
                  label="Pincode"
                  placeholder="560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitude (optional)"
                    type="number"
                    placeholder="12.9716"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                  <Input
                    label="Longitude (optional)"
                    type="number"
                    placeholder="77.5946"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="secondary" size="lg" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button variant="primary" size="lg" onClick={handleNext} className="flex-1">
              Next
            </Button>
          ) : (
            <Button variant="primary" size="lg" loading={loading} onClick={handlePublish} className="flex-1">
              Publish Listing
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
