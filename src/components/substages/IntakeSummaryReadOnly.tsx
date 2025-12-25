import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Submission } from '@/types/underwriting';
import {
  FileSearch,
  UserCheck,
  CheckCircle,
  Shield,
} from 'lucide-react';

interface IntakeSummaryReadOnlyProps {
  submission: Submission;
}

export function IntakeSummaryReadOnly({ submission }: IntakeSummaryReadOnlyProps) {
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

      {/* Document Parsing Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch size={18} className="text-success" />
            Document Parsing
            <Badge variant="outline" className="text-success border-success">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Company Name</p>
            <p className="font-medium">{submission.insured.name.value}</p>
            <ConfidenceBadge score={submission.insured.name.confidence} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Industry</p>
            <p className="font-medium">{submission.insured.industry.value}</p>
            <ConfidenceBadge score={submission.insured.industry.confidence} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Annual Revenue</p>
            <p className="font-medium">${(submission.insured.annualRevenue.value / 1000000).toFixed(1)}M</p>
            <ConfidenceBadge score={submission.insured.annualRevenue.confidence} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Employee Count</p>
            <p className="font-medium">{submission.insured.employeeCount.value.toLocaleString()}</p>
            <ConfidenceBadge score={submission.insured.employeeCount.confidence} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Website</p>
            <p className="font-medium">{submission.insured.website.value}</p>
            <ConfidenceBadge score={submission.insured.website.confidence} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">SIC Code</p>
            <p className="font-medium">{submission.insured.sicCode?.value || 'N/A'}</p>
            <ConfidenceBadge score={submission.insured.sicCode?.confidence || 0} size="sm" />
          </div>
        </CardContent>
      </Card>

      {/* Producer Verification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck size={18} className="text-success" />
            Producer Verification
            <Badge variant="outline" className="text-success border-success">Verified</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Producer Name</p>
              <p className="font-medium">{submission.producer.name}</p>
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
        </CardContent>
      </Card>

      {/* Initial Validation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={18} className="text-success" />
            Initial Validation
            <Badge variant="outline" className="text-success border-success">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">MFA Enabled</p>
              <p className="font-medium">{submission.controls.hasMFA.value ? 'Yes' : 'No'}</p>
              <ConfidenceBadge score={submission.controls.hasMFA.confidence} size="sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">EDR Deployed</p>
              <p className="font-medium">{submission.controls.hasEDR.value ? 'Yes' : 'No'}</p>
              <ConfidenceBadge score={submission.controls.hasEDR.confidence} size="sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">SOC2 Certified</p>
              <p className="font-medium">{submission.controls.hasSOC2.value ? 'Yes' : 'No'}</p>
              <ConfidenceBadge score={submission.controls.hasSOC2.confidence} size="sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Backups</p>
              <p className="font-medium">{submission.controls.hasBackups.value ? 'Yes' : 'No'}</p>
              <ConfidenceBadge score={submission.controls.hasBackups.confidence} size="sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
