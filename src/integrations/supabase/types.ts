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
      collaborators: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          sector: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          sector: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          sector?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cep: string
          city: string
          cnpj: string
          company_name: string
          complement: string | null
          confirm_phone: string
          contact_name: string
          created_at: string | null
          id: string
          is_transporter: boolean
          logo_url: string | null
          neighborhood: string
          number: string
          phone: string
          state: string
          street: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          cnpj: string
          company_name: string
          complement?: string | null
          confirm_phone: string
          contact_name: string
          created_at?: string | null
          id?: string
          is_transporter?: boolean
          logo_url?: string | null
          neighborhood: string
          number: string
          phone: string
          state: string
          street: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          cnpj?: string
          company_name?: string
          complement?: string | null
          confirm_phone?: string
          contact_name?: string
          created_at?: string | null
          id?: string
          is_transporter?: boolean
          logo_url?: string | null
          neighborhood?: string
          number?: string
          phone?: string
          state?: string
          street?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verifications: {
        Row: {
          address_proof_status:
            | Database["public"]["Enums"]["document_status"]
            | null
          address_proof_url: string | null
          cnh_document_status:
            | Database["public"]["Enums"]["document_status"]
            | null
          cnh_document_url: string | null
          cnpj_card_status:
            | Database["public"]["Enums"]["document_status"]
            | null
          cnpj_card_url: string | null
          created_at: string | null
          driver_address_proof_status:
            | Database["public"]["Enums"]["document_status"]
            | null
          driver_address_proof_url: string | null
          id: string
          overall_status: Database["public"]["Enums"]["document_status"] | null
          photo_status: Database["public"]["Enums"]["document_status"] | null
          photo_url: string | null
          rejection_reason: string | null
          responsible_document_status:
            | Database["public"]["Enums"]["document_status"]
            | null
          responsible_document_url: string | null
          updated_at: string | null
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address_proof_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          address_proof_url?: string | null
          cnh_document_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          cnh_document_url?: string | null
          cnpj_card_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          cnpj_card_url?: string | null
          created_at?: string | null
          driver_address_proof_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          driver_address_proof_url?: string | null
          id?: string
          overall_status?: Database["public"]["Enums"]["document_status"] | null
          photo_status?: Database["public"]["Enums"]["document_status"] | null
          photo_url?: string | null
          rejection_reason?: string | null
          responsible_document_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          responsible_document_url?: string | null
          updated_at?: string | null
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address_proof_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          address_proof_url?: string | null
          cnh_document_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          cnh_document_url?: string | null
          cnpj_card_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          cnpj_card_url?: string | null
          created_at?: string | null
          driver_address_proof_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          driver_address_proof_url?: string | null
          id?: string
          overall_status?: Database["public"]["Enums"]["document_status"] | null
          photo_status?: Database["public"]["Enums"]["document_status"] | null
          photo_url?: string | null
          rejection_reason?: string | null
          responsible_document_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          responsible_document_url?: string | null
          updated_at?: string | null
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          cnh: string
          cpf: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          vehicle_type: string
        }
        Insert: {
          cnh: string
          cpf: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          vehicle_type: string
        }
        Update: {
          cnh?: string
          cpf?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_price_tables: {
        Row: {
          created_at: string
          frete_id: string
          id: string
          km_end: number
          km_start: number
          price: number
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          frete_id: string
          id?: string
          km_end: number
          km_start: number
          price: number
          vehicle_type: string
        }
        Update: {
          created_at?: string
          frete_id?: string
          id?: string
          km_end?: number
          km_start?: number
          price?: number
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "freight_price_tables_frete_id_fkey"
            columns: ["frete_id"]
            isOneToOne: false
            referencedRelation: "fretes"
            referencedColumns: ["id"]
          },
        ]
      }
      fretes: {
        Row: {
          beneficios: Json | null
          codigo_agregamento: string | null
          collaborator_ids: string[]
          company_id: string
          created_at: string
          data_coleta: string | null
          data_entrega: string | null
          destinos: Json
          horario_carregamento: string | null
          id: string
          observacoes: string | null
          origem_cidade: string
          origem_estado: string
          paradas: Json | null
          pedagio_direcao: string | null
          pedagio_pago_por: string | null
          peso_carga: number | null
          precisa_ajudante: boolean | null
          precisa_rastreador: boolean | null
          precisa_seguro: boolean | null
          regras_agendamento: Json | null
          status: string | null
          tabelas_preco: Json | null
          tipo_frete: string
          tipo_mercadoria: string
          tipos_carrocerias: Json | null
          tipos_veiculos: Json | null
          updated_at: string
          valor_carga: number | null
          valores_definidos: Json | null
        }
        Insert: {
          beneficios?: Json | null
          codigo_agregamento?: string | null
          collaborator_ids: string[]
          company_id: string
          created_at?: string
          data_coleta?: string | null
          data_entrega?: string | null
          destinos?: Json
          horario_carregamento?: string | null
          id?: string
          observacoes?: string | null
          origem_cidade: string
          origem_estado: string
          paradas?: Json | null
          pedagio_direcao?: string | null
          pedagio_pago_por?: string | null
          peso_carga?: number | null
          precisa_ajudante?: boolean | null
          precisa_rastreador?: boolean | null
          precisa_seguro?: boolean | null
          regras_agendamento?: Json | null
          status?: string | null
          tabelas_preco?: Json | null
          tipo_frete?: string
          tipo_mercadoria: string
          tipos_carrocerias?: Json | null
          tipos_veiculos?: Json | null
          updated_at?: string
          valor_carga?: number | null
          valores_definidos?: Json | null
        }
        Update: {
          beneficios?: Json | null
          codigo_agregamento?: string | null
          collaborator_ids?: string[]
          company_id?: string
          created_at?: string
          data_coleta?: string | null
          data_entrega?: string | null
          destinos?: Json
          horario_carregamento?: string | null
          id?: string
          observacoes?: string | null
          origem_cidade?: string
          origem_estado?: string
          paradas?: Json | null
          pedagio_direcao?: string | null
          pedagio_pago_por?: string | null
          peso_carga?: number | null
          precisa_ajudante?: boolean | null
          precisa_rastreador?: boolean | null
          precisa_seguro?: boolean | null
          regras_agendamento?: Json | null
          status?: string | null
          tabelas_preco?: Json | null
          tipo_frete?: string
          tipo_mercadoria?: string
          tipos_carrocerias?: Json | null
          tipos_veiculos?: Json | null
          updated_at?: string
          valor_carga?: number | null
          valores_definidos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fretes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_cnh_exists: {
        Args: { cnh_param: string }
        Returns: boolean
      }
      check_cnpj_exists: {
        Args: { cnpj_param: string }
        Returns: boolean
      }
      check_company_phone_exists: {
        Args: { phone_param: string }
        Returns: boolean
      }
      check_cpf_exists: {
        Args: { cpf_param: string }
        Returns: boolean
      }
      check_documents_complete: {
        Args: {
          user_role_param: Database["public"]["Enums"]["user_role"]
          verification_record: Database["public"]["Tables"]["document_verifications"]["Row"]
        }
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_param: string }
        Returns: boolean
      }
      generate_aggregation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_freight_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      document_status: "not_submitted" | "pending" | "approved" | "rejected"
      user_role: "admin" | "driver" | "company"
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
      document_status: ["not_submitted", "pending", "approved", "rejected"],
      user_role: ["admin", "driver", "company"],
    },
  },
} as const
