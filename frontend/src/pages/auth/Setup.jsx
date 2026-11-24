import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShoppingBag, Package, Layers, Camera, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';

const ROLES = [
  { value: 'renter', label: 'I want to rent things', desc: 'Borrow items from others', icon: ShoppingBag },
  { value: 'owner', label: 'I want to lend things', desc: 'Earn by renting your stuff', icon: Package },
  { value: 'both', label: 'Both', desc: 'Rent and lend freely', icon: Layers },
];

export default function Setup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { loading, patch } = useApi();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFinish = async () => {
    if (!city.trim() || !state.trim()) {
      toast.error('City and state are required');
      return;
    }

    try {
      // Upload avatar if selected
      if (avatarFile) {
        setUploading(true);
        const form = new FormData();
        form.append('avatar', avatarFile);
        const avatarRes = await api.post('/users/avatar', form);
        updateUser({ avatar: avatarRes.data.data.avatarUrl });
        setUploading(false);
      }

      // Save profile
      const res = await patch('/users/profile', {
        role,
        address: { city, state, pincode },
      });
      updateUser(res.data.user);
      toast.success('Profile set up!');
      navigate('/');
    } catch (err) {
      setUploading(false);
      toast.error(err.response?.data?.message || 'Setup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-dark tracking-tight">
            Rentlo<span className="text-primary">.</span>
          </h1>
          <p className="text-muted text-sm mt-2">Almost there, {user?.name?.split(' ')[0]}!</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-primary/50' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-dark mb-1">How will you use Rentlo?</h2>
                <p className="text-muted text-sm mb-6">You can change this anytime.</p>
                <div className="flex flex-col gap-3">
                  {ROLES.map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setRole(value)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        role === value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${role === value ? 'bg-primary text-dark' : 'bg-gray-100 text-muted'}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-dark text-sm">{label}</p>
                        <p className="text-muted text-xs mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!role}
                  onClick={() => setStep(2)}
                  className="w-full mt-6"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-dark mb-1">Where are you?</h2>
                <p className="text-muted text-sm mb-6">We use this to show relevant listings.</p>

                {/* Avatar upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
                    <Avatar src={avatarPreview} name={user?.name} size="xl" />
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <p className="text-xs text-muted mt-2">Tap to add photo (optional)</p>
                </div>

                <div className="flex flex-col gap-4">
                  <Input
                    label="City"
                    placeholder="Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    icon={<MapPin size={16} />}
                  />
                  <Input
                    label="State"
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <Input
                    label="Pincode"
                    placeholder="560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={loading || uploading}
                    onClick={handleFinish}
                    className="flex-1"
                  >
                    Finish
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
