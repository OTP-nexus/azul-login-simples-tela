
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

export const useEstados = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (!response.ok) {
          throw new Error('Erro ao buscar estados');
        }
        const data = await response.json();
        setEstados(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar estados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstados();
  }, []);

  return { estados, loading, error };
};

export const useCidades = (uf: string) => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uf) {
      setCidades([]);
      return;
    }

    const fetchCidades = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
        if (!response.ok) {
          throw new Error('Erro ao buscar cidades');
        }
        const data = await response.json();
        setCidades(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar cidades:', err);
        setCidades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCidades();
  }, [uf]);

  return { cidades, loading, error };
};

// Hook unificado que combina estados e cidades
export const useIBGE = () => {
  const { estados, loading: estadosLoading, error: estadosError } = useEstados();
  const [cidadesPorEstado, setCidadesPorEstado] = useState<Record<string, string[]>>({});

  const cidadesPorEstadoFn = (uf: string): string[] => {
    return cidadesPorEstado[uf] || [];
  };

  useEffect(() => {
    const fetchCidadesPorEstado = async () => {
      const cidades: Record<string, string[]> = {};
      
      for (const estado of estados) {
        try {
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.sigla}/municipios?orderBy=nome`);
          if (response.ok) {
            const data = await response.json();
            cidades[estado.sigla] = data.map((cidade: Cidade) => cidade.nome);
          }
        } catch (error) {
          console.error(`Erro ao buscar cidades do estado ${estado.sigla}:`, error);
          cidades[estado.sigla] = [];
        }
      }
      
      setCidadesPorEstado(cidades);
    };

    if (estados.length > 0) {
      fetchCidadesPorEstado();
    }
  }, [estados]);

  return {
    estados,
    loading: estadosLoading,
    error: estadosError,
    cidadesPorEstado: cidadesPorEstadoFn
  };
};
