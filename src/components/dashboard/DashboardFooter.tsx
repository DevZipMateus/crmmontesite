
import React from "react";

const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-gray-500">
          © {currentYear} CRM MonteSite - Sistema de Gerenciamento de Sites
        </p>
      </div>
    </footer>
  );
};

export default DashboardFooter;
