import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConfidenceBadge({
  score,
  showIcon = true,
  showLabel = false,
  size = 'md',
  className,
}: ConfidenceBadgeProps) {
  const level = score >= 85 ? 'high' : score >= 60 ? 'medium' : 'low';
  
  const Icon = level === 'high' 
    ? CheckCircle 
    : level === 'medium' 
      ? AlertTriangle 
      : AlertCircle;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center rounded-full border font-medium transition-all',
            sizeClasses[size],
            level === 'high' && 'bg-success/15 text-success border-success/30',
            level === 'medium' && 'bg-warning/15 text-warning border-warning/30',
            level === 'low' && 'bg-destructive/15 text-destructive border-destructive/30',
            className
          )}
        >
          {showIcon && <Icon size={iconSizes[size]} />}
          <span>{score}%</span>
          {showLabel && (
            <span className="capitalize ml-1 opacity-80">{level}</span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>AI Confidence: {score}% ({level})</p>
        {level === 'low' && <p className="text-destructive">Human review recommended</p>}
      </TooltipContent>
    </Tooltip>
  );
}
