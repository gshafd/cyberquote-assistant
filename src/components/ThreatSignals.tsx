import { ThreatSignal } from '@/types/underwriting';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Shield,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface ThreatSignalsProps {
  signals: ThreatSignal[];
  className?: string;
}

export function ThreatSignals({ signals, className }: ThreatSignalsProps) {
  if (signals.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-success bg-success/10 rounded-lg p-4', className)}>
        <Shield size={20} />
        <span className="font-medium">No active threat signals detected</span>
      </div>
    );
  }

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      bgClass: 'bg-destructive/10 border-destructive/30',
      textClass: 'text-destructive',
      badgeClass: 'bg-destructive text-destructive-foreground',
    },
    high: {
      icon: AlertTriangle,
      bgClass: 'bg-destructive/10 border-destructive/30',
      textClass: 'text-destructive',
      badgeClass: 'bg-destructive/80 text-destructive-foreground',
    },
    medium: {
      icon: AlertTriangle,
      bgClass: 'bg-warning/10 border-warning/30',
      textClass: 'text-warning',
      badgeClass: 'bg-warning text-warning-foreground',
    },
    low: {
      icon: Info,
      bgClass: 'bg-muted border-muted-foreground/20',
      textClass: 'text-muted-foreground',
      badgeClass: 'bg-muted-foreground/20 text-muted-foreground',
    },
  };

  return (
    <div className={cn('space-y-3', className)}>
      {signals.map((signal, idx) => {
        const config = severityConfig[signal.severity];
        const Icon = config.icon;

        return (
          <div
            key={idx}
            className={cn(
              'rounded-lg border p-4 transition-all',
              config.bgClass,
              signal.isResolved && 'opacity-50'
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn('mt-0.5 flex-shrink-0', config.textClass)} size={20} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('font-medium', config.textClass)}>
                    {signal.finding}
                  </span>
                  <Badge className={cn('text-xs uppercase', config.badgeClass)}>
                    {signal.severity}
                  </Badge>
                  {signal.isResolved && (
                    <Badge variant="outline" className="text-xs text-success border-success">
                      <CheckCircle size={10} className="mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {signal.details}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Source: {signal.source}</span>
                  <span>Found: {signal.dateFound}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
