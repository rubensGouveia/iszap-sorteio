export interface SorteioCadastro {
  id: string;
  account_id: string;
  nome_sorteio: string;
  url_media?: string;
  created_at: string;
}

export interface Sorteio {
  id: string;
  nome: string;
  telefone: string;
  account_id: number;
  sorteio_nome: string;
  created_at: string;
  numero_sorte: number;
}

export interface Database {
  public: {
    Tables: {
      sorteio_cadastro: {
        Row: SorteioCadastro;
        Insert: Omit<SorteioCadastro, 'id' | 'created_at'>;
        Update: Partial<Omit<SorteioCadastro, 'id' | 'created_at'>>;
      };
      sorteio: {
        Row: Sorteio;
        Insert: Omit<Sorteio, 'id' | 'created_at'>;
        Update: Partial<Omit<Sorteio, 'id' | 'created_at'>>;
      };
    };
  };
}
