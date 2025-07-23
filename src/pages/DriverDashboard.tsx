import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Heart, CreditCard, Settings, MapPin, Clock, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDriverStats } from '@/hooks/useDriverStats';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from '@/components/ui/notification-center';
import { StatsCard } from '@/components/ui/stats-card';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import DriverFreightsList from '@/components/DriverFreightsList';
import DriverFavorites from '@/components/DriverFavorites';
import DriverPlans from '@/components/DriverPlans';
import DriverSettings from '@/components/DriverSettings';

const DriverDashboard = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('freights');
  const { stats, loading: statsLoading } = useDriverStats();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();

  const tabItems = [
    {
      value: 'freights',
      label: 'Fretes',
      icon: Truck,
      component: DriverFreightsList
    },
    {
      value: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      component: DriverFavorites
    },
    {
      value: 'plans',
      label: 'Planos',
      icon: CreditCard,
      component: DriverPlans
    },
    {
      value: 'settings',
      label: 'Configurações',
      icon: Settings,
      component: DriverSettings
    }
  ];

  const ActiveComponent = tabItems.find(item => item.value === activeTab)?.component || DriverFreightsList;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600">Motorista</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onRemove={removeNotification}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/driver-profile')}
                  className="p-2"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Compact for mobile */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3">
              <div className="text-center">
                <Package className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-lg font-bold">
                  {statsLoading ? '...' : stats.activeFreights}
                </div>
                <p className="text-xs text-muted-foreground">Fretes</p>
              </div>
            </Card>

            <Card className="p-3">
              <div className="text-center">
                <Heart className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-lg font-bold">
                  {statsLoading ? '...' : stats.totalFavorites}
                </div>
                <p className="text-xs text-muted-foreground">Favoritos</p>
              </div>
            </Card>

            <Card className="p-3">
              <div className="text-center">
                <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-lg font-bold">
                  {statsLoading ? '...' : stats.acceptedFreights}
                </div>
                <p className="text-xs text-muted-foreground">Aceitos</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4">
          <ActiveComponent />
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="grid grid-cols-4">
            {tabItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              
              return (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - keep existing layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard do Motorista</h1>
                  <p className="text-gray-600">Gerencie seus fretes e configurações</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onRemove={removeNotification}
                />
                <Button
                  variant="outline"
                  onClick={() => navigate('/driver-profile')}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {statsLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Fretes Disponíveis"
                value={stats.activeFreights}
                description="Disponíveis para aceitar"
                icon={Package}
                loading={statsLoading}
              />
              
              <StatsCard
                title="Meus Favoritos"
                value={stats.totalFavorites}
                description="Fretes salvos"
                icon={Heart}
                loading={statsLoading}
              />
              
              <StatsCard
                title="Fretes Aceitos"
                value={stats.acceptedFreights}
                description="Em andamento"
                icon={Clock}
                loading={statsLoading}
              />
              
              <StatsCard
                title="Concluídos"
                value={stats.completedFreights}
                description="Fretes finalizados"
                icon={Truck}
                loading={statsLoading}
              />
            </div>
          </>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="freights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="freights" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Fretes
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="freights" className="mt-6">
            <DriverFreightsList />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <DriverFavorites />
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <DriverPlans />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <DriverSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;
