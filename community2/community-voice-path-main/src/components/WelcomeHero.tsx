import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface WelcomeHeroProps {
  name: string;
  roleBadge: string;
  roleDescription: string;
  capabilities: { icon: LucideIcon; text: string }[];
  accentClass: string; // e.g. "admin-hero", "worker-hero", "citizen-hero"
  badgeClass: string;
}

const WelcomeHero = ({ name, roleBadge, roleDescription, capabilities, accentClass, badgeClass }: WelcomeHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl p-6 md:p-8 ${accentClass}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Welcome, <span className="gradient-text">{name}</span>
            </h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
              {roleBadge}
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">{roleDescription}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 border border-border/50 backdrop-blur-sm text-xs text-foreground/80"
          >
            <cap.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{cap.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WelcomeHero;
