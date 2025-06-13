
import { useState, useEffect } from 'react';

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export const useIBGE = () => {
  const [states, setStates] = useState<Estado[]>([]);
  const [cities, setCities] = useState<Cidade[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  // Carregar estados na inicialização
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (response.ok) {
          const data = await response.json();
          setStates(data);
        }
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Função para carregar cidades por estado
  const loadCities = async (uf: string) => {
    if (!uf) {
      setCities([]);
      return;
    }

    try {
      setLoadingCities(true);
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  return {
    states,
    cities,
    loadingStates,
    loadingCities,
    loadCities
  };
};
