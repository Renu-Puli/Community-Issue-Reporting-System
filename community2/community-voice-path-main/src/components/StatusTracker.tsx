import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  status: string;
  onStatusClick?: (statusRaw: string) => void;
}

const StatusTracker = ({ status, onStatusClick }: Props) => {
  const { t } = useTranslation();
  const steps = [
    { key: 'raised', raw: 'Pending', label: t('complaint.raised'), icon: AlertCircle },
    { key: 'process', raw: 'In Progress', label: t('complaint.process'), icon: Clock },
    { key: 'completed', raw: 'Completed', label: t('complaint.completed'), icon: CheckCircle },
  ];
  
  // "assigned" translates to "raised" or "process" depending on context, let's map it:
  const normalizedStatus = status === 'assigned' ? 'raised' : status;
  const currentIndex = steps.findIndex((s) => s.key === normalizedStatus);

  return (
    <div className="flex items-center gap-2 my-3">
      {steps.map((step, i) => {
        const active = i <= currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-2 flex-1 relative group">
            <div 
              onClick={() => onStatusClick && onStatusClick(step.raw)}
              className={`flex items-center gap-1.5 transition-all ${active ? 'text-primary' : 'text-muted-foreground'} ${onStatusClick ? 'cursor-pointer hover:scale-105' : ''}`}
            >
              <Icon className={`w-4 h-4 ${onStatusClick ? 'group-hover:text-primary transition-colors' : ''}`} />
              <span className="text-xs font-medium">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: active && i < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;
