import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AppProvider, useAppState } from "@/context/AppContext";
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
  FileText
} from "lucide-react";
import { TeamRole } from "@/types/underwriting";

const queryClient = new QueryClient();

function MainLayout({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppState();
  const location = useLocation();

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
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-gradient">CyberUW Workbench</h1>
              <p className="text-xs text-muted-foreground">AI-Enabled Underwriting Platform</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/">
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
          <Route path="/" element={<InboxPage />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/ops" element={<OpsConsolePage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

const App = () => (
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

export default App;
