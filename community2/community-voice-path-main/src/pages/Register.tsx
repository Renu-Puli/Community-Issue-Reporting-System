import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Shield, Building2, Droplets, Zap, AlertTriangle, TreePine, Wrench } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' as 'user' | 'worker' | 'admin', profession: '' });
  const [customProfession, setCustomProfession] = useState('');
  const [loading, setLoading] = useState(false);

  const professions = [
    { value: 'electrician', label: 'Electrician' },
    { value: 'plumber', label: 'Plumber' },
    { value: 'drainage_cleaner', label: 'Drainage Cleaner' },
    { value: 'road_worker', label: 'Road Worker' },
    { value: 'park_maintainer', label: 'Park Maintainer' },
    { value: 'general', label: 'General Worker' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    const lang = localStorage.getItem('selectedLanguage') || 'en';
    const finalProfession = form.profession === 'other' ? customProfession : form.profession;
    const { error } = await signUp(form.email, form.password, form.name, form.role, lang, form.role === 'worker' ? finalProfession : undefined);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.accountCreated'));
      navigate('/login');
    }
  };

  const issues = [
    { icon: Building2, label: 'Roads & Infrastructure', color: 'text-orange-400' },
    { icon: Droplets, label: 'Water Supply', color: 'text-blue-400' },
    { icon: Zap, label: 'Electricity', color: 'text-yellow-400' },
    { icon: AlertTriangle, label: 'Sanitation', color: 'text-red-400' },
    { icon: TreePine, label: 'Parks & Recreation', color: 'text-green-400' },
    { icon: Wrench, label: 'General Issues', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card-strong max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      >
        {/* Left side – Civic illustration */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display gradient-text mb-2">CommunityIR</h2>
            <p className="text-sm text-muted-foreground mb-8">Report civic issues. Track resolutions. Build better communities.</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {issues.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background/40 border border-border/50 backdrop-blur-sm"
              >
                <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                <span className="text-xs text-foreground/80 truncate">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right side – Register form */}
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3 md:hidden">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div className="hidden md:inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display gradient-text">{t('auth.register')}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('auth.name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder={t('auth.email')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                placeholder={t('auth.password')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                placeholder={t('auth.confirmPassword')}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              />
            </div>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground appearance-none"
              >
                <option value="user">{t('auth.user')}</option>
                <option value="worker">{t('auth.worker')}</option>
                <option value="admin">{t('auth.admin')}</option>
              </select>
            </div>

            {form.role === 'worker' && (
              <div className="relative">
                <Wrench className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <select
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground appearance-none"
                >
                  <option value="">Select Profession</option>
                  {professions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {form.role === 'worker' && form.profession === 'other' && (
              <div className="relative">
                <Wrench className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Specify Custom Profession"
                  value={customProfession}
                  onChange={(e) => setCustomProfession(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                />
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 text-center disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.registerBtn')}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-muted-foreground text-sm">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
