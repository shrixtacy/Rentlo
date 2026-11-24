import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loading, post } = useApi();

  const [tab, setTab] = useState('password'); // 'password' | 'otp'

  // Password tab state
  const [pwEmail, setPwEmail] = useState('');
  const [pwPassword, setPwPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP tab state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!pwEmail || !pwPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await post('/auth/login', { email: pwEmail, password: pwPassword });
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error('Please enter your email');
      return;
    }
    try {
      await post('/auth/otp/request', { email: otpEmail });
      toast.success('OTP sent to your email!');
      setOtpStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    try {
      const res = await post('/auth/otp/verify', { email: otpEmail, otp: otpString });
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-dark tracking-tight">
            Rentlo<span className="text-primary">.</span>
          </h1>
          <p className="text-muted text-sm mt-2">Borrow anything, from anyone, nearby.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {/* Tabs */}
          <div className="flex bg-background rounded-2xl p-1 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                tab === 'password' ? 'bg-white text-dark shadow-sm' : 'text-muted'
              }`}
              onClick={() => setTab('password')}
            >
              Password
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                tab === 'otp' ? 'bg-white text-dark shadow-sm' : 'text-muted'
              }`}
              onClick={() => setTab('otp')}
            >
              OTP
            </button>
          </div>

          {/* Password Tab */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={pwEmail}
                onChange={(e) => setPwEmail(e.target.value)}
                icon={<Mail size={16} />}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-dark">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={pwPassword}
                    onChange={(e) => setPwPassword(e.target.value)}
                    className="rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-full pl-10 pr-10 py-3 bg-white text-dark placeholder:text-muted transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Sign In
              </Button>
            </form>
          )}

          {/* OTP Tab */}
          {tab === 'otp' && (
            <>
              {otpStep === 1 && (
                <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    icon={<Mail size={16} />}
                  />
                  <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                    Send OTP
                  </Button>
                </form>
              )}

              {otpStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <p className="text-sm text-muted text-center">
                    OTP sent to <span className="text-dark font-semibold">{otpEmail}</span>
                  </p>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="w-11 h-14 text-center text-xl font-bold rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-dark transition-all"
                      />
                    ))}
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                    Verify OTP
                  </Button>
                  <button
                    type="button"
                    onClick={() => setOtpStep(1)}
                    className="text-sm text-muted hover:text-dark text-center transition-colors"
                  >
                    Change email
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-dark font-semibold hover:text-primary transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
