import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Send, Eye, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusTracker from '@/components/StatusTracker';
import WelcomeHero from '@/components/WelcomeHero';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  priority: string;
  remarks?: string;
  issueImage?: string;
  proofImage?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  createdAt: string;
}

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [feedbackRating, setFeedbackRating] = useState<Record<string, number>>({});

  const submitFeedback = async (id: string) => {
    const rating = feedbackRating[id] || 5; // Default to 5
    const comment = feedbackText[id] || '';
    if (!comment) {
      toast.error(t('dashboard.feedbackRequired') || 'Please enter a comment');
      return;
    }
    try {
      await apiPost(`/complaints/${id}/feedback`, { rating, comment });
      toast.success(t('dashboard.feedbackSubmitted') || 'Feedback submitted successfully');
      fetchComplaints();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('dashboard.failedFeedback') || 'Failed to submit feedback');
    }
  };

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const data = await apiGet<Complaint[]>('/complaints/my');
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [user]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length,
    completed: complaints.filter((c) => c.status === 'Completed').length,
  };

  const statCards = [
    { label: t('dashboard.totalComplaints'), value: stats.total, icon: FileText, color: 'text-primary' },
    { label: t('dashboard.pending'), value: stats.pending, icon: AlertCircle, color: 'text-warning' },
    { label: t('dashboard.inProcess'), value: stats.inProgress, icon: Clock, color: 'text-primary' },
    { label: t('dashboard.completed'), value: stats.completed, icon: CheckCircle, color: 'text-success' },
  ];

  const citizenCapabilities = [
    { icon: Send, text: t('dashboard.raiseComplaint') },
    { icon: Eye, text: t('dashboard.myComplaints') },
    { icon: MessageSquare, text: t('complaint.remarks') },
    { icon: Star, text: t('complaint.feedback') },
  ];

  return (
    <div className="space-y-6 dashboard-citizen min-h-full p-1">
      <WelcomeHero
        name={profile?.name || ''}
        roleBadge={t('roles.citizen')}
        roleDescription={t('roles.citizenDesc')}
        capabilities={citizenCapabilities}
        accentClass="citizen-hero"
        badgeClass="badge-citizen"
      />

      <div className="flex justify-end">
        <Link to="/dashboard/new-complaint">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="gradient-btn flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            {t('dashboard.raiseComplaint')}
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 citizen-stat-card"
          >
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold font-display mb-4">{t('dashboard.myComplaints')}</h2>
        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : complaints.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            {t('complaint.noComplaints')}
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                  <span>{t(`complaint.categories.${c.category}`)}</span>
                  <span>📍 {c.location}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <StatusTracker status={c.status.toLowerCase()} />
                {c.remarks && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    {c.remarks}
                  </div>
                )}
                {c.issueImage && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1">{t('complaint.issueImage') || 'Issue Image'}:</p>
                    <img src={c.issueImage} alt="Issue" className="max-w-[200px] rounded-lg shadow-sm border border-border" />
                  </div>
                )}
                {c.proofImage && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground font-medium mb-2">{t('dashboard.proofOfCompletion') || 'Proof of Completion'}:</p>
                    <img src={c.proofImage} alt="Completion Proof" className="max-w-xs rounded-xl shadow border border-border" />
                  </div>
                )}

                {/* Feedback Section */}
                {c.status === 'Completed' && !c.feedback && (
                  <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-warning" />
                      {t('dashboard.leaveFeedback') || 'Leave Feedback'}
                    </h4>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 cursor-pointer ${(feedbackRating[c._id] || 5) >= star ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                          onClick={() => setFeedbackRating({ ...feedbackRating, [c._id]: star })}
                        />
                      ))}
                    </div>
                    <textarea
                      value={feedbackText[c._id] || ''}
                      onChange={(e) => setFeedbackText({ ...feedbackText, [c._id]: e.target.value })}
                      placeholder={t('dashboard.feedbackPlaceholder') || 'How was the service?'}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none resize-none h-20 mb-2"
                    />
                    <button
                      onClick={() => submitFeedback(c._id)}
                      className="gradient-btn px-4 py-2 text-xs"
                    >
                      {t('common.submit') || 'Submit Feedback'}
                    </button>
                  </div>
                )}

                {c.feedback && (
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      {t('dashboard.yourFeedback') || 'Your Feedback'}
                    </h4>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (c.feedback?.rating ?? 0) ? 'text-warning fill-warning' : 'text-muted-foreground opacity-30'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground">{c.feedback.comment}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
