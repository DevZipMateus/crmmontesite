
import React from "react";

const DashboardFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container max-w-7xl mx-auto px-6">
        <p className="text-center text-gray-500">
          © {new Date().getFullYear()} CRM MonteSite - Sistema de Gerenciamento de Sites
        </p>
      </div>
    </footer>
  );
};

export default DashboardFooter;
