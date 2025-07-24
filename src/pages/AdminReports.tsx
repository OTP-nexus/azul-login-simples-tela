import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BarChart3, TrendingUp, Download, Users, DollarSign, FileText, Activity } from 'lucide-react';
import { DateRange } from 'react-day-picker';

export default function AdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Mock data for reports
  const reportsData = {
    overview: {
      totalRevenue: 45320.50,
      totalUsers: 1248,
      totalFreights: 856,
      conversionRate: 15.8
    },
    revenue: {
      monthly: [
        { month: 'Jan', value: 32000 },
        { month: 'Fev', value: 38000 },
        { month: 'Mar', value: 42000 },
        { month: 'Abr', value: 45000 },
      ]
    },
    users: {
      newUsers: 124,
      activeUsers: 892,
      churnRate: 3.2,
      avgSessionTime: '12m 34s'
    },
    platform: {
      totalFreights: 856,
      activeFreights: 234,
      completedFreights: 622,
      avgFreightValue: 2350.75
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    console.log(`Exportando relatório em ${format.toUpperCase()}`);
    // Implementar exportação
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Analytics e relatórios detalhados da plataforma</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de Relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Visão Geral</SelectItem>
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="users">Usuários</SelectItem>
              <SelectItem value="platform">Uso da Plataforma</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="last90days">Últimos 90 dias</SelectItem>
              <SelectItem value="lastyear">Último ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === 'custom' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          )}
        </div>

        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Receita Total"
                value={`R$ ${reportsData.overview.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                trend={{ value: 12.5, label: 'vs mês anterior', isPositive: true }}
              />
              <StatsCard
                title="Total de Usuários"
                value={reportsData.overview.totalUsers}
                icon={Users}
                trend={{ value: 8.2, label: 'vs mês anterior', isPositive: true }}
              />
              <StatsCard
                title="Total de Fretes"
                value={reportsData.overview.totalFreights}
                icon={Activity}
                trend={{ value: 15.3, label: 'vs mês anterior', isPositive: true }}
              />
              <StatsCard
                title="Taxa de Conversão"
                value={`${reportsData.overview.conversionRate}%`}
                icon={TrendingUp}
                trend={{ value: -2.1, label: 'vs mês anterior', isPositive: false }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Crescimento de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Gráfico de receita seria renderizado aqui</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Crescimento de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Gráfico de usuários seria renderizado aqui</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Revenue Report */}
        {selectedReport === 'revenue' && (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">MRR</h3>
                      <p className="text-2xl font-bold">R$ 15.420</p>
                      <p className="text-sm text-green-600">+12.5% vs mês anterior</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">ARR</h3>
                      <p className="text-2xl font-bold">R$ 185.040</p>
                      <p className="text-sm text-green-600">+18.2% vs ano anterior</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">Churn Rate</h3>
                      <p className="text-2xl font-bold">3.2%</p>
                      <p className="text-sm text-red-600">+0.5% vs mês anterior</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Report */}
        {selectedReport === 'users' && (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Novos Usuários"
                value={reportsData.users.newUsers}
                icon={Users}
              />
              <StatsCard
                title="Usuários Ativos"
                value={reportsData.users.activeUsers}
                icon={Activity}
              />
              <StatsCard
                title="Taxa de Churn"
                value={`${reportsData.users.churnRate}%`}
                icon={TrendingUp}
              />
              <StatsCard
                title="Tempo Médio de Sessão"
                value={reportsData.users.avgSessionTime}
                icon={Activity}
              />
            </div>
          </div>
        )}

        {/* Platform Report */}
        {selectedReport === 'platform' && (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total de Fretes"
                value={reportsData.platform.totalFreights}
                icon={FileText}
              />
              <StatsCard
                title="Fretes Ativos"
                value={reportsData.platform.activeFreights}
                icon={Activity}
              />
              <StatsCard
                title="Fretes Completos"
                value={reportsData.platform.completedFreights}
                icon={FileText}
              />
              <StatsCard
                title="Valor Médio do Frete"
                value={`R$ ${reportsData.platform.avgFreightValue.toLocaleString()}`}
                icon={DollarSign}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}