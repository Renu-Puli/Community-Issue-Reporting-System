import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('selectedLanguage', code);
  };

  const navItems = role === 'admin'
    ? [
        { path: '/dashboard', label: t('nav.dashboard') },
        { path: '/dashboard/all-complaints', label: t('nav.allComplaints') },
      ]
    : role === 'worker'
    ? [
        { path: '/dashboard', label: t('nav.dashboard') },
        { path: '/dashboard/assigned', label: t('nav.assigned') },
      ]
    : [
        { path: '/dashboard', label: t('nav.dashboard') },
        { path: '/dashboard/new-complaint', label: t('nav.newComplaint') },
        { path: '/dashboard/my-complaints', label: t('nav.complaints') },
      ];

  return (
    <nav className="glass-card-strong sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="font-display font-bold text-lg gradient-text">
            CommunityIR
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <select
              value={i18n.language}
              onChange={(e) => changeLang(e.target.value)}
              className="text-xs bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-foreground outline-none"
            >
              <option value="en">EN</option>
              <option value="te">తె</option>
              <option value="hi">हि</option>
              <option value="ta">த</option>
              <option value="kn">ಕ</option>
              <option value="ml">മ</option>
              <option value="mr">म</option>
              <option value="bn">বা</option>
            </select>
            <span className="text-sm text-muted-foreground">
              {profile?.name}
              <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{role}</span>
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4 space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm ${
                  location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-destructive">
              {t('auth.logout')}
            </button>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
