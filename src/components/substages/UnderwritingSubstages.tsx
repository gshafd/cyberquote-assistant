import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditableField } from '@/components/EditableField';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { ThreatSignals } from '@/components/ThreatSignals';
import { Submission, UnderwritingSubstage, RiskProfile, CoverageRecommendation, PricingDetails, Quote } from '@/types/underwriting';
import {
  Shield,
  Scale,
  FileText,
  DollarSign,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Clipboard,
  BookCheck,
} from 'lucide-react';

interface UnderwritingSubstagesProps {
  submission: Submission;
  currentSubstage: UnderwritingSubstage;
  onFieldEdit: (fieldPath: string, newValue: any, label: string, comment: string) => void;
  onAdvanceSubstage: () => void;
}

const substageOrder: UnderwritingSubstage[] = [
  'risk_profiling',
  'rules_check',
  'coverage_determination',
  'pricing',
  'quote_draft',
  'quote_review',
  'binding',
];

export function UnderwritingSubstages({
  submission,
  currentSubstage,
  onFieldEdit,
  onAdvanceSubstage,
}: UnderwritingSubstagesProps) {
  const currentIdx = substageOrder.indexOf(currentSubstage);

  return (
    <div className="space-y-4">
      {/* Substage Progress */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
        {substageOrder.map((substage, idx) => (
          <div key={substage} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                idx < currentIdx
                  ? 'bg-success/20 text-success'
                  : idx === currentIdx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < currentIdx ? <CheckCircle size={10} /> : null}
              {substage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            {idx < substageOrder.length - 1 && (
              <ArrowRight size={12} className="text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Risk Profiling */}
      {currentIdx >= 0 && submission.riskProfile && (
        <RiskProfilingCard
          riskProfile={submission.riskProfile}
          onFieldEdit={onFieldEdit}
          isComplete={currentIdx > 0}
        />
      )}

      {/* Rules Check */}
      {currentIdx >= 1 && (
        <RulesCheckCard
          submission={submission}
          isComplete={currentIdx > 1}
        />
      )}

      {/* Coverage Determination */}
      {currentIdx >= 2 && submission.coverages && (
        <CoverageDeterminationCard
          coverages={submission.coverages}
          isComplete={currentIdx > 2}
        />
      )}

      {/* Pricing */}
      {currentIdx >= 3 && submission.quote?.pricing && (
        <PricingCard
          pricing={submission.quote.pricing}
          onFieldEdit={onFieldEdit}
          isComplete={currentIdx > 3}
        />
      )}

      {/* Quote Draft */}
      {currentIdx >= 4 && submission.quote && (
        <QuoteDraftCard
          quote={submission.quote}
          isComplete={currentIdx > 4}
        />
      )}

      {/* Quote Review */}
      {currentIdx >= 5 && (
        <QuoteReviewCard
          submission={submission}
          isComplete={currentIdx > 5}
        />
      )}

      {/* Binding */}
      {currentIdx >= 6 && (
        <BindingCard submission={submission} />
      )}

      {/* Advance Button */}
      {currentSubstage !== 'binding' && (
        <div className="flex justify-end">
          <Button onClick={onAdvanceSubstage}>
            {currentSubstage === 'quote_review' ? 'Proceed to Binding' : 'Advance to Next Step'}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

function RiskProfilingCard({
  riskProfile,
  onFieldEdit,
  isComplete,
}: {
  riskProfile: RiskProfile;
  onFieldEdit: (fieldPath: string, newValue: any, label: string, comment: string) => void;
  isComplete: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield size={18} className="text-primary" />
          Risk Profiling
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <EditableField
            field={riskProfile.overallScore}
            label="Overall Risk Score"
            fieldPath="riskProfile.overallScore"
            type="number"
            onSave={(val, comment) => onFieldEdit('riskProfile.overallScore', val, 'Overall Risk Score', comment)}
          />
          <EditableField
            field={riskProfile.industryRisk}
            label="Industry Risk"
            fieldPath="riskProfile.industryRisk"
            type="number"
            onSave={(val, comment) => onFieldEdit('riskProfile.industryRisk', val, 'Industry Risk', comment)}
          />
          <EditableField
            field={riskProfile.controlsScore}
            label="Controls Score"
            fieldPath="riskProfile.controlsScore"
            type="number"
            onSave={(val, comment) => onFieldEdit('riskProfile.controlsScore', val, 'Controls Score', comment)}
          />
          <EditableField
            field={riskProfile.threatExposure}
            label="Threat Exposure"
            fieldPath="riskProfile.threatExposure"
            type="number"
            onSave={(val, comment) => onFieldEdit('riskProfile.threatExposure', val, 'Threat Exposure', comment)}
          />
        </div>

        {riskProfile.threatSignals.length > 0 && (
          <ThreatSignals signals={riskProfile.threatSignals} />
        )}

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Recommendations</p>
          <ul className="space-y-1">
            {riskProfile.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-primary">•</span>
                {rec}
              </li>
            ))}
          </ul>
          <p className="text-xs text-primary mt-3 font-mono">Source: Risk_Model_v2.1.json, Rules RP-001 to RP-005</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RulesCheckCard({ submission, isComplete }: { submission: Submission; isComplete: boolean }) {
  const rules = [
    { id: 'RC-001', name: 'Minimum Revenue Check', status: 'passed', detail: `Revenue $${(submission.insured.annualRevenue.value / 1000000).toFixed(1)}M meets minimum $10M threshold` },
    { id: 'RC-002', name: 'Industry Eligibility', status: 'passed', detail: `${submission.insured.industry.value} is an eligible industry` },
    { id: 'RC-003', name: 'Controls Minimum', status: submission.controls.hasEDR.value ? 'passed' : 'warning', detail: submission.controls.hasEDR.value ? 'EDR deployed - meets controls minimum' : 'EDR not confirmed - conditional approval' },
    { id: 'RC-004', name: 'Prior Claims History', status: 'passed', detail: 'No adverse claims history in past 3 years' },
    { id: 'RC-005', name: 'Territory Check', status: 'passed', detail: `${submission.insured.state.value} is an approved territory` },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale size={18} className="text-primary" />
          Rules Check
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {rule.status === 'passed' ? (
                  <CheckCircle size={16} className="text-success" />
                ) : (
                  <AlertTriangle size={16} className="text-warning" />
                )}
                <div>
                  <p className="text-sm font-medium">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.detail}</p>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs">{rule.id}</Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Rationale</p>
          <p className="text-sm">All mandatory rules passed. One conditional warning for EDR status requires binding condition.</p>
          <p className="text-xs text-primary mt-2 font-mono">Source: Rules_Engine.json, Section: Eligibility</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CoverageDeterminationCard({ coverages, isComplete }: { coverages: CoverageRecommendation[]; isComplete: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Coverage Determination
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {coverages.map((coverage, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{coverage.coverageType}</p>
                  <ConfidenceBadge score={coverage.confidence} size="sm" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${(coverage.recommendedLimit / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">${(coverage.recommendedDeductible / 1000).toFixed(0)}K deductible</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{coverage.rationale}</p>
              {coverage.sublimits && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {Object.entries(coverage.sublimits).map(([key, val]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {typeof val === 'number' && val > 1000 ? `$${(val / 1000000).toFixed(1)}M` : val}
                    </Badge>
                  ))}
                </div>
              )}
              {coverage.conditions && coverage.conditions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Conditions:</p>
                  <ul className="text-xs mt-1">
                    {coverage.conditions.map((c, i) => (
                      <li key={i} className="text-warning">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Rationale</p>
          <p className="text-sm">Coverage recommendations based on industry profile, revenue tier, and controls assessment.</p>
          <p className="text-xs text-primary mt-2 font-mono">Source: Product_Catalog.json, UW_Guidelines.json</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  pricing,
  onFieldEdit,
  isComplete,
}: {
  pricing: PricingDetails;
  onFieldEdit: (fieldPath: string, newValue: any, label: string, comment: string) => void;
  isComplete: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign size={18} className="text-primary" />
          Pricing
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <EditableField
              field={pricing.basePremium}
              label="Base Premium"
              fieldPath="quote.pricing.basePremium"
              type="number"
              formatValue={(v) => `$${v.toLocaleString()}`}
              onSave={(val, comment) => onFieldEdit('quote.pricing.basePremium', val, 'Base Premium', comment)}
            />
            
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-2">Risk Loadings</p>
              <div className="space-y-1">
                {pricing.riskLoadings.map((loading, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-destructive/10 rounded">
                    <span>{loading.reason}</span>
                    <span className="text-destructive">+${loading.amount.toLocaleString()} ({loading.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase mb-2">Credits</p>
              <div className="space-y-1">
                {pricing.credits.map((credit, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-success/10 rounded">
                    <span>{credit.reason}</span>
                    <span className="text-success">${credit.amount.toLocaleString()} ({credit.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <EditableField
              field={pricing.finalPremium}
              label="Final Premium"
              fieldPath="quote.pricing.finalPremium"
              type="number"
              formatValue={(v) => `$${v.toLocaleString()}`}
              onSave={(val, comment) => onFieldEdit('quote.pricing.finalPremium', val, 'Final Premium', comment)}
            />
            <EditableField
              field={pricing.ratePerMillion}
              label="Rate per $1M"
              fieldPath="quote.pricing.ratePerMillion"
              type="number"
              formatValue={(v) => `$${v.toLocaleString()}`}
              onSave={(val, comment) => onFieldEdit('quote.pricing.ratePerMillion', val, 'Rate per $1M', comment)}
            />
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Cost (incl. taxes & fees)</p>
              <p className="text-2xl font-bold text-primary">${pricing.totalCost.value.toLocaleString()}</p>
              <ConfidenceBadge score={pricing.totalCost.confidence} size="sm" />
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Rationale</p>
          <p className="text-sm">{pricing.finalPremium.rationale}</p>
          <p className="text-xs text-primary mt-2 font-mono">Source: Rate_Model_v3.json</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuoteDraftCard({ quote, isComplete }: { quote: Quote; isComplete: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clipboard size={18} className="text-primary" />
          Quote Draft
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Quote Number</p>
            <p className="font-mono font-medium">{quote.quoteNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Effective Date</p>
            <p className="font-medium">{quote.effectiveDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expiration Date</p>
            <p className="font-medium">{quote.expirationDate}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2">Terms</p>
            <ul className="text-sm space-y-1">
              {quote.terms.map((term, idx) => (
                <li key={idx}>• {term}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2">Conditions</p>
            <ul className="text-sm space-y-1">
              {quote.conditions.map((cond, idx) => (
                <li key={idx} className="text-warning">• {cond}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2">Exclusions</p>
            <ul className="text-sm space-y-1">
              {quote.exclusions.map((exc, idx) => (
                <li key={idx} className="text-destructive">• {exc}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuoteReviewCard({ submission, isComplete }: { submission: Submission; isComplete: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookCheck size={18} className="text-primary" />
          Quote Review
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{submission.insured.name.value}</p>
              <p className="text-sm text-muted-foreground">{submission.insured.industry.value}</p>
            </div>
            <Badge className={submission.quote?.status === 'approved' ? 'bg-success' : 'bg-warning'}>
              {submission.quote?.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Premium</p>
              <p className="text-lg font-bold">${submission.quote?.pricing.totalCost.value.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned UW</p>
              <p className="font-medium">{submission.assignedUnderwriter?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Overall Confidence</p>
              <ConfidenceBadge score={submission.confidence} />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button className="flex-1 bg-success hover:bg-success/90">
            <CheckCircle size={16} className="mr-2" />
            Approve Quote
          </Button>
          <Button variant="outline" className="flex-1">
            Request Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BindingCard({ submission }: { submission: Submission }) {
  return (
    <Card className="border-success/50 bg-success/5">
      <CardContent className="pt-6 text-center">
        <CheckCircle size={48} className="mx-auto text-success mb-4" />
        <h3 className="text-xl font-bold text-success mb-2">Ready for Binding</h3>
        <p className="text-muted-foreground mb-4">
          Quote {submission.quote?.quoteNumber} has been approved and is ready for binding.
        </p>
        <Button className="bg-success hover:bg-success/90">
          Bind Policy
        </Button>
      </CardContent>
    </Card>
  );
}
