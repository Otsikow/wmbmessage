import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Pages
import Index from "./pages/Index";
import Reader from "./pages/Reader";
import SearchPage from "./pages/SearchPage";
import Collections from "./pages/Collections";
import Library from "./pages/Library";
import Notes from "./pages/Notes";
import More from "./pages/More";
import WMBSermons from "./pages/WMBSermons";
import MessageReader from "./pages/MessageReader";
import Calendar from "./pages/Calendar";
import Downloads from "./pages/Downloads";
import Share from "./pages/Share";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import About from "./pages/About";
import DailyVerse from "./pages/DailyVerse";
import CrossReferences from "./pages/CrossReferences";

// Auth Pages
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";

// User & Admin Pages
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

// Legal Pages
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <CalendarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <BrowserRouter>
              <Routes>
                {/* Home Page */}
                <Route path="/" element={<Index />} />

                {/* Main Navigation Routes */}
                <Route path="/search" element={<SearchPage />} />
                <Route path="/bible" element={<Reader />} />
                <Route path="/reader" element={<Reader />} /> {/* Legacy route */}
                <Route path="/messages" element={<WMBSermons />} />
                <Route path="/wmb-sermons" element={<WMBSermons />} /> {/* Legacy route */}
                <Route path="/message-reader" element={<MessageReader />} />
                <Route path="/cross-references" element={<CrossReferences />} />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <Notes />
                    </ProtectedRoute>
                  }
                />
                <Route path="/daily" element={<DailyVerse />} />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <Library />
                    </ProtectedRoute>
                  }
                />
                <Route path="/settings" element={<Settings />} />

                {/* Additional Pages */}
                <Route
                  path="/collections"
                  element={
                    <ProtectedRoute>
                      <Collections />
                    </ProtectedRoute>
                  }
                />
                <Route path="/more" element={<More />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/share" element={<Share />} />
                <Route path="/help" element={<Help />} />
                <Route path="/about" element={<About />} />

                {/* Auth Routes */}
                <Route path="/auth/sign-in" element={<SignIn />} />
                <Route path="/auth/sign-up" element={<SignUp />} />
                <Route path="/auth/verify-email" element={<VerifyEmail />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Legal Pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Catch-All Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CalendarProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
