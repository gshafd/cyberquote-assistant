import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AIField, Citation, FeedbackEntry } from '@/types/underwriting';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Pencil, 
  FileText, 
  MessageSquare, 
  Check, 
  X,
  History,
  Quote
} from 'lucide-react';

interface EditableFieldProps<T> {
  field: AIField<T>;
  label: string;
  fieldPath: string;
  type?: 'text' | 'number' | 'boolean' | 'textarea';
  onSave: (newValue: T, comment: string) => void;
  formatValue?: (value: T) => string;
  className?: string;
  editable?: boolean;
}

export function EditableField<T extends string | number | boolean>({
  field,
  label,
  fieldPath,
  type = 'text',
  onSave,
  formatValue,
  className,
  editable = true,
}: EditableFieldProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(field.value));
  const [comment, setComment] = useState('');

  const displayValue = formatValue ? formatValue(field.value) : String(field.value);

  const handleSave = () => {
    let newValue: T;
    if (type === 'number') {
      newValue = Number(editValue) as T;
    } else if (type === 'boolean') {
      newValue = (editValue.toLowerCase() === 'true' || editValue === 'yes') as T;
    } else {
      newValue = editValue as T;
    }
    onSave(newValue, comment);
    setIsEditing(false);
    setComment('');
  };

  const handleCancel = () => {
    setEditValue(String(field.value));
    setComment('');
    setIsEditing(false);
  };

  return (
    <div className={cn('group relative', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <ConfidenceBadge score={field.confidence} size="sm" />
            {field.isEdited && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    <History size={10} />
                    Edited
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Original: {String(field.originalValue)}</p>
                  <p>Edited by: {field.editedBy}</p>
                  <p>At: {field.editedAt}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {type === 'textarea' ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-muted border-primary/50 focus:border-primary"
                  rows={3}
                />
              ) : type === 'boolean' ? (
                <div className="flex gap-2">
                  <Button
                    variant={editValue === 'true' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditValue('true')}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={editValue === 'false' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditValue('false')}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-muted border-primary/50 focus:border-primary"
                />
              )}
              <Textarea
                placeholder="Add feedback comment (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-muted/50 text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Check size={14} className="mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X size={14} className="mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  'text-foreground font-medium',
                  editable && 'editable-field cursor-pointer'
                )}
                onClick={() => editable && setIsEditing(true)}
              >
                {displayValue}
              </span>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CitationPopover citations={field.citations} rationale={field.rationale} />
            {editable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface CitationPopoverProps {
  citations: Citation[];
  rationale: string;
}

function CitationPopover({ citations, rationale }: CitationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Quote size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="left">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" />
              Rationale
            </h4>
            <p className="text-sm text-muted-foreground">{rationale}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Sources
            </h4>
            <div className="space-y-2">
              {citations.map((citation, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-muted/50 rounded p-2 border border-border/50"
                >
                  <div className="font-mono text-primary mb-1">
                    {citation.sourceFile}
                    {citation.lineNumber && `:${citation.lineNumber}`}
                  </div>
                  <div className="text-muted-foreground italic">
                    "{citation.snippet}"
                  </div>
                  {citation.guidelineId && (
                    <div className="mt-1 text-accent">
                      Guideline: {citation.guidelineId}
                    </div>
                  )}
                  {citation.ruleId && (
                    <div className="mt-1 text-accent">
                      Rule: {citation.ruleId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
