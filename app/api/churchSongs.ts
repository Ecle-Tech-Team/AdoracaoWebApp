import api from "./api";

export interface ChurchSong {
  _id: string;
  titulo: string;
  autorInformado?: string | null;
  letra?: string | null;
  cifra?: string | null;
  youtube?: { videoId: string; url?: string | null } | null;
  direitos?: { tipo: SongRights; confirmacaoUsuario: boolean };
  createdAt: string;
  updatedAt: string;
}
export type SongRights = "autoral_proprio" | "dominio_publico" | "autorizado" | "uso_interno";
export interface ChurchSongInput {
  titulo: string;
  autorInformado: string;
  letra: string;
  cifra: string;
  youtubeUrl: string;
  tipoDireitos: SongRights;
  confirmacaoDireitos: boolean;
}
export const getChurchSongs = async (search = ""): Promise<ChurchSong[]> => (await api.get("/hinos-igreja", { params: { search } })).data;
export const getChurchSong = async (id: string): Promise<ChurchSong> => (await api.get(`/hinos-igreja/${encodeURIComponent(id)}`)).data;
export const createChurchSong = async (data: ChurchSongInput): Promise<{ song: ChurchSong; possibleDuplicate: boolean; matches: Pick<ChurchSong, "_id" | "titulo">[] }> => (await api.post("/hinos-igreja", data)).data;
export const updateChurchSong = async (id: string, data: ChurchSongInput): Promise<ChurchSong> => (await api.put(`/hinos-igreja/${encodeURIComponent(id)}`, data)).data;
export const deleteChurchSong = async (id: string): Promise<void> => { await api.delete(`/hinos-igreja/${encodeURIComponent(id)}`); };
