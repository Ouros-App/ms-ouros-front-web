import { springRequest } from './springClient';

export interface TarefaMeta {
  id: number;
  tipo: 'estadual' | 'individual';
  titulo: string;
  descricao: string;
  metrica: string;
  status: string;
  valorAlvo: number;
  dataCriacao?: string;
  dataFim?: string;
  regiao?: string;
  idFarm?: number;
}

interface StateGoalDTO {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  target_value?: number;
  date_creation?: string;
  date_end?: string;
  region?: string;
}

interface IndividualGoalDTO {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  target_value?: number;
  id_farm?: number;
}

export async function listarMetasEstaduais(signal?: AbortSignal): Promise<TarefaMeta[]> {
  try {
    const dados = await springRequest<StateGoalDTO[]>(
      '/state-goals',
      { method: 'GET', signal },
      'Não foi possível listar as metas estaduais.',
    );
    return (dados ?? []).map((g) => ({
      id: g.id,
      tipo: 'estadual',
      titulo: g.title,
      descricao: g.description,
      metrica: g.type,
      status: g.status,
      valorAlvo: Number(g.target_value ?? 0),
      dataCriacao: g.date_creation,
      dataFim: g.date_end,
      regiao: g.region,
    }));
  } catch (error) {
    console.warn('Falha ao carregar metas estaduais:', error);
    return [];
  }
}

export async function listarMetasIndividuais(signal?: AbortSignal): Promise<TarefaMeta[]> {
  try {
    const dados = await springRequest<IndividualGoalDTO[]>(
      '/individual-goals',
      { method: 'GET', signal },
      'Não foi possível listar as metas individuais.',
    );
    return (dados ?? []).map((g) => ({
      id: g.id,
      tipo: 'individual',
      titulo: g.title,
      descricao: g.description,
      metrica: g.type,
      status: g.status,
      valorAlvo: Number(g.target_value ?? 0),
      idFarm: g.id_farm,
    }));
  } catch (error) {
    console.warn('Falha ao carregar metas individuais:', error);
    return [];
  }
}

export async function listarTodasTarefas(signal?: AbortSignal): Promise<TarefaMeta[]> {
  const [estaduais, individuais] = await Promise.all([
    listarMetasEstaduais(signal),
    listarMetasIndividuais(signal),
  ]);
  return [...estaduais, ...individuais];
}
