export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      project_customizations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["customization_priority"]
          project_id: string
          requested_at: string
          status: Database["public"]["Enums"]["customization_status"]
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["customization_priority"]
          project_id: string
          requested_at?: string
          status?: Database["public"]["Enums"]["customization_status"]
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["customization_priority"]
          project_id?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["customization_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_customizations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          blaster_link: string | null
          client_name: string
          client_type: string | null
          created_at: string | null
          domain: string | null
          id: string
          provider_credentials: string | null
          responsible_name: string | null
          status: string | null
          template: string | null
          updated_at: string | null
        }
        Insert: {
          blaster_link?: string | null
          client_name: string
          client_type?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          provider_credentials?: string | null
          responsible_name?: string | null
          status?: string | null
          template?: string | null
          updated_at?: string | null
        }
        Update: {
          blaster_link?: string | null
          client_name?: string
          client_type?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          provider_credentials?: string | null
          responsible_name?: string | null
          status?: string | null
          template?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_personalizacoes: {
        Row: {
          botaowhatsapp: boolean | null
          created_at: string | null
          depoimento_urls: string[] | null
          depoimentos: string | null
          descricao: string
          email: string
          endereco: string
          fonte: string | null
          id: string
          linkmapa: string | null
          logo_url: string | null
          midia_urls: string[] | null
          modelo: string | null
          officenome: string
          paletacores: string | null
          planos: string | null
          possuimapa: boolean | null
          possuiplanos: boolean | null
          redessociais: string | null
          responsavelnome: string
          servicos: string
          slogan: string | null
          status: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          botaowhatsapp?: boolean | null
          created_at?: string | null
          depoimento_urls?: string[] | null
          depoimentos?: string | null
          descricao: string
          email: string
          endereco: string
          fonte?: string | null
          id?: string
          linkmapa?: string | null
          logo_url?: string | null
          midia_urls?: string[] | null
          modelo?: string | null
          officenome: string
          paletacores?: string | null
          planos?: string | null
          possuimapa?: boolean | null
          possuiplanos?: boolean | null
          redessociais?: string | null
          responsavelnome: string
          servicos: string
          slogan?: string | null
          status?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          botaowhatsapp?: boolean | null
          created_at?: string | null
          depoimento_urls?: string[] | null
          depoimentos?: string | null
          descricao?: string
          email?: string
          endereco?: string
          fonte?: string | null
          id?: string
          linkmapa?: string | null
          logo_url?: string | null
          midia_urls?: string[] | null
          modelo?: string | null
          officenome?: string
          paletacores?: string | null
          planos?: string | null
          possuimapa?: boolean | null
          possuiplanos?: boolean | null
          redessociais?: string | null
          responsavelnome?: string
          servicos?: string
          slogan?: string | null
          status?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      customization_priority: "Baixa" | "Média" | "Alta" | "Urgente"
      customization_status:
        | "Solicitado"
        | "Em andamento"
        | "Concluído"
        | "Cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customization_priority: ["Baixa", "Média", "Alta", "Urgente"],
      customization_status: [
        "Solicitado",
        "Em andamento",
        "Concluído",
        "Cancelado",
      ],
    },
  },
} as const
