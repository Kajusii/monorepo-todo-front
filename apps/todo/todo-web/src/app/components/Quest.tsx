import { Badge, Card, CardContent, Checkbox, Button } from "@todo-monorepo/shadcn";
import { Trash2 } from "lucide-react";


interface QuestProps {
  id: string;
  title: string;
  description?: string; 
  xpReward: number | string;
  isCompleted: boolean;
  onToggle: (id: string, checked: boolean, xpReward: number | string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export const Quest = ({ 
  id, 
  title, 
  description, 
  xpReward, 
  isCompleted, 
  onToggle, 
  onDelete 
}: QuestProps) => { 
  return (
    <Card className="bg-white border border-neutral-200 p-4 rounded-xl shadow-sm transition-all hover:border-neutral-300">
      <CardContent className="flex items-start justify-between gap-4 p-0">
        
        <div className="flex items-start gap-4">
          <Checkbox
            id={`todo-${id}`}
            checked={isCompleted}
            onCheckedChange={(checked) => onToggle(id, checked as boolean, xpReward)}
            className="mt-1"
          />
          <div className="space-y-1">
            <h3 className={`text-sm font-semibold ${isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
              {title}
            </h3>
            {description && (
              <p className="text-xs text-neutral-500 leading-relaxed">
                {description}
              </p>
            )}
            {isCompleted && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded">
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="text-xs font-mono font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md whitespace-nowrap">
            +{xpReward || 0} XP
          </Badge>
          
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { // 3. Typed the click event explicitly
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};