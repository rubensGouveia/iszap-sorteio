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

export interface LinksQrCode {
  id: string; // uuid
  account_id: number; // numeric
  phone_number: string; // text
  message: string; // text
  whatsapp_link: string; // text
  qrcode_webhook_url: string; // text
  cliques: number; // numeric (default 0)
  sorteio_nome?: string; // text (opcional)
  created_at: string; // timestamp with time zone
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
      links_qr_code: {
        Row: LinksQrCode;
        Insert: Omit<LinksQrCode, 'id' | 'created_at'> & { cliques?: number };
        Update: Partial<Omit<LinksQrCode, 'id' | 'created_at'>>;
      };
    };
  };
}
