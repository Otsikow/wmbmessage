import React, { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { EngagementProvider } from "@/contexts/EngagementContext";
import { ReadingPlanProvider } from "@/contexts/ReadingPlanContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";

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
import ReadingPlans from "./pages/ReadingPlans";
import ReadingPlanDetail from "./pages/ReadingPlanDetail";
import ReadingSession from "./pages/ReadingSession";

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

const withSectionBoundary = (
  section: string,
  element: ReactNode,
  description?: string,
) => (
  <SectionErrorBoundary section={section} description={description}>
    {element}
  </SectionErrorBoundary>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <CalendarProvider>
            <EngagementProvider>
              <ReadingPlanProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <OfflineIndicator />
                  <GlobalLoadingOverlay />
                  <BrowserRouter>
                    <RouteErrorBoundary>
                    <Routes>
                      {/* Home Page */}
                      <Route
                        path="/"
                        element={withSectionBoundary("Home", <Index />)}
                      />

                      {/* Main Navigation Routes */}
                      <Route
                        path="/search"
                        element={withSectionBoundary("Search", <SearchPage />)}
                      />
                      <Route
                        path="/bible"
                        element={withSectionBoundary("Bible Reader", <Reader />)}
                      />
                      <Route
                        path="/reader"
                        element={withSectionBoundary("Bible Reader", <Reader />)}
                      /> {/* Legacy route */}
                      <Route
                        path="/messages"
                        element={withSectionBoundary("Sermons", <WMBSermons />)}
                      />
                      <Route
                        path="/wmb-sermons"
                        element={withSectionBoundary("Sermons", <WMBSermons />)}
                      /> {/* Legacy route */}
                      <Route
                        path="/message-reader"
                        element={withSectionBoundary("Message Reader", <MessageReader />)}
                      />
                      <Route
                        path="/cross-references"
                        element={withSectionBoundary("Cross References", <CrossReferences />)}
                      />

                      {/* Protected Routes */}
                      <Route
                        path="/notes"
                        element={
                          <ProtectedRoute>
                            {withSectionBoundary("Notes", <Notes />)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/daily"
                        element={withSectionBoundary("Daily Verse", <DailyVerse />)}
                      />
                      <Route
                        path="/library"
                        element={
                          <ProtectedRoute>
                            {withSectionBoundary("Library", <Library />)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={withSectionBoundary("Settings", <Settings />)}
                      />
                      <Route
                        path="/collections"
                        element={
                          <ProtectedRoute>
                            {withSectionBoundary("Collections", <Collections />)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/more"
                        element={withSectionBoundary("More", <More />)}
                      />
                      <Route
                        path="/calendar"
                        element={withSectionBoundary("Calendar", <Calendar />)}
                      />
                      <Route
                        path="/downloads"
                        element={withSectionBoundary("Downloads", <Downloads />)}
                      />
                      <Route
                        path="/share"
                        element={withSectionBoundary("Share", <Share />)}
                      />
                      <Route
                        path="/help"
                        element={withSectionBoundary("Help", <Help />)}
                      />
                      <Route
                        path="/about"
                        element={withSectionBoundary("About", <About />)}
                      />

                      {/* Auth Routes */}
                      <Route
                        path="/auth/sign-in"
                        element={withSectionBoundary("Sign in", <SignIn />)}
                      />
                      <Route
                        path="/auth/sign-up"
                        element={withSectionBoundary("Sign up", <SignUp />)}
                      />
                      <Route
                        path="/auth/verify-email"
                        element={withSectionBoundary("Verify email", <VerifyEmail />)}
                      />
                      <Route
                        path="/auth/forgot-password"
                        element={withSectionBoundary("Forgot password", <ForgotPassword />)}
                      />
                      <Route
                        path="/auth/reset-password"
                        element={withSectionBoundary("Reset password", <ResetPassword />)}
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            {withSectionBoundary("Profile", <Profile />)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            {withSectionBoundary("Admin", <Admin />)}
                          </ProtectedRoute>
                        }
                      />

                      {/* Legal Pages */}
                      <Route
                        path="/privacy"
                        element={withSectionBoundary("Privacy", <Privacy />)}
                      />
                      <Route
                        path="/terms"
                        element={withSectionBoundary("Terms", <Terms />)}
                      />

                      <Route
                        path="/plans"
                        element={withSectionBoundary("Reading Plans", <ReadingPlans />)}
                      />
                      <Route
                        path="/plans/:planId"
                        element={withSectionBoundary(
                          "Plan detail",
                          <ReadingPlanDetail />,
                        )}
                      />
                      <Route
                        path="/plans/:planId/day/:dayNumber"
                        element={withSectionBoundary(
                          "Reading session",
                          <ReadingSession />,
                        )}
                      />
                      {/* Catch-All */}
                      <Route
                        path="*"
                        element={withSectionBoundary("Not found", <NotFound />)}
                      />
                    </Routes>
                  </RouteErrorBoundary>
                </BrowserRouter>
              </TooltipProvider>
            </ReadingPlanProvider>
            </EngagementProvider>
          </CalendarProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
