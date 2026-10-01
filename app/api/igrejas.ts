import api from './api';

export interface Igreja {
  id_igreja: number;
  nome: string;
  cidade: string | null;
  estado: string | null;
}

export async function searchIgrejas(search = ''): Promise<Igreja[]> {
  const { data } = await api.get<Igreja[]>('/igrejas', { params: { search } });
  return data;
}

export async function getIgreja(id: number): Promise<Igreja> {
  const { data } = await api.get<Igreja>(`/igrejas/${encodeURIComponent(id)}`);
  return data;
}
