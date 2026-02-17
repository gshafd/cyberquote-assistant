import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditableField } from '@/components/EditableField';
import { Submission, AIField } from '@/types/underwriting';
import { useAppState } from '@/context/AppContext';
import {
  FileSearch,
  UserCheck,
  CheckCircle,
  Shield,
  Building2,
  Calendar,
} from 'lucide-react';

interface IntakeSummaryReadOnlyProps {
  submission: Submission;
}

// Helper to create default AIField for optional fields
const createDefaultAIField = <T,>(value: T): AIField<T> => ({
  value,
  confidence: 0,
  rationale: '',
  citations: [],
  isEdited: false,
});

export function IntakeSummaryReadOnly({ submission }: IntakeSummaryReadOnlyProps) {
  const { dispatch } = useAppState();

  const handleFieldSave = <T extends string | number | boolean>(
    fieldPath: string,
    newValue: T,
    comment: string
  ) => {
    const now = new Date().toISOString();
    const pathParts = fieldPath.split('.');
    
    const updatedSubmission = JSON.parse(JSON.stringify(submission));
    
    let target = updatedSubmission;
    for (let i = 0; i < pathParts.length - 1; i++) {
      target = target[pathParts[i]];
    }
    const fieldName = pathParts[pathParts.length - 1];
    const field = target[fieldName] as AIField<T>;
    
    target[fieldName] = {
      ...field,
      value: newValue,
      isEdited: true,
      originalValue: field.originalValue ?? field.value,
      editedBy: 'Intake Specialist',
      editedAt: now,
      confidence: 100,
    };

    updatedSubmission.updatedAt = now;
    updatedSubmission.history = [
      ...updatedSubmission.history,
      {
        id: `event-${Date.now()}`,
        timestamp: now,
        type: 'field_edit' as const,
        actor: 'Intake Specialist',
        actorRole: 'intake' as const,
        description: `Edited ${fieldPath}: "${field.value}" → "${newValue}"${comment ? ` (${comment})` : ''}`,
      },
    ];

    // Add to submission's feedbackLog
    if (comment) {
      updatedSubmission.feedbackLog = [
        ...updatedSubmission.feedbackLog,
        {
          id: `feedback-${Date.now()}`,
          submissionId: submission.id,
          fieldPath,
          fieldLabel: fieldPath.split('.').pop() || fieldPath,
          originalValue: field.value,
          newValue,
          editedBy: 'Intake Specialist',
          editedAt: now,
          feedbackComment: comment,
          stage: submission.stage,
          substage: submission.substage,
        },
      ];
    }

    dispatch({ type: 'UPDATE_SUBMISSION', payload: updatedSubmission });
  };

  return (
    <div className="space-y-4">
      {/* Header Status */}
      <div className="p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-4">
        <CheckCircle size={32} className="text-success" />
        <div>
          <p className="font-medium text-success">Intake Completed</p>
          <p className="text-sm text-muted-foreground">
            All intake stages completed successfully • Currently in <strong>{submission.stage.replace(/_/g, ' ')}</strong> stage
            {submission.assignedUnderwriter && ` • Assigned to ${submission.assignedUnderwriter.name}`}
          </p>
        </div>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 size={18} className="text-success" />
            Account Details
            <Badge variant="outline" className="text-success border-success">Editable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <EditableField
            field={submission.insured.name}
            label="Company Name"
            fieldPath="insured.name"
            onSave={(val, comment) => handleFieldSave('insured.name', val, comment)}
          />
          <EditableField
            field={submission.insured.dba || createDefaultAIField('N/A')}
            label="DBA"
            fieldPath="insured.dba"
            onSave={(val, comment) => handleFieldSave('insured.dba', val, comment)}
          />
          <EditableField
            field={submission.insured.address || createDefaultAIField('N/A')}
            label="Address"
            fieldPath="insured.address"
            onSave={(val, comment) => handleFieldSave('insured.address', val, comment)}
          />
          <EditableField
            field={submission.insured.website}
            label="Website"
            fieldPath="insured.website"
            onSave={(val, comment) => handleFieldSave('insured.website', val, comment)}
          />
          <EditableField
            field={submission.insured.yearEstablished || createDefaultAIField(0)}
            label="Year Established"
            fieldPath="insured.yearEstablished"
            type="number"
            formatValue={(val) => val === 0 ? 'N/A' : String(val)}
            onSave={(val, comment) => handleFieldSave('insured.yearEstablished', val, comment)}
          />
        </CardContent>
      </Card>

      {/* Business Classification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch size={18} className="text-success" />
            Business Classification & Financials
            <Badge variant="outline" className="text-success border-success">Editable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <EditableField
            field={submission.insured.industry}
            label="Industry"
            fieldPath="insured.industry"
            onSave={(val, comment) => handleFieldSave('insured.industry', val, comment)}
          />
          <EditableField
            field={submission.insured.sicCode || createDefaultAIField('N/A')}
            label="SIC Code"
            fieldPath="insured.sicCode"
            onSave={(val, comment) => handleFieldSave('insured.sicCode', val, comment)}
          />
          <EditableField
            field={submission.insured.naicsCode || createDefaultAIField('N/A')}
            label="NAICS Code"
            fieldPath="insured.naicsCode"
            onSave={(val, comment) => handleFieldSave('insured.naicsCode', val, comment)}
          />
          <EditableField
            field={submission.insured.annualRevenue}
            label="Annual Revenue"
            fieldPath="insured.annualRevenue"
            type="number"
            formatValue={(val) => `$${(Number(val) / 1000000).toFixed(1)}M`}
            onSave={(val, comment) => handleFieldSave('insured.annualRevenue', val, comment)}
          />
          <EditableField
            field={submission.insured.employeeCount}
            label="Employee Count"
            fieldPath="insured.employeeCount"
            type="number"
            formatValue={(val) => Number(val).toLocaleString()}
            onSave={(val, comment) => handleFieldSave('insured.employeeCount', val, comment)}
          />
        </CardContent>
      </Card>

      {/* Product & Effective Period */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar size={18} className="text-success" />
            Product & Effective Period
            <Badge variant="outline" className="text-success border-success">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Product</span>
            <p className="font-medium text-foreground">Cyber Liability</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coverage Type</span>
            <p className="font-medium text-foreground">Primary</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Effective Date</span>
            <p className="font-medium text-foreground">
              {submission.quote?.effectiveDate || submission.sourcePortal?.effectiveDate || submission.sourceEDI?.effectiveDate || 'TBD'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expiration Date</span>
            <p className="font-medium text-foreground">
              {submission.quote?.expirationDate || submission.sourcePortal?.expirationDate || submission.sourceEDI?.expirationDate || 'TBD'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Producer Verification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck size={18} className="text-success" />
            Producer Verification
            <Badge variant="outline" className="text-success border-success">Editable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EditableField
            field={submission.producer.name}
            label="Producer Name"
            fieldPath="producer.name"
            onSave={(val, comment) => handleFieldSave('producer.name', val, comment)}
          />
          <EditableField
            field={submission.producer.agency}
            label="Agency"
            fieldPath="producer.agency"
            onSave={(val, comment) => handleFieldSave('producer.agency', val, comment)}
          />
          <EditableField
            field={submission.producer.license}
            label="License"
            fieldPath="producer.license"
            onSave={(val, comment) => handleFieldSave('producer.license', val, comment)}
          />
          <EditableField
            field={submission.producer.state}
            label="State"
            fieldPath="producer.state"
            onSave={(val, comment) => handleFieldSave('producer.state', val, comment)}
          />
          <EditableField
            field={submission.producer.email}
            label="Email"
            fieldPath="producer.email"
            onSave={(val, comment) => handleFieldSave('producer.email', val, comment)}
          />
          <EditableField
            field={submission.producer.phone}
            label="Phone"
            fieldPath="producer.phone"
            onSave={(val, comment) => handleFieldSave('producer.phone', val, comment)}
          />
          <EditableField
            field={submission.producer.tier as AIField<string>}
            label="Producer Tier"
            fieldPath="producer.tier"
            onSave={(val, comment) => handleFieldSave('producer.tier', val, comment)}
          />
        </CardContent>
      </Card>

      {/* Initial Validation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={18} className="text-success" />
            Initial Validation (Security Controls)
            <Badge variant="outline" className="text-success border-success">Editable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EditableField
            field={submission.controls.hasMFA}
            label="MFA Enabled"
            fieldPath="controls.hasMFA"
            type="boolean"
            formatValue={(val) => val ? 'Yes' : 'No'}
            onSave={(val, comment) => handleFieldSave('controls.hasMFA', val, comment)}
          />
          <EditableField
            field={submission.controls.hasEDR}
            label="EDR Deployed"
            fieldPath="controls.hasEDR"
            type="boolean"
            formatValue={(val) => val ? 'Yes' : 'No'}
            onSave={(val, comment) => handleFieldSave('controls.hasEDR', val, comment)}
          />
          <EditableField
            field={submission.controls.hasSOC2}
            label="SOC2 Certified"
            fieldPath="controls.hasSOC2"
            type="boolean"
            formatValue={(val) => val ? 'Yes' : 'No'}
            onSave={(val, comment) => handleFieldSave('controls.hasSOC2', val, comment)}
          />
          <EditableField
            field={submission.controls.hasBackups}
            label="Backups"
            fieldPath="controls.hasBackups"
            type="boolean"
            formatValue={(val) => val ? 'Yes' : 'No'}
            onSave={(val, comment) => handleFieldSave('controls.hasBackups', val, comment)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
