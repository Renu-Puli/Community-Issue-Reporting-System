import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPatch } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, BarChart3, Users, Filter, Shield, UserCog, ClipboardList, Eye, Star } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WelcomeHero from '@/components/WelcomeHero';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  priority: string;
  assignedWorker: { _id: string; name: string; email: string; profession?: string } | null;
  user: { _id: string; name: string; email: string } | null;
  remarks?: string;
  issueImage?: string;
  proofImage?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  createdAt: string;
}

interface Worker {
  _id: string;
  name: string;
  email: string;
  profession?: string;
}

const CHART_COLORS = ['hsl(38, 92%, 50%)', 'hsl(230, 80%, 56%)', 'hsl(152, 60%, 42%)'];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const { token } = useAuth();
  const navigate = useNavigate();
  const fetchData = async () => {
    if (!token) {
      // Not authenticated – redirect to login
      navigate('/login');
      return;
    }
    try {
      const [complaintsData, workersData] = await Promise.all([
        apiGet<Complaint[]>('/api/complaints'),
        apiGet<Worker[]>('/api/auth/workers'),
      ]);
      setComplaints(complaintsData);
      setWorkers(workersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const priorityMap: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const filtered = complaints.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => {
    const priorityA = priorityMap[a.priority] || 2; // Default to Medium if undefined
    const priorityB = priorityMap[b.priority] || 2;
    return priorityB - priorityA;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length,
    completed: complaints.filter((c) => c.status === 'Completed').length,
  };

  const pieData = [
    { name: t('dashboard.pending'), value: stats.pending },
    { name: t('dashboard.inProcess'), value: stats.inProgress },
    { name: t('dashboard.completed'), value: stats.completed },
  ];

  const categoryData = ['roads', 'water', 'electricity', 'sanitation', 'parks', 'worker', 'drainage_cleaner', 'garbage_collection', 'other'].map((cat) => ({
    name: t(`complaint.categories.${cat}`),
    count: complaints.filter((c) => c.category === cat).length,
  }));

  const updateComplaint = async (id: string, updates: Record<string, any>) => {
    try {
      await apiPatch(`/api/complaints/${id}`, updates);
      toast.success(t('common.success'));
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t('dashboard.updateFailed'));
    }
  };

  const statCards = [
    { label: t('dashboard.totalComplaints'), value: stats.total, icon: FileText, color: 'text-primary' },
    { label: t('dashboard.pending'), value: stats.pending, icon: AlertCircle, color: 'text-warning' },
    { label: t('dashboard.inProcess'), value: stats.inProgress, icon: Clock, color: 'text-primary' },
    { label: t('dashboard.completed'), value: stats.completed, icon: CheckCircle, color: 'text-success' },
  ];

  const adminCapabilities = [
    { icon: Eye, text: t('dashboard.allComplaints') },
    { icon: UserCog, text: t('complaint.assignWorker') },
    { icon: ClipboardList, text: t('dashboard.changePriority') + ' & ' + t('dashboard.changeStatus') },
    { icon: Shield, text: t('dashboard.workersDirectory') },
  ];

  return (
    <div className="space-y-6 dashboard-admin min-h-full p-1">
      <WelcomeHero
        name={profile?.name || ''}
        roleBadge={t('roles.admin')}
        roleDescription={t('roles.adminDesc')}
        capabilities={adminCapabilities}
        accentClass="admin-hero"
        badgeClass="badge-admin"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4 admin-stat-card">
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">{t('complaint.status')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">{t('complaint.category')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(230, 80%, 56%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-foreground outline-none">
          <option value="all">{t('dashboard.all')}</option>
          <option value="Pending">{t('complaint.statuses.pending')}</option>
          <option value="Assigned">{t('complaint.statuses.assigned')}</option>
          <option value="In Progress">{t('complaint.statuses.inProgress')}</option>
          <option value="Completed">{t('complaint.statuses.completed')}</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-sm bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-foreground outline-none">
          <option value="all">{t('dashboard.all')}</option>
          {['roads', 'water', 'electricity', 'sanitation', 'parks', 'worker', 'drainage_cleaner', 'garbage_collection', 'other'].map((c) => (
            <option key={c} value={c}>{t(`complaint.categories.${c}`)}</option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="text-sm bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-foreground outline-none">
          <option value="all">{t('dashboard.all')}</option>
          <option value="Low">{t('complaint.priorities.low')}</option>
          <option value="Medium">{t('complaint.priorities.medium')}</option>
          <option value="High">{t('complaint.priorities.high')}</option>
          <option value="Critical">{t('complaint.priorities.critical')}</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">{t('complaint.title')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('complaint.category')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('complaint.status')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('complaint.priority')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('complaint.assignWorker')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.location}</p>
                    {c.user && <p className="text-xs text-muted-foreground">{t('complaint.byUser')}: {c.user.name}</p>}
                    {c.feedback && (
                      <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/10">
                        <div className="flex gap-1 mb-1">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-3 h-3 ${i < c.feedback!.rating ? 'text-warning fill-warning' : 'text-muted-foreground opacity-30'}`} />
                           ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">"{c.feedback.comment}"</p>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-xs">{t(`complaint.categories.${c.category}`)}</td>
                  <td className="p-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateComplaint(c._id, { status: e.target.value })}
                      className="text-xs bg-muted/50 border border-border rounded-lg px-2 py-1 outline-none text-foreground"
                    >
                      <option value="Pending">{t('complaint.statuses.pending')}</option>
                      <option value="Assigned">{t('complaint.statuses.assigned')}</option>
                      <option value="In Progress">{t('complaint.statuses.inProgress')}</option>
                      <option value="Completed">{t('complaint.statuses.completed')}</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={c.priority || 'Medium'}
                      onChange={(e) => updateComplaint(c._id, { priority: e.target.value })}
                      className="text-xs bg-muted/50 border border-border rounded-lg px-2 py-1 outline-none text-foreground"
                    >
                      <option value="Low">{t('complaint.priorities.low')}</option>
                      <option value="Medium">{t('complaint.priorities.medium')}</option>
                      <option value="High">{t('complaint.priorities.high')}</option>
                      <option value="Critical">{t('complaint.priorities.critical')}</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {c.status === 'Completed' ? (
                      <div className="text-sm font-medium text-foreground py-1">
                        {c.assignedWorker ? `✅ ${c.assignedWorker.name}` : t('complaint.unassigned')}
                      </div>
                    ) : (
                      <>
                        <select
                          value={c.assignedWorker?._id || ''}
                          onChange={(e) => updateComplaint(c._id, { assignedWorker: e.target.value || null })}
                          className="text-xs bg-muted/50 border border-border rounded-lg px-2 py-1 outline-none text-foreground"
                        >
                          <option value="">{t('complaint.unassigned')}</option>
                          {workers.map((w) => (
                            <option key={w._id} value={w._id}>
                              {w.name}{w.profession ? ` (${w.profession.replace('_', ' ')})` : ''}
                            </option>
                          ))}
                        </select>
                        {c.assignedWorker && (
                          <p className="text-[10px] mt-1 text-muted-foreground">✅ {c.assignedWorker.name}</p>
                        )}
                      </>
                    )}
                    {c.issueImage && (
                      <div className="mt-2 text-left">
                        <a href={c.issueImage} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{t('complaint.issueImage') || 'View Issue'}</a>
                      </div>
                    )}
                    {c.proofImage && (
                      <div className="mt-2 text-left">
                        <a href={c.proofImage} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{t('dashboard.proofOfCompletion') || 'View Proof'}</a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-muted-foreground text-sm p-4">{t('common.loading')}</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-muted-foreground text-sm p-4 text-center">{t('complaint.noComplaintsFound')}</p>
          )}
        </div>
      </div>

      {/* Workers Directory */}
      {workers.length > 0 && (
        <>
          <h2 className="text-lg font-semibold font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t('dashboard.workersDirectory')}
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">{t('workers.name')}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t('workers.email')}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t('workers.profession')}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t('workers.assignedTasks')}</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium text-foreground">{w.name}</td>
                      <td className="p-3 text-xs text-muted-foreground">{w.email}</td>
                      <td className="p-3 text-xs capitalize text-muted-foreground">
                        {w.profession?.replace('_', ' ') || '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {complaints.filter((c) => c.assignedWorker?._id === w._id).length} {t('complaint.tasks')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
