import { useState } from "react";
import InstitutionDashboardHeader from "../components/InstitutionDashboardHeader";
import InstitutionOverview from "../components/InstitutionOverview";
import InstitutionProfile from "../components/InstitutionProfile";
import InstitutionPrograms from "../components/InstitutionPrograms";
import InstitutionStaff from "../components/InstitutionStaff";
import InstitutionFacilities from "../components/InstitutionFacilities";
import InstitutionAnnouncements from "../components/InstitutionAnnouncements";
import ApplicationsTab from "../components/ApplicationsTab";

type Tab =
  | "overview"
  | "profile"
  | "programs"
  | "staff"
  | "facilities"
  | "announcements"
  | "applications"; 

export default function InstitutionDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <InstitutionOverview />;
      case "profile":
        return <InstitutionProfile />;
      case "programs":
        return <InstitutionPrograms />;
      case "staff":
        return <InstitutionStaff />;
      case "facilities":
        return <InstitutionFacilities />;
      case "announcements":
        return <InstitutionAnnouncements />;
        case "applications":  
        return <ApplicationsTab />;
      default:
        return <InstitutionOverview />;
    }
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <InstitutionDashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderTab()}
      </div>
    </main>
  );
}