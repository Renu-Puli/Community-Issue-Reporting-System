import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
];

const LanguageSelect = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>(
    localStorage.getItem('selectedLanguage') || i18n.language || 'en'
  );

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setSelectedLang(code);
    localStorage.setItem('selectedLanguage', code);
    sessionStorage.setItem('langSelected', 'true');
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url("/community-bg.png")' }}
    >
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card-strong p-8 md:p-12 max-w-2xl w-full relative z-10"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text mb-2">
            Community Issue Reporter
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('languageSelect.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {languages.map((lang, index) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHoveredLang(lang.code)}
              onMouseLeave={() => setHoveredLang(null)}
              onClick={() => selectLanguage(lang.code)}
              className={`relative glass-card p-4 text-center cursor-pointer transition-all duration-300 ${hoveredLang === lang.code || selectedLang === lang.code
                ? 'border-primary/50 shadow-lg'
                : ''
                }`}
            >
              {selectedLang === lang.code && (
                <span className="absolute top-2 right-2 text-primary">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <span className="text-2xl mb-2 block">{lang.flag}</span>
              <span className="font-semibold text-foreground block">{lang.native}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LanguageSelect;
