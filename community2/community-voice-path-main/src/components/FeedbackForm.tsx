import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  complaintId: string;
  onSubmitted: () => void;
}

const FeedbackForm = ({ complaintId, onSubmitted }: Props) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setLoading(true);
    const { error } = await supabase
      .from('complaints')
      .update({ feedback_rating: rating, feedback_comment: comment })
      .eq('id', complaintId);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(t('common.success')); onSubmitted(); }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      onSubmit={handleSubmit}
      className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3"
    >
      <p className="text-sm font-semibold text-foreground">{t('complaint.feedback')}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hovered || rating) ? 'fill-warning text-warning' : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('complaint.comment')}
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground outline-none resize-none"
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={loading}
        className="gradient-btn py-2 px-4 text-sm flex items-center gap-1"
      >
        <Send className="w-3 h-3" />
        {t('complaint.submitFeedback')}
      </motion.button>
    </motion.form>
  );
};

export default FeedbackForm;
