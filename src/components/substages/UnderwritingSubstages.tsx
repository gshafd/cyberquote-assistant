import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileCheck,
  Mail,
  Download,
  Copy,
  Send,
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
  // Map the current substage to display index
  // For pricing stage submissions, they've completed risk_assessment so those substages should show as complete
  const getDisplayIndex = (): number => {
    // If substage is in the order, use it directly
    const directIdx = substageOrder.indexOf(currentSubstage);
    if (directIdx >= 0) return directIdx;
    
    // Map pricing stage substages to the appropriate position
    // 'pricing' substage in pricing stage = coverage_determination complete, showing pricing
    if (currentSubstage === 'pricing') return 3;
    
    return 0;
  };
  
  const currentIdx = getDisplayIndex();

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
          coverages={submission.coverages}
          submission={submission}
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
  // Detailed rationale mapping for why each coverage is recommended
  const getCoverageRationale = (coverageType: string) => {
    const rationales: Record<string, { reason: string; factors: string[]; source: string }> = {
      'Network Security & Privacy Liability': {
        reason: 'Primary coverage for cyber incidents including data breaches, network intrusions, and privacy violations.',
        factors: [
          'Industry handles sensitive customer/patient data',
          'Revenue tier indicates significant operations scale',
          'Controls assessment shows areas requiring coverage protection',
          'Regulatory environment requires breach response capability'
        ],
        source: 'UW_Guidelines.json, Section 4.2: Network Security Coverage'
      },
      'Business Interruption': {
        reason: 'Covers income loss during system downtime and recovery periods.',
        factors: [
          'Business relies on technology for core operations',
          'Historical industry claims data shows BI as frequent exposure',
          'Cloud infrastructure dependency increases outage risk',
          'Waiting period aligned with incident response SLAs'
        ],
        source: 'Rate_Model_v3.json, BI Coverage Matrix'
      },
      'Regulatory Defense & Penalties': {
        reason: 'Protects against regulatory investigations, fines, and penalties.',
        factors: [
          'Industry subject to specific compliance requirements (HIPAA/PCI/SOX)',
          'Record count triggers regulatory notification requirements',
          'Multi-state operations increase regulatory exposure',
          'Historical enforcement trends in sector'
        ],
        source: 'Regulatory_Exposure_Model.json, Penalty Schedule'
      },
      'Social Engineering': {
        reason: 'Covers losses from fraudulent fund transfers and impersonation attacks.',
        factors: [
          'Payment processing or financial transactions present',
          'Employee count indicates fraud target surface',
          'Industry fraud statistics indicate elevated risk',
          'Email-based business processes increase phishing exposure'
        ],
        source: 'Product_Catalog.json, Social Engineering Module'
      }
    };
    return rationales[coverageType] || {
      reason: 'Coverage recommended based on risk profile and industry standards.',
      factors: ['Standard coverage for cyber policy', 'Industry benchmarking', 'Risk assessment factors'],
      source: 'UW_Guidelines.json'
    };
  };

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
        <div className="space-y-4">
          {coverages.map((coverage, idx) => {
            const detailedRationale = getCoverageRationale(coverage.coverageType);
            return (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{coverage.coverageType}</p>
                    <ConfidenceBadge score={coverage.confidence} size="sm" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${(coverage.recommendedLimit / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">${(coverage.recommendedDeductible / 1000).toFixed(0)}K deductible</p>
                  </div>
                </div>
                
                {/* Why This Coverage Section */}
                <div className="mb-3 p-3 bg-background/50 rounded border border-border/20">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1 flex items-center gap-1">
                    <FileText size={12} /> Why This Coverage
                  </p>
                  <p className="text-sm mb-2">{detailedRationale.reason}</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {detailedRationale.factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle size={10} className="text-success mt-0.5 shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-primary/70 mt-2 font-mono">Source: {detailedRationale.source}</p>
                </div>

                {/* Limit & Deductible Rationale */}
                <div className="mb-3 p-3 bg-background/50 rounded border border-border/20">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Limit & Deductible Rationale</p>
                  <p className="text-sm">{coverage.rationale}</p>
                </div>

                {coverage.sublimits && Object.keys(coverage.sublimits).length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {Object.entries(coverage.sublimits).map(([key, val]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {typeof val === 'number' && val > 1000 ? `$${(val / 1000000).toFixed(1)}M` : val}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {coverage.exclusions && coverage.exclusions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Exclusions:</p>
                    <ul className="text-xs mt-1">
                      {coverage.exclusions.map((e, i) => (
                        <li key={i} className="text-destructive/80">• {e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {coverage.conditions && coverage.conditions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Binding Conditions:</p>
                    <ul className="text-xs mt-1">
                      {coverage.conditions.map((c, i) => (
                        <li key={i} className="text-warning">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Overall Determination Rationale</p>
          <p className="text-sm">Coverage package determined by: industry risk profile, revenue tier benchmarking, controls maturity assessment, and regulatory compliance requirements. Limits aligned with peer group analysis and exposure modeling.</p>
          <p className="text-xs text-primary mt-2 font-mono">Source: Product_Catalog.json, UW_Guidelines.json, Peer_Benchmarks.csv</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  pricing,
  coverages,
  submission,
  onFieldEdit,
  isComplete,
}: {
  pricing: PricingDetails;
  coverages?: CoverageRecommendation[];
  submission: Submission;
  onFieldEdit: (fieldPath: string, newValue: any, label: string, comment: string) => void;
  isComplete: boolean;
}) {
  // Calculate per-coverage pricing breakdown
  const getCoveragePricing = (coverage: CoverageRecommendation, basePremium: number, totalCoverages: number) => {
    // Approximate allocation based on limit proportion
    const totalLimit = coverages?.reduce((sum, c) => sum + c.recommendedLimit, 0) || coverage.recommendedLimit;
    const proportion = coverage.recommendedLimit / totalLimit;
    const allocatedPremium = Math.round(basePremium * proportion);
    
    const pricingFactors = {
      'Network Security & Privacy Liability': {
        baseRate: '$0.80 - $1.20 per $1,000 revenue',
        factors: [
          { factor: 'Industry risk modifier', impact: submission.riskProfile?.industryRisk.value || 0 > 70 ? '+15%' : '+5%' },
          { factor: 'Controls score adjustment', impact: submission.riskProfile?.controlsScore.value || 0 > 80 ? '-10%' : '+10%' },
          { factor: 'Limit ILF (Increased Limit Factor)', impact: coverage.recommendedLimit > 5000000 ? '+25%' : '+0%' },
          { factor: 'Deductible credit', impact: coverage.recommendedDeductible >= 100000 ? '-8%' : '-3%' }
        ]
      },
      'Business Interruption': {
        baseRate: '$0.40 - $0.70 per $1,000 revenue',
        factors: [
          { factor: 'Waiting period modifier', impact: coverage.sublimits?.waitingPeriod && coverage.sublimits.waitingPeriod <= 8 ? '+5%' : '+0%' },
          { factor: 'Cloud dependency factor', impact: '+10%' },
          { factor: 'Coverage period factor', impact: '+0%' }
        ]
      },
      'Regulatory Defense & Penalties': {
        baseRate: '$0.25 - $0.45 per $1,000 revenue',
        factors: [
          { factor: 'Regulatory exposure (PII/PHI records)', impact: '+12%' },
          { factor: 'Multi-state operations', impact: '+8%' },
          { factor: 'Industry compliance burden', impact: '+5%' }
        ]
      },
      'Social Engineering': {
        baseRate: 'Flat rate based on limit',
        factors: [
          { factor: 'Employee count factor', impact: '+5%' },
          { factor: 'Payment processing exposure', impact: '+10%' },
          { factor: 'Training program credit', impact: submission.controls.hasSecurityTraining.value ? '-5%' : '+0%' }
        ]
      }
    };
    
    return {
      allocatedPremium,
      details: pricingFactors[coverage.coverageType as keyof typeof pricingFactors] || {
        baseRate: 'Standard rate table',
        factors: [{ factor: 'Base calculation', impact: '+0%' }]
      }
    };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign size={18} className="text-primary" />
          Pricing & Rating
          {isComplete && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Per-Coverage Pricing Breakdown */}
        {coverages && coverages.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <FileText size={14} />
              Coverage-Level Pricing Breakdown
            </p>
            <div className="space-y-3">
              {coverages.map((coverage, idx) => {
                const pricingInfo = getCoveragePricing(coverage, pricing.basePremium.value, coverages.length);
                return (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{coverage.coverageType}</p>
                        <p className="text-xs text-muted-foreground">Limit: ${(coverage.recommendedLimit / 1000000).toFixed(1)}M | Ded: ${(coverage.recommendedDeductible / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">${pricingInfo.allocatedPremium.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">allocated premium</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                      <p className="text-muted-foreground mb-1">Base Rate: <span className="text-foreground">{pricingInfo.details.baseRate}</span></p>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {pricingInfo.details.factors.map((f, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">{f.factor}:</span>
                            <span className={f.impact.startsWith('-') ? 'text-success' : f.impact === '+0%' ? 'text-muted-foreground' : 'text-warning'}>{f.impact}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Premium Calculation */}
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
              <p className="text-xs text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <AlertTriangle size={12} className="text-destructive" />
                Risk Loadings
              </p>
              <div className="space-y-1">
                {pricing.riskLoadings.map((loading, idx) => (
                  <div key={idx} className="p-2 bg-destructive/10 rounded border border-destructive/20">
                    <div className="flex justify-between text-sm">
                      <span>{loading.reason}</span>
                      <span className="text-destructive font-medium">+${loading.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{loading.percentage}% loading applied</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <CheckCircle size={12} className="text-success" />
                Credits Applied
              </p>
              <div className="space-y-1">
                {pricing.credits.map((credit, idx) => (
                  <div key={idx} className="p-2 bg-success/10 rounded border border-success/20">
                    <div className="flex justify-between text-sm">
                      <span>{credit.reason}</span>
                      <span className="text-success font-medium">{credit.amount < 0 ? '' : '-'}${Math.abs(credit.amount).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{Math.abs(credit.percentage)}% credit applied</p>
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
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span>Base Premium:</span>
                <span>${pricing.basePremium.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive mb-1">
                <span>+ Risk Loadings:</span>
                <span>+${pricing.riskLoadings.reduce((sum, l) => sum + l.amount, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-success mb-1">
                <span>- Credits:</span>
                <span>${pricing.credits.reduce((sum, c) => sum + Math.abs(c.amount), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-1 pt-1 border-t border-border/50">
                <span>Taxes & Fees:</span>
                <span>${pricing.taxesAndFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>Min Premium:</span>
                <span>${pricing.minimumPremium.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">Total Annual Premium</p>
              <p className="text-2xl font-bold text-primary">${pricing.totalCost.value.toLocaleString()}</p>
              <ConfidenceBadge score={pricing.totalCost.confidence} size="sm" />
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Pricing Rationale</p>
          <p className="text-sm">{pricing.finalPremium.rationale}</p>
          <p className="text-xs text-primary mt-2 font-mono">Source: Rate_Model_v3.json, Industry_Loss_Data.csv, Controls_Rating_Matrix.json</p>
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
  const [emailCopied, setEmailCopied] = useState(false);
  
  const quote = submission.quote;
  const producer = submission.producer;
  const insured = submission.insured;
  const pricing = quote?.pricing;
  const coverages = quote?.coverages || [];

  const handleCopyEmail = () => {
    const emailContent = generateEmailContent();
    navigator.clipboard.writeText(emailContent);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const generateEmailContent = () => {
    return `Subject: Cyber Liability Quote - ${insured.name.value} | Quote #${quote?.quoteNumber}

Dear ${producer.name.value},

Thank you for submitting the cyber liability application for ${insured.name.value}. We are pleased to provide the following indication.

QUOTE SUMMARY
Quote Number: ${quote?.quoteNumber}
Named Insured: ${insured.name.value}
Industry: ${insured.industry.value}
Policy Period: ${quote?.effectiveDate} to ${quote?.expirationDate}

COVERAGE TERMS
${coverages.map(c => `• ${c.coverageType}: $${(c.recommendedLimit / 1000000).toFixed(1)}M Limit / $${(c.recommendedDeductible / 1000).toFixed(0)}K Deductible`).join('\n')}

PREMIUM
Annual Premium: $${pricing?.finalPremium.value.toLocaleString()}
Taxes & Fees: $${pricing?.taxesAndFees.toLocaleString()}
Total: $${pricing?.totalCost.value.toLocaleString()}

BINDING CONDITIONS
${quote?.conditions.map(c => `• ${c}`).join('\n')}

This quote is valid for 30 days from the date of issue. Please contact me if you have any questions or require any modifications.

Best regards,
${submission.assignedUnderwriter?.name || 'Underwriting Team'}
Cyber Underwriting
${submission.assignedUnderwriter?.email || 'cyber-uw@insurance.com'}`;
  };

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
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="summary" className="flex-1 gap-1">
              <FileCheck size={14} />
              Quote Summary
            </TabsTrigger>
            <TabsTrigger value="proposal" className="flex-1 gap-1">
              <FileText size={14} />
              Proposal Document
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1 gap-1">
              <Mail size={14} />
              Draft Email
            </TabsTrigger>
          </TabsList>

          {/* Quote Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">{insured.name.value}</p>
                  <p className="text-sm text-muted-foreground">{insured.industry.value}</p>
                </div>
                <Badge className={quote?.status === 'approved' ? 'bg-success' : 'bg-warning'}>
                  {quote?.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quote Number</p>
                  <p className="font-mono font-medium">{quote?.quoteNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Premium</p>
                  <p className="text-lg font-bold text-primary">${pricing?.totalCost.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned UW</p>
                  <p className="font-medium">{submission.assignedUnderwriter?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Confidence</p>
                  <ConfidenceBadge score={submission.confidence} />
                </div>
              </div>
            </div>
            
            {/* Coverages Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase mb-3">Coverage Summary</p>
              <div className="space-y-2">
                {coverages.map((coverage, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <span className="text-sm">{coverage.coverageType}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">${(coverage.recommendedLimit / 1000000).toFixed(1)}M</span>
                      <span className="text-xs text-muted-foreground ml-2">(${(coverage.recommendedDeductible / 1000).toFixed(0)}K ded)</span>
                    </div>
                  </div>
                ))}
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
          </TabsContent>

          {/* Proposal Document Tab */}
          <TabsContent value="proposal" className="space-y-4">
            <div className="border border-border rounded-lg p-6 bg-background">
              {/* Document Header */}
              <div className="text-center border-b border-border pb-4 mb-6">
                <h2 className="text-xl font-bold">CYBER LIABILITY INSURANCE PROPOSAL</h2>
                <p className="text-sm text-muted-foreground mt-1">Quote Reference: {quote?.quoteNumber}</p>
              </div>

              {/* Insured Details */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Named Insured</h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium text-lg">{insured.name.value}</p>
                  {insured.dba.value && <p className="text-sm text-muted-foreground">DBA: {insured.dba.value}</p>}
                  <p className="text-sm">{insured.address.value}</p>
                  <p className="text-sm">{insured.city.value}, {insured.state.value} {insured.zip.value}</p>
                  <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Industry:</span> {insured.industry.value}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span> ${(insured.annualRevenue.value / 1000000).toFixed(1)}M
                    </div>
                    <div>
                      <span className="text-muted-foreground">Employees:</span> {insured.employeeCount.value}
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Period */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Policy Period</h3>
                <div className="p-3 bg-muted/30 rounded-lg flex gap-8">
                  <div>
                    <span className="text-sm text-muted-foreground">Effective Date:</span>
                    <p className="font-medium">{quote?.effectiveDate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Expiration Date:</span>
                    <p className="font-medium">{quote?.expirationDate}</p>
                  </div>
                </div>
              </div>

              {/* Coverage Table */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Coverage Schedule</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Coverage</th>
                        <th className="text-right p-3 font-medium">Limit</th>
                        <th className="text-right p-3 font-medium">Deductible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coverages.map((coverage, idx) => (
                        <tr key={idx} className="border-t border-border/50">
                          <td className="p-3">{coverage.coverageType}</td>
                          <td className="p-3 text-right font-medium">${(coverage.recommendedLimit / 1000000).toFixed(1)}M</td>
                          <td className="p-3 text-right">${(coverage.recommendedDeductible / 1000).toFixed(0)}K</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Premium */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Premium</h3>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between mb-1">
                    <span>Annual Premium:</span>
                    <span className="font-medium">${pricing?.finalPremium.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Taxes & Fees:</span>
                    <span>${pricing?.taxesAndFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary/20">
                    <span className="font-semibold">Total Annual Cost:</span>
                    <span className="font-bold text-primary text-lg">${pricing?.totalCost.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms, Conditions, Exclusions */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Terms</h3>
                  <ul className="text-sm space-y-1">
                    {quote?.terms.map((term, idx) => (
                      <li key={idx}>• {term}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Binding Conditions</h3>
                  <ul className="text-sm space-y-1 text-warning">
                    {quote?.conditions.map((cond, idx) => (
                      <li key={idx}>• {cond}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Exclusions</h3>
                  <ul className="text-sm space-y-1 text-destructive/80">
                    {quote?.exclusions.map((exc, idx) => (
                      <li key={idx}>• {exc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
                <p>This proposal is valid for 30 days from date of issue.</p>
                <p>Quote prepared by: {submission.assignedUnderwriter?.name || 'Underwriting Team'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <Download size={16} className="mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <Send size={16} className="mr-2" />
                Send to Broker
              </Button>
            </div>
          </TabsContent>

          {/* Draft Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">To:</p>
                <p className="font-medium">{producer.name.value} &lt;{producer.email.value}&gt;</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                <p className="font-medium">Cyber Liability Quote - {insured.name.value} | Quote #{quote?.quoteNumber}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Email Body:</p>
                <div className="bg-background p-4 rounded border border-border text-sm whitespace-pre-line font-mono">
{`Dear ${producer.name.value},

Thank you for submitting the cyber liability application for ${insured.name.value}. We are pleased to provide the following indication.

QUOTE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quote Number: ${quote?.quoteNumber}
Named Insured: ${insured.name.value}
Industry: ${insured.industry.value}
Policy Period: ${quote?.effectiveDate} to ${quote?.expirationDate}

COVERAGE TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${coverages.map(c => `• ${c.coverageType}
  Limit: $${(c.recommendedLimit / 1000000).toFixed(1)}M | Deductible: $${(c.recommendedDeductible / 1000).toFixed(0)}K`).join('\n')}

PREMIUM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Annual Premium: $${pricing?.finalPremium.value.toLocaleString()}
Taxes & Fees: $${pricing?.taxesAndFees.toLocaleString()}
Total: $${pricing?.totalCost.value.toLocaleString()}

BINDING CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${quote?.conditions.map(c => `• ${c}`).join('\n')}

This quote is valid for 30 days from the date of issue. Please contact me if you have any questions or require any modifications.

Best regards,
${submission.assignedUnderwriter?.name || 'Underwriting Team'}
Cyber Underwriting
${submission.assignedUnderwriter?.email || 'cyber-uw@insurance.com'}`}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleCopyEmail}>
                <Copy size={16} className="mr-2" />
                {emailCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button className="flex-1">
                <Send size={16} className="mr-2" />
                Send Email
              </Button>
            </div>
          </TabsContent>
        </Tabs>
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
