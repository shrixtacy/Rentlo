import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Camera, Edit2, Check, X, LogOut, Shield, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import api from '../lib/api';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ListingGrid from '../components/listings/ListingGrid';
import Spinner from '../components/ui/Spinner';

const KYC_DOC_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'PASSPORT', label: 'Passport' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { patch, post, loading } = useApi();

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCity, setEditCity] = useState(user?.address?.city || '');
  const [editState, setEditState] = useState(user?.address?.state || '');
  const [editPincode, setEditPincode] = useState(user?.address?.pincode || '');
  const [saveLoading, setSaveLoading] = useState(false);

  // Avatar
  const avatarRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // KYC
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [kycFile, setKycFile] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const kycFileRef = useRef(null);

  // My listings
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      setListingsLoading(true);
      try {
        const res = await api.get('/listings?owner=me');
        setMyListings(res.data?.data?.listings || res.data?.listings || []);
      } catch {
        // silent
      } finally {
        setListingsLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await api.post('/users/avatar', form);
      updateUser({ avatar: res.data.data.avatarUrl });
      toast.success('Photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const res = await api.patch('/users/profile', {
        name: editName,
        phone: editPhone,
        address: { city: editCity, state: editState, pincode: editPincode },
      });
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!docType) { toast.error('Select document type'); return; }
    if (!docNumber.trim()) { toast.error('Enter document number'); return; }
    if (!kycFile) { toast.error('Upload a document photo'); return; }
    setKycLoading(true);
    try {
      const form = new FormData();
      form.append('documentType', docType);
      form.append('documentNumber', docNumber);
      form.append('file', kycFile);
      const res = await api.post('/users/kyc/upload', form);
      updateUser({ kycStatus: res.data.data.kycStatus });
      toast.success('KYC submitted for verification!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC upload failed');
    } finally {
      setKycLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startEdit = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditCity(user?.address?.city || '');
    setEditState(user?.address?.state || '');
    setEditPincode(user?.address?.pincode || '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  if (!user) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 max-w-3xl mx-auto"
    >
      {/* Profile card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            {avatarLoading ? (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <Avatar src={user.avatar} name={user.name} size="xl" />
            )}
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-dark flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
              aria-label="Change photo"
            >
              <Camera size={14} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-dark">{user.name}</h1>
              {user.role && (
                <span className="bg-primary/20 text-dark text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                  {user.role}
                </span>
              )}
            </div>
            <p className="text-muted text-sm">{user.email}</p>
            {user.phone && <p className="text-muted text-sm">{user.phone}</p>}
            {(user.address?.city || user.address?.state) && (
              <p className="text-muted text-sm mt-0.5">
                {[user.address.city, user.address.state].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge status={user.kycStatus || 'UNVERIFIED'} />
            </div>
          </div>

          {!editing && (
            <button
              onClick={startEdit}
              className="p-2 rounded-full hover:bg-gray-100 text-muted hover:text-dark transition-colors flex-shrink-0"
              aria-label="Edit profile"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="border-t border-gray-100 pt-5">
            <h2 className="font-semibold text-dark mb-4">Edit Profile</h2>
            <div className="flex flex-col gap-4">
              <Input
                label="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Input
                label="Phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
                <Input
                  label="State"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                />
              </div>
              <Input
                label="Pincode"
                value={editPincode}
                onChange={(e) => setEditPincode(e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="primary" size="md" loading={saveLoading} onClick={handleSaveProfile} className="flex-1">
                  <Check size={16} />
                  Save
                </Button>
                <Button variant="secondary" size="md" onClick={cancelEdit} className="flex-1">
                  <X size={16} />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC section */}
      {user.kycStatus === 'UNVERIFIED' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary" />
            <h2 className="font-bold text-dark">Verify Your Identity</h2>
          </div>
          <p className="text-muted text-sm mb-4">KYC verification unlocks higher booking limits and builds trust.</p>
          <form onSubmit={handleKycSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-dark">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary bg-white"
              >
                <option value="">Select document</option>
                {KYC_DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Document Number"
              placeholder="Enter document number"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-dark">Upload Document Photo</label>
              <label
                className="flex items-center gap-3 border-2 border-dashed border-primary/40 rounded-2xl p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <FileText size={20} className="text-muted" />
                <div>
                  <p className="text-sm font-medium text-dark">{kycFile ? kycFile.name : 'Click to upload'}</p>
                  <p className="text-xs text-muted">JPG, PNG or PDF</p>
                </div>
                <input
                  ref={kycFileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setKycFile(e.target.files[0])}
                />
              </label>
            </div>
            <Button type="submit" variant="primary" loading={kycLoading} className="w-full">
              Submit KYC
            </Button>
          </form>
        </div>
      )}

      {user.kycStatus === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Shield size={18} className="text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">KYC under review</p>
            <p className="text-yellow-700 text-xs mt-0.5">We'll notify you once verified.</p>
          </div>
        </div>
      )}

      {user.kycStatus === 'VERIFIED' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Shield size={18} className="text-green-600" />
          <p className="font-semibold text-green-800 text-sm">Identity Verified ✓</p>
        </div>
      )}

      {/* My listings */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-dark mb-4">My Listings</h2>
        {listingsLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : myListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-dark">No listings yet</p>
            <p className="text-muted text-sm mt-1">List an item to start earning.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/listings/create')}
              className="mt-4"
            >
              Create Listing
            </Button>
          </div>
        ) : (
          <ListingGrid listings={myListings} />
        )}
      </div>

      {/* Logout */}
      <Button
        variant="secondary"
        size="lg"
        onClick={handleLogout}
        className="w-full"
      >
        <LogOut size={16} />
        Log Out
      </Button>
    </motion.div>
  );
}
