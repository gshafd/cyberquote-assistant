import { FeedbackEntry } from '@/types/underwriting';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  ArrowRight, 
  User, 
  Clock,
  ExternalLink,
  GitBranch
} from 'lucide-react';
import { format } from 'date-fns';

interface FeedbackLogProps {
  entries: FeedbackEntry[];
  className?: string;
  maxHeight?: string;
  showSubmissionLink?: boolean;
  onNavigateToSubmission?: (submissionId: string) => void;
}

export function FeedbackLog({ 
  entries, 
  className, 
  maxHeight = '400px',
  showSubmissionLink = false,
  onNavigateToSubmission 
}: FeedbackLogProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
        <p>No feedback entries yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('pr-4', className)} style={{ maxHeight }}>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors animate-fade-in-up"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                {entry.stage && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {entry.stage}
                  </Badge>
                )}
                {entry.substage && (
                  <Badge variant="secondary" className="text-xs">
                    {entry.substage.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              {showSubmissionLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onNavigateToSubmission?.(entry.submissionId)}
                >
                  <ExternalLink size={12} className="mr-1" />
                  View Submission
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">
                {entry.fieldLabel}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <code className="bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs">
                  {entry.originalValue}
                </code>
                <ArrowRight size={14} className="text-muted-foreground" />
                <code className="bg-success/10 text-success px-2 py-0.5 rounded text-xs">
                  {entry.newValue}
                </code>
              </div>

              {entry.feedbackComment && (
                <div className="bg-muted/50 rounded p-2 text-sm text-muted-foreground italic">
                  "{entry.feedbackComment}"
                </div>
              )}

              {entry.downstreamImpact && entry.downstreamImpact.length > 0 && (
                <div className="flex items-start gap-2 mt-2">
                  <GitBranch size={14} className="text-warning mt-0.5" />
                  <div className="text-xs text-warning">
                    <span className="font-medium">Downstream impact:</span>
                    <ul className="mt-1 space-y-0.5">
                      {entry.downstreamImpact.map((impact, idx) => (
                        <li key={idx}>{impact}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User size={12} />
                {entry.editedBy}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {format(new Date(entry.editedAt), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
