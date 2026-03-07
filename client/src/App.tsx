import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Intake from "@/pages/intake";
import Generating from "@/pages/generating";
import ItineraryView from "@/pages/itinerary";
import SurveyInvite from "@/pages/survey-invite";
import SurveyJoin from "@/pages/survey-join";
import SurveyStatus from "@/pages/survey-status";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
