import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditableField } from '@/components/EditableField';
import { Submission, FeedbackEntry, IntakeSubstage } from '@/types/underwriting';
import {
  FileSearch,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  Building2,
  Calendar,
} from 'lucide-react';

interface IntakeSubstagesProps {
  submission: Submission;
  currentSubstage: IntakeSubstage;
  onFieldEdit: (fieldPath: string, newValue: any, label: string, comment: string) => void;
  onAdvanceSubstage: () => void;
}

const substageOrder: IntakeSubstage[] = ['document_parsing', 'producer_verification', 'initial_validation', 'intake_complete'];

// Helper to check if substage has any low confidence fields
const hasLowConfidenceInSubstage = (submission: Submission, substage: IntakeSubstage): boolean => {
  const threshold = 70;
  
  if (substage === 'document_parsing') {
    return [
      submission.insured.name.confidence,
      submission.insured.industry.confidence,
      submission.insured.annualRevenue.confidence,
      submission.insured.employeeCount.confidence,
      submission.insured.website.confidence,
    ].some(c => c < threshold);
  }
  if (substage === 'initial_validation') {
    return [
      submission.controls.hasMFA.confidence,
      submission.controls.hasEDR.confidence,
      submission.controls.hasSOC2.confidence,
      submission.controls.hasBackups.confidence,
    ].some(c => c < threshold);
  }
  return false;
};

export function IntakeSubstages({ submission, currentSubstage, onFieldEdit, onAdvanceSubstage }: IntakeSubstagesProps) {
  const currentIdx = substageOrder.indexOf(currentSubstage);
  const hasLowConfidence = hasLowConfidenceInSubstage(submission, currentSubstage);
  const isAutoProgressing = !hasLowConfidence && currentSubstage !== 'intake_complete';

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

      {/* Account Details & Company Information */}
      {currentIdx >= 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              Account Details
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
              field={submission.insured.dba}
              label="DBA"
              fieldPath="insured.dba"
              onSave={(val, comment) => onFieldEdit('insured.dba', val, 'DBA', comment)}
            />
            <EditableField
              field={submission.insured.address}
              label="Address"
              fieldPath="insured.address"
              onSave={(val, comment) => onFieldEdit('insured.address', val, 'Address', comment)}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <EditableField
                  field={submission.insured.city}
                  label="City"
                  fieldPath="insured.city"
                  onSave={(val, comment) => onFieldEdit('insured.city', val, 'City', comment)}
                />
              </div>
              <div className="w-20">
                <EditableField
                  field={submission.insured.state}
                  label="State"
                  fieldPath="insured.state"
                  onSave={(val, comment) => onFieldEdit('insured.state', val, 'State', comment)}
                />
              </div>
              <div className="w-24">
                <EditableField
                  field={submission.insured.zip}
                  label="ZIP"
                  fieldPath="insured.zip"
                  onSave={(val, comment) => onFieldEdit('insured.zip', val, 'ZIP', comment)}
                />
              </div>
            </div>
            <EditableField
              field={submission.insured.website}
              label="Website"
              fieldPath="insured.website"
              onSave={(val, comment) => onFieldEdit('insured.website', val, 'Website', comment)}
            />
            <EditableField
              field={submission.insured.yearEstablished}
              label="Year Established"
              fieldPath="insured.yearEstablished"
              type="number"
              onSave={(val, comment) => onFieldEdit('insured.yearEstablished', val, 'Year Established', comment)}
            />
          </CardContent>
        </Card>
      )}

      {/* Document Parsing Results - Business Details */}
      {currentIdx >= 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSearch size={18} className="text-primary" />
              Business Classification & Financials
              {currentIdx > 0 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <EditableField
              field={submission.insured.industry}
              label="Industry"
              fieldPath="insured.industry"
              onSave={(val, comment) => onFieldEdit('insured.industry', val, 'Industry', comment)}
            />
            <EditableField
              field={submission.insured.sicCode}
              label="SIC Code"
              fieldPath="insured.sicCode"
              onSave={(val, comment) => onFieldEdit('insured.sicCode', val, 'SIC Code', comment)}
            />
            <EditableField
              field={submission.insured.naicsCode}
              label="NAICS Code"
              fieldPath="insured.naicsCode"
              onSave={(val, comment) => onFieldEdit('insured.naicsCode', val, 'NAICS Code', comment)}
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
          </CardContent>
        </Card>
      )}

      {/* Product & Effective Period - Display from quote if available */}
      {currentIdx >= 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Product & Effective Period
              {currentIdx > 0 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                field={submission.producer.name}
                label="Producer Name"
                fieldPath="producer.name"
                onSave={(val, comment) => onFieldEdit('producer.name', val, 'Producer Name', comment)}
              />
              <EditableField
                field={submission.producer.agency}
                label="Agency"
                fieldPath="producer.agency"
                onSave={(val, comment) => onFieldEdit('producer.agency', val, 'Agency', comment)}
              />
              <EditableField
                field={submission.producer.license}
                label="License"
                fieldPath="producer.license"
                onSave={(val, comment) => onFieldEdit('producer.license', val, 'License', comment)}
              />
              <EditableField
                field={submission.producer.state}
                label="State"
                fieldPath="producer.state"
                onSave={(val, comment) => onFieldEdit('producer.state', val, 'State', comment)}
              />
              <EditableField
                field={submission.producer.email}
                label="Email"
                fieldPath="producer.email"
                onSave={(val, comment) => onFieldEdit('producer.email', val, 'Email', comment)}
              />
              <EditableField
                field={submission.producer.phone}
                label="Phone"
                fieldPath="producer.phone"
                onSave={(val, comment) => onFieldEdit('producer.phone', val, 'Phone', comment)}
              />
              <EditableField
                field={submission.producer.tier}
                label="Tier"
                fieldPath="producer.tier"
                onSave={(val, comment) => onFieldEdit('producer.tier', val, 'Tier', comment)}
              />
              <EditableField
                field={submission.producer.activeContracts}
                label="Active Contracts"
                fieldPath="producer.activeContracts"
                type="number"
                onSave={(val, comment) => onFieldEdit('producer.activeContracts', val, 'Active Contracts', comment)}
              />
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

      {/* Advance Button - only show when low confidence requires human review */}
      <div className="flex justify-end">
        {isAutoProgressing ? (
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <Zap size={16} />
            <span className="text-sm font-medium">Auto-advancing (high confidence)...</span>
          </div>
        ) : currentSubstage !== 'intake_complete' ? (
          <Button onClick={onAdvanceSubstage}>
            {currentSubstage === 'initial_validation' ? 'Complete Intake' : 'Advance to Next Step'}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              <div>
                <p className="font-medium text-success text-sm">Intake Complete</p>
                <p className="text-xs text-muted-foreground">
                  {submission.requiresHumanReview ? 'Waiting for review' : 'Auto-advancing to Assignment'}
                </p>
              </div>
            </div>
            {submission.requiresHumanReview && (
              <Button onClick={onAdvanceSubstage} className="bg-gradient-primary">
                Send to Assignment
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
