import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditableField } from '@/components/EditableField';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Submission, FeedbackEntry, IntakeSubstage } from '@/types/underwriting';
import {
  FileSearch,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface IntakeSubstagesProps {
  submission: Submission;
  currentSubstage: IntakeSubstage;
  onFieldEdit: (fieldPath: string, newValue: any, label: string, comment: string) => void;
  onAdvanceSubstage: () => void;
}

const substageOrder: IntakeSubstage[] = ['document_parsing', 'producer_verification', 'initial_validation', 'intake_complete'];

export function IntakeSubstages({ submission, currentSubstage, onFieldEdit, onAdvanceSubstage }: IntakeSubstagesProps) {
  const currentIdx = substageOrder.indexOf(currentSubstage);

  return (
    <div className="space-y-4">
      {/* Substage Progress */}
      <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
        {substageOrder.map((substage, idx) => (
          <div key={substage} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                idx < currentIdx
                  ? 'bg-success/20 text-success'
                  : idx === currentIdx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < currentIdx ? <CheckCircle size={12} /> : null}
              {substage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            {idx < substageOrder.length - 1 && (
              <ArrowRight size={14} className="text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Document Parsing Results */}
      {currentIdx >= 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSearch size={18} className="text-primary" />
              Document Parsing
              {currentIdx > 0 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <EditableField
              field={submission.insured.name}
              label="Company Name"
              fieldPath="insured.name"
              onSave={(val, comment) => onFieldEdit('insured.name', val, 'Company Name', comment)}
            />
            <EditableField
              field={submission.insured.industry}
              label="Industry"
              fieldPath="insured.industry"
              onSave={(val, comment) => onFieldEdit('insured.industry', val, 'Industry', comment)}
            />
            <EditableField
              field={submission.insured.annualRevenue}
              label="Annual Revenue"
              fieldPath="insured.annualRevenue"
              type="number"
              formatValue={(v) => `$${(v / 1000000).toFixed(1)}M`}
              onSave={(val, comment) => onFieldEdit('insured.annualRevenue', val, 'Annual Revenue', comment)}
            />
            <EditableField
              field={submission.insured.employeeCount}
              label="Employee Count"
              fieldPath="insured.employeeCount"
              type="number"
              onSave={(val, comment) => onFieldEdit('insured.employeeCount', val, 'Employee Count', comment)}
            />
            <EditableField
              field={submission.insured.website}
              label="Website"
              fieldPath="insured.website"
              onSave={(val, comment) => onFieldEdit('insured.website', val, 'Website', comment)}
            />
            <EditableField
              field={submission.insured.sicCode}
              label="SIC Code"
              fieldPath="insured.sicCode"
              onSave={(val, comment) => onFieldEdit('insured.sicCode', val, 'SIC Code', comment)}
            />
          </CardContent>
        </Card>
      )}

      {/* Producer Verification */}
      {currentIdx >= 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck size={18} className="text-primary" />
              Producer Verification
              {currentIdx > 1 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Producer Name</p>
                <p className="font-medium">{submission.producer.name}</p>
                <ConfidenceBadge score={95} size="sm" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Agency</p>
                <p className="font-medium">{submission.producer.agency}</p>
                <Badge variant="outline" className="capitalize">{submission.producer.tier}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">License</p>
                <p className="font-medium">{submission.producer.license}</p>
                <Badge className="bg-success/20 text-success">Verified</Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Rationale</p>
              <p className="text-sm">Producer matched in directory with valid license and preferred tier status. {submission.producer.activeContracts} active contracts.</p>
              <p className="text-xs text-primary mt-2 font-mono">Source: Producer_Lookup.csv, line 47</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial Validation */}
      {currentIdx >= 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle size={18} className="text-primary" />
              Initial Validation
              {currentIdx > 2 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                field={submission.controls.hasMFA}
                label="MFA Enabled"
                fieldPath="controls.hasMFA"
                type="boolean"
                formatValue={(v) => v ? 'Yes' : 'No'}
                onSave={(val, comment) => onFieldEdit('controls.hasMFA', val, 'MFA Enabled', comment)}
              />
              <EditableField
                field={submission.controls.hasEDR}
                label="EDR Deployed"
                fieldPath="controls.hasEDR"
                type="boolean"
                formatValue={(v) => v ? 'Yes' : 'No'}
                onSave={(val, comment) => onFieldEdit('controls.hasEDR', val, 'EDR Deployed', comment)}
              />
              <EditableField
                field={submission.controls.hasSOC2}
                label="SOC2 Certified"
                fieldPath="controls.hasSOC2"
                type="boolean"
                formatValue={(v) => v ? 'Yes' : 'No'}
                onSave={(val, comment) => onFieldEdit('controls.hasSOC2', val, 'SOC2 Certified', comment)}
              />
              <EditableField
                field={submission.controls.hasBackups}
                label="Backups"
                fieldPath="controls.hasBackups"
                type="boolean"
                formatValue={(v) => v ? 'Yes' : 'No'}
                onSave={(val, comment) => onFieldEdit('controls.hasBackups', val, 'Backups', comment)}
              />
            </div>

            {submission.requiresHumanReview && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-warning shrink-0" size={20} />
                <div>
                  <p className="font-medium text-warning">Human Review Required</p>
                  <p className="text-sm text-muted-foreground mt-1">{submission.reviewReason}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advance Button */}
      {currentSubstage !== 'intake_complete' && (
        <div className="flex justify-end">
          <Button onClick={onAdvanceSubstage}>
            {currentSubstage === 'initial_validation' ? 'Complete Intake' : 'Advance to Next Step'}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      )}

      {currentSubstage === 'intake_complete' && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
          <CheckCircle size={24} className="mx-auto text-success mb-2" />
          <p className="font-medium text-success">Intake Complete</p>
          <p className="text-sm text-muted-foreground">Ready for Assignment team review</p>
        </div>
      )}
    </div>
  );
}
