import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import Home from "@/pages/home";
import Intake from "@/pages/intake";
import Generating from "@/pages/generating";
import ItineraryView from "@/pages/itinerary";
import SurveyInvite from "@/pages/survey-invite";
import SurveyJoin from "@/pages/survey-join";
import SurveyStatus from "@/pages/survey-status";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Contact from "@/pages/contact";
import Faq from "@/pages/faq";
import Brand from "@/pages/brand";
import Trips from "@/pages/trips";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/intake" component={Intake} />
      <Route path="/generating" component={Generating} />
      <Route path="/itinerary/:id" component={ItineraryView} />
      <Route path="/survey/invite" component={SurveyInvite} />
      <Route path="/survey/join" component={SurveyJoin} />
      <Route path="/survey/status" component={SurveyStatus} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/trips" component={Trips} />
      <Route path="/faq" component={Faq} />
      <Route path="/brand" component={Brand} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <a href="#main-content" className="skip-to-content">
              Skip to main content
            </a>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
