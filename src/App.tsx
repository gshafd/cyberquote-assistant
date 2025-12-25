import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { AppProvider, useAppState } from "@/context/AppContext";
import Index from "@/pages/Index";
import { InboxPage } from "@/pages/InboxPage";
import { WorkbenchPage } from "@/pages/WorkbenchPage";
import { OpsConsolePage } from "@/pages/OpsConsolePage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Briefcase, 
  Settings, 
  Shield, 
  Users,
  UserCheck,
  FileText,
  LayoutDashboard
} from "lucide-react";
import { TeamRole } from "@/types/underwriting";

const queryClient = new QueryClient();

function MainLayout({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppState();

  const roles: { id: TeamRole; label: string; icon: React.ReactNode }[] = [
    { id: 'intake', label: 'Intake', icon: <FileText size={14} /> },
    { id: 'assignment', label: 'Assignment', icon: <Users size={14} /> },
    { id: 'underwriting', label: 'Underwriting', icon: <UserCheck size={14} /> },
    { id: 'ops', label: 'Ops', icon: <Settings size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4 gap-4">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
            <Shield className="w-7 h-7 text-primary shrink-0" />
            <div className="whitespace-nowrap">
              <h1 className="text-sm font-semibold text-gradient">FD Ryze® Infinity Aegis™ Underwriting AI</h1>
              <p className="text-[10px] text-muted-foreground">AI-Enabled Underwriting Platform</p>
            </div>
          </NavLink>

          <nav className="flex items-center gap-2">
            <NavLink to="/">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              )}
            </NavLink>
            <NavLink to="/inbox">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Mail size={16} />
                  Inbox
                  {state.emails.filter(e => !e.isRead).length > 0 && (
                    <Badge className="h-5 w-5 p-0 justify-center bg-primary">
                      {state.emails.filter(e => !e.isRead).length}
                    </Badge>
                  )}
                </Button>
              )}
            </NavLink>
            <NavLink to="/workbench">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Briefcase size={16} />
                  Workbench
                  <Badge variant="outline">{state.submissions.length}</Badge>
                </Button>
              )}
            </NavLink>
            <NavLink to="/ops">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Settings size={16} />
                  Ops Console
                </Button>
              )}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Team View:</span>
            {roles.map(role => (
              <Button
                key={role.id}
                variant={state.currentRole === role.id ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => dispatch({ type: 'SET_ROLE', payload: role.id })}
              >
                {role.icon}
                {role.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {children}
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/ops" element={<OpsConsolePage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

// Main App component with providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
