
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Eye } from 'lucide-react';
import { FreightDetails } from '@/hooks/useFreightByCode';

interface FreightRequirementsProps {
  freight: FreightDetails;
}

const FreightRequirements: React.FC<FreightRequirementsProps> = ({ freight }) => {
  const requirements = [
    {
      icon: Shield,
      label: 'Seguro',
      required: freight.precisa_seguro,
      description: 'Seguro da carga'
    },
    {
      icon: Eye,
      label: 'Rastreador',
      required: freight.precisa_rastreador,
      description: 'Rastreamento obrigatório'
    },
    {
      icon: User,
      label: 'Ajudante',
      required: freight.precisa_ajudante,
      description: 'Ajudante para carga/descarga'
    }
  ];

  const hasRequirements = requirements.some(req => req.required);

  if (!hasRequirements) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requirements.map((req, index) => {
            if (!req.required) return null;
            
            const Icon = req.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-green-600" />
                <div>
                  <span className="text-sm font-medium text-gray-800">{req.label}</span>
                  <p className="text-xs text-gray-600">{req.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightRequirements;
