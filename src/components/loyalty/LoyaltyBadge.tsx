import { Star } from 'lucide-react';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function LoyaltyBadge() {
  const { user } = useAuth();
  const { points, isLoading } = useLoyaltyPoints();

  if (!user || isLoading) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full cursor-default">
          <Star className="h-4 w-4 text-primary fill-primary" />
          <span className="text-sm font-semibold text-primary">{points}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Poin Loyalty Anda</p>
      </TooltipContent>
    </Tooltip>
  );
}
