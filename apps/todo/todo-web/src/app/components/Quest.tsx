import {
  Badge,
  Card,
  CardContent,
  Checkbox,
  Button,
} from '@todo-monorepo/shadcn';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestProps {
  id: string;
  title: string;
  description?: string;
  xpReward: number | string;
  isCompleted: boolean;
  onToggle: (
    id: string,
    checked: boolean,
    xpReward: number | string,
  ) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export const Quest = ({
  id,
  title,
  description,
  xpReward,
  isCompleted,
  onToggle,
  onDelete,
}: QuestProps) => {
  return (
    <Card className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border-white/10 hover:border-cyan-500/40 transition-all duration-500 rounded-3xl shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
      {/* Subtle background ambient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-fuchsia-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />

      <CardContent className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5">
        {/* Left Side: Checkbox & Content */}
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-1 relative">
            {/* Glow effect behind checkbox when completed */}
            {isCompleted && (
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-40" />
            )}
            <Checkbox
              id={`todo-${id}`}
              checked={isCompleted}
              onCheckedChange={(checked) =>
                onToggle(id, checked as boolean, xpReward)
              }
              className={`relative z-10 w-5 h-5 rounded-md border-2 transition-colors ${
                isCompleted
                  ? 'border-emerald-400 bg-emerald-400/20 data-[state=checked]:bg-emerald-400 data-[state=checked]:text-slate-950'
                  : 'border-white/30 bg-white/5 hover:border-cyan-400'
              }`}
            />
          </div>

          <motion.div layout className="space-y-1.5 flex-1">
            <motion.h3
              layout
              className={`text-base font-bold transition-all duration-300 ${
                isCompleted
                  ? 'line-through text-slate-500 decoration-slate-500/50'
                  : 'text-white drop-shadow-sm'
              }`}
            >
              {title}
            </motion.h3>

            {description && (
              <motion.p
                layout
                className={`text-sm leading-relaxed transition-all duration-300 ${
                  isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {description}
              </motion.p>
            )}

            {/* Status Badge */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)] text-[10px] px-2 py-0.5 rounded-lg tracking-widest uppercase font-bold mt-2">
                  Secured
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Side: Actions & XP */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:ml-4 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
          <Badge
            className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-300 ${
              isCompleted
                ? 'bg-slate-800/50 text-slate-500 border border-white/5'
                : 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)]'
            }`}
          >
            +{xpReward || 0} XP
          </Badge>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-500 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 border border-transparent rounded-xl transition-all shadow-none hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
