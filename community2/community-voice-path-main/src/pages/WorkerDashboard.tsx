import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPatch } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Wrench, CheckCircle, MessageSquare, ClipboardCheck,
  PenLine, PlayCircle, Clock, AlertCircle, Star
} from 'lucide-react';
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
  assignedProfession?: string;
  assignedWorker?: string | null;
  remarks?: string;
  issueImage?: string;
  proofImage?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  createdAt: string;
}

const WorkerDashboard = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [allAssigned, setAllAssigned] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksInput, setRemarksInput] = useState<Record<string, string>>({});
  const [proofImages, setProofImages] = useState<Record<string, string>>({});

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const data = await apiGet<Complaint[]>('/complaints/worker');
      setAllAssigned(data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [user]);

  // Complaints assigned to this worker but not yet picked up
  const available = allAssigned.filter((c) => c.status === 'Assigned');

  // Complaints actively in progress by this worker
  const inProgress = allAssigned.filter((c) => c.status === 'In Progress');

  // Completed
  const completed = allAssigned.filter((c) => c.status === 'Completed');

  const pickUp = async (id: string) => {
    try {
      await apiPatch(`/complaints/${id}/pick`, {});
      toast.success(t('dashboard.pickedUpSuccess'));
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message || t('dashboard.failedPickUp'));
    }
  };

  const addRemarks = async (id: string) => {
    const remarks = remarksInput[id];
    if (!remarks) { toast.error(t('dashboard.remarksRequired')); return; }
    try {
      await apiPatch(`/complaints/${id}/complete`, { remarks, status: 'In Progress' });
      toast.success(t('dashboard.remarksSaved'));
      setRemarksInput({ ...remarksInput, [id]: '' });
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message || t('dashboard.failedRemarks'));
    }
  };

  const handleImageUpload = (id: string, file: File | null) => {
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
            setProofImages((prev) => ({ ...prev, [id]: compressedDataUrl }));
          } else {
            setProofImages((prev) => ({ ...prev, [id]: rawResult }));
          }
        } catch (err) {
          console.error("Canvas compression failed, falling back to raw image", err);
          setProofImages((prev) => ({ ...prev, [id]: rawResult }));
        }
      };

      img.onerror = () => {
        console.warn("Failed to load image into canvas (possibly unsupported format like HEIC). Falling back to raw upload.");
        setProofImages((prev) => ({ ...prev, [id]: rawResult }));
      };

      if (rawResult) {
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  const markComplete = async (id: string) => {
    if (!proofImages[id]) {
      toast.error(t('dashboard.proofImageRequired') || "Proof of completion image is required to mark as completed");
      return;
    }
    try {
      await apiPatch(`/complaints/${id}/complete`, {
        status: 'Completed',
        remarks: remarksInput[id] || undefined,
        proofImage: proofImages[id],
      });
      toast.success(t('dashboard.markedCompleted'));
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message || t('dashboard.failedComplete'));
    }
  };

  const workerCapabilities = [
    { icon: ClipboardCheck, text: t('dashboard.assignedToYou') },
    { icon: PlayCircle, text: t('dashboard.availableToPickUp') },
    { icon: PenLine, text: t('complaint.remarks') },
    { icon: CheckCircle, text: t('complaint.markCompleted') },
  ];

  const workerDescription = `${t('roles.workerDesc')}`;

  const ComplaintCard = ({ c, showPickUp = false, showActions = false }: { c: Complaint; showPickUp?: boolean; showActions?: boolean }) => (
    <motion.div
      key={c._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{c.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ml-2 font-medium priority-${(c.priority || 'medium').toLowerCase()}`}>
          {c.priority || 'Medium'}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        <span>🗂 {t(`complaint.categories.${c.category}`)}</span>
        <span>📍 {c.location}</span>
        <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
      </div>

      <StatusTracker 
        status={c.status.toLowerCase() === 'pending' || c.status.toLowerCase() === 'assigned' ? 'raised' : c.status.toLowerCase() === 'in progress' ? 'process' : 'completed'} 
        onStatusClick={(rawStatus) => {
          if (rawStatus === 'In Progress' && showPickUp) {
            pickUp(c._id);
          } else if (rawStatus === 'Completed' && showActions) {
            markComplete(c._id);
          } else if (rawStatus === 'Completed' && !showActions && c.status !== 'Completed') {
            toast.error(t('dashboard.pickUpFirst') || 'Please pick up the task or upload proof to complete it.');
          }
        }}
      />

      {/* Pick Up button for newly assigned complaints */}
      {showPickUp && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => pickUp(c._id)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 text-primary text-sm font-medium border border-primary/30 hover:bg-primary/30 transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          {t('dashboard.pickUpThisTask')}
        </motion.button>
      )}

      {/* In-progress actions: remarks + complete */}
      {showActions && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input
              value={remarksInput[c._id] || ''}
              onChange={(e) => setRemarksInput({ ...remarksInput, [c._id]: e.target.value })}
              placeholder={t('dashboard.addRemarksPlaceholder')}
              className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => addRemarks(c._id)}
              className="gradient-btn px-4 py-2 text-sm"
            >
              {t('common.save')}
            </motion.button>
          </div>

          <div className="mt-2 text-left">
            <label className="block text-xs text-muted-foreground mb-1 font-medium">{t('dashboard.uploadProof') || "Upload Proof of Completion (Required)"}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(c._id, e.target.files?.[0] || null)}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
            {proofImages[c._id] && (
              <div className="mt-3">
                <p className="text-xs text-success mb-1 font-medium">Image attached and ready to upload:</p>
                <img src={proofImages[c._id]} alt="Preview" className="max-w-[150px] rounded-lg shadow border border-border" />
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => markComplete(c._id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors mt-2"
          >
            <CheckCircle className="w-4 h-4" />
            {t('dashboard.markAsCompleted')}
          </motion.button>
        </div>
      )}

      {c.remarks && (
        <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{c.remarks}</span>
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

      {c.feedback && (
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <h4 className="text-xs font-semibold mb-1 flex items-center gap-1">
             <Star className="w-3 h-3 text-warning fill-warning" /> 
             {t('dashboard.userFeedback') || 'User Feedback'}
          </h4>
          <div className="flex gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < c.feedback!.rating ? 'text-warning fill-warning' : 'text-muted-foreground opacity-30'}`}
              />
            ))}
          </div>
          <p className="text-xs text-foreground italic">"{c.feedback.comment}"</p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6 dashboard-worker min-h-full p-1">
      <WelcomeHero
        name={profile?.name || ''}
        roleBadge={`${t('roles.worker')}${profile?.profession ? ` (${profile.profession.replace('_', ' ')})` : ''}`}
        roleDescription={workerDescription}
        capabilities={workerCapabilities}
        accentClass="worker-hero"
        badgeClass="badge-worker"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 worker-stat-card">
          <AlertCircle className="w-6 h-6 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{available.length}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.availableToPickUp')}</p>
        </div>
        <div className="glass-card p-4 worker-stat-card">
          <Clock className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{inProgress.length}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.inProcess')}</p>
        </div>
        <div className="glass-card p-4 worker-stat-card">
          <CheckCircle className="w-6 h-6 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{completed.length}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.completed')}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : allAssigned.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('complaint.noComplaintsAssigned')}</p>
        </div>
      ) : (
        <>
          {/* ── SECTION 1: Available to Pick Up (Assigned status) ── */}
          {available.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-warning" />
                {t('dashboard.availableToPickUp')}
                <span className="text-sm font-normal text-muted-foreground ml-1">({available.length})</span>
              </h2>
              <div className="space-y-4">
                {available.map((c) => (
                  <ComplaintCard key={c._id} c={c} showPickUp />
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 2: In Progress ── */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('dashboard.myActiveTasks')}
                <span className="text-sm font-normal text-muted-foreground ml-1">({inProgress.length})</span>
              </h2>
              <div className="space-y-4">
                {inProgress.map((c) => (
                  <ComplaintCard key={c._id} c={c} showActions />
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 3: Completed ── */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                {t('dashboard.completedTasks')}
                <span className="text-sm font-normal text-muted-foreground ml-1">({completed.length})</span>
              </h2>
              <div className="space-y-4">
                {completed.map((c) => (
                  <ComplaintCard key={c._id} c={c} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkerDashboard;
