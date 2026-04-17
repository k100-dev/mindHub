export type AgendamentoStatus = "Pendente" | "Confirmado" | "Cancelado";

export interface Agendamento {
  id: string;
  nome_paciente: string;
  nome_psicologo: string;
  data: string;
  horario: string;
  status: AgendamentoStatus;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      agendamentos: {
        Row: Agendamento;
        Insert: Omit<Agendamento, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Agendamento, "id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
