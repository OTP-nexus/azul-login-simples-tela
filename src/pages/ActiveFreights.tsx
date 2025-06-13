
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActiveFreightsList from '@/components/ActiveFreightsList';

const ActiveFreights = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/company-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Dashboard</span>
              </Button>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Fretes Ativos</h1>
                <p className="text-sm text-gray-600">Gerencie todos os seus fretes</p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/freight-request')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Frete</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveFreightsList />
      </main>
    </div>
  );
};

export default ActiveFreights;
