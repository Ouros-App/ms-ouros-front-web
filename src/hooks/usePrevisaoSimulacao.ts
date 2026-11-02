import { useCallback, useState } from 'react';
import { simularRanking, type PrevisaoRanking } from '@/services/rankingService';
import type { PrevisaoEstado } from '@/types/envio.types';

export function usePrevisaoSimulacao(inicial?: PrevisaoRanking) {
    const [estado, setEstado] = useState<PrevisaoEstado<PrevisaoRanking>>({
        previsao: inicial,
        calculando: false,
        erro: '',
    });

    const calcular = useCallback(async (farmId: number, consumoAlvo: number) => {
        if (!(consumoAlvo > 0)) {
            setEstado((atual) => ({
                ...atual,
                erro: 'Informe um consumo alvo (CGI) maior que zero para calcular a previsão.',
            }));
            return;
        }
        setEstado((atual) => ({ ...atual, calculando: true, erro: '' }));
        try {
            if (!farmId) throw new Error('Nenhuma granja disponível para calcular a previsão.');
            const previsao = await simularRanking(farmId, consumoAlvo);
            setEstado({ previsao, calculando: false, erro: '' });
        } catch (error) {
            setEstado((atual) => ({
                ...atual,
                calculando: false,
                erro: error instanceof Error ? error.message : 'Não foi possível calcular a previsão.',
            }));
        }
    }, []);

    return { previsao: estado.previsao, calculando: estado.calculando, erroPrevisao: estado.erro, calcular };
}