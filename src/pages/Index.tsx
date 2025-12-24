import { Helmet } from 'react-helmet-async';
import { WorkflowSteps } from '@/components/WorkflowSteps';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { SubmissionsList } from '@/components/SubmissionsList';
import { Shield, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>FD Ryze® Infinity Aegis™ - AI-Enabled Cyber Underwriting Platform</title>
        <meta name="description" content="AI-powered cyber risk underwriting workbench for efficient submission intake, risk profiling, coverage determination, and policy issuance." />
      </Helmet>
      
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="py-8 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">AI-Powered</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Cyber Risk Underwriting Workflow
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                End-to-end AI-assisted underwriting from submission intake to policy issuance
              </p>
            </div>

            {/* Workflow Steps */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 mb-8">
              <WorkflowSteps />
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="pb-8 px-4">
          <div className="container max-w-7xl mx-auto space-y-6">
            {/* Metrics Dashboard */}
            <MetricsDashboard />

            {/* Submissions List */}
            <SubmissionsList />
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
