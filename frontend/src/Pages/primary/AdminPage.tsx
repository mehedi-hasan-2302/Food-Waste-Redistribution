import React, { useState } from "react";
import {
  BarChart,
    FileCheck,
    Pizza,
Users,
} from "lucide-react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import UserManagement from "@/components/admin/UserManagement";
import VerificationRequests from "@/components/admin/VerificationRequests";
import ListingManagement from "@/components/admin/ListingManagement";

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs: Record<string, React.ReactNode> = {
    dashboard: <DashboardStats />,
    verifications: <VerificationRequests />,
    users: <UserManagement />,
    listings: <ListingManagement />,
  };

  const tabIcons: Record<string, React.ReactNode> = {
    dashboard: <BarChart className="h-5 w-5 mr-2" />,
    verifications: <FileCheck className="h-5 w-5 mr-2" />,
    users: <Users className="h-5 w-5 mr-2" />,
    listings: <Pizza className="h-5 w-5 mr-2" />,
  };

  return (
    <div
      className="min-h-screen bg-light-beige font-sans text-dark-text p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-serif text-brand-green">Admin Panel</h1>
          <p className="text-gray-600 mt-1">
            Manage platform activities and users.
          </p>
        </header>

        <div className="border-b border-gray-300">
          <nav
            className="-mb-px flex space-x-6 overflow-x-auto"
            aria-label="Tabs"
          >
            {Object.keys(tabs).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-highlight text-highlight"
                    : "border-transparent text-gray-500 hover:text-dark-text hover:border-gray-400"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center capitalize transition-colors duration-200`}
              >
                {tabIcons[tab]}
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <main className="mt-6">{tabs[activeTab]}</main>
      </div>
    </div>
  );
};

export default AdminPage;
