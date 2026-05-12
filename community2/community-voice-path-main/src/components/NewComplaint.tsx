import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { apiPost } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MapPin, Send } from 'lucide-react';

const categories = ['roads', 'water', 'electricity', 'sanitation', 'parks', 'worker', 'drainage_cleaner', 'garbage_collection', 'other'];

const NewComplaint = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', category: 'roads', location: '', issueImage: '' });
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxSize = 800; // Resize to max 800px

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setForm((prev) => ({ ...prev, issueImage: compressedDataUrl }));
          } else {
            setForm((prev) => ({ ...prev, issueImage: rawResult }));
          }
        } catch (err) {
          console.error("Canvas compression failed, falling back to raw image", err);
          setForm((prev) => ({ ...prev, issueImage: rawResult }));
        }
      };

      img.onerror = () => {
        console.warn("Failed to load image into canvas. Falling back to raw upload.");
        setForm((prev) => ({ ...prev, issueImage: rawResult }));
      };

      if (rawResult) {
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await apiPost('/api/complaints', form);
      toast.success(t('common.success'));
      setForm({ title: '', description: '', category: 'roads', location: '', issueImage: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-new-complaint min-h-[calc(100vh-80px)] p-6 -m-4 sm:-m-6 lg:-m-8 flex items-start justify-center pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <h2 className="text-3xl font-bold font-display mb-8 text-center text-white drop-shadow-md">{t('dashboard.raiseComplaint')}</h2>
        <form onSubmit={handleSubmit} className="glass-card-strong p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('complaint.title')}</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('complaint.description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('complaint.category')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary outline-none transition-all text-foreground appearance-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{t(`complaint.categories.${c}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('complaint.location')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary outline-none transition-all text-foreground"
                />
              </div>
            </div>
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
            <label className="text-sm font-medium text-foreground mb-2 block">{t('complaint.image')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-4 text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {loading ? t('common.loading') : t('complaint.submit')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default NewComplaint;
