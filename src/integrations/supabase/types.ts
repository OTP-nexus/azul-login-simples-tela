export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
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
      driver_availability: {
        Row: {
          available_days: number[] | null
          created_at: string | null
          driver_id: string | null
          end_time: string | null
          id: string
          preferred_regions: string[] | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          available_days?: number[] | null
          created_at?: string | null
          driver_id?: string | null
          end_time?: string | null
          id?: string
          preferred_regions?: string[] | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          available_days?: number[] | null
          created_at?: string | null
          driver_id?: string | null
          end_time?: string | null
          id?: string
          preferred_regions?: string[] | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_availability_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_contact_views: {
        Row: {
          company_id: string | null
          driver_id: string | null
          freight_id: string | null
          id: string
          month_year: string | null
          viewed_at: string | null
        }
        Insert: {
          company_id?: string | null
          driver_id?: string | null
          freight_id?: string | null
          id?: string
          month_year?: string | null
          viewed_at?: string | null
        }
        Update: {
          company_id?: string | null
          driver_id?: string | null
          freight_id?: string | null
          id?: string
          month_year?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_contact_views_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_contact_views_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_contact_views_freight_id_fkey"
            columns: ["freight_id"]
            isOneToOne: false
            referencedRelation: "fretes"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_favorites: {
        Row: {
          created_at: string | null
          driver_id: string | null
          freight_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          freight_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          freight_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_favorites_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_favorites_freight_id_fkey"
            columns: ["freight_id"]
            isOneToOne: false
            referencedRelation: "fretes"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          accepts_multiple_vehicles: boolean | null
          cep: string | null
          city: string | null
          cnh: string
          cnh_categories: string[] | null
          cnh_expiry_date: string | null
          complement: string | null
          cpf: string
          created_at: string | null
          date_of_birth: string | null
          id: string
          main_vehicle_body_type: string | null
          main_vehicle_capacity: number | null
          main_vehicle_insurance_expiry: string | null
          main_vehicle_model: string | null
          main_vehicle_plate: string | null
          main_vehicle_renavam: string | null
          main_vehicle_year: number | null
          neighborhood: string | null
          number: string | null
          state: string | null
          street: string | null
          updated_at: string | null
          user_id: string
          vehicle_type: string
        }
        Insert: {
          accepts_multiple_vehicles?: boolean | null
          cep?: string | null
          city?: string | null
          cnh: string
          cnh_categories?: string[] | null
          cnh_expiry_date?: string | null
          complement?: string | null
          cpf: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          main_vehicle_body_type?: string | null
          main_vehicle_capacity?: number | null
          main_vehicle_insurance_expiry?: string | null
          main_vehicle_model?: string | null
          main_vehicle_plate?: string | null
          main_vehicle_renavam?: string | null
          main_vehicle_year?: number | null
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_type: string
        }
        Update: {
          accepts_multiple_vehicles?: boolean | null
          cep?: string | null
          city?: string | null
          cnh?: string
          cnh_categories?: string[] | null
          cnh_expiry_date?: string | null
          complement?: string | null
          cpf?: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          main_vehicle_body_type?: string | null
          main_vehicle_capacity?: number | null
          main_vehicle_insurance_expiry?: string | null
          main_vehicle_model?: string | null
          main_vehicle_plate?: string | null
          main_vehicle_renavam?: string | null
          main_vehicle_year?: number | null
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          street?: string | null
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
      freight_contacts: {
        Row: {
          company_response: string | null
          created_at: string
          driver_id: string
          freight_id: string
          id: string
          updated_at: string
        }
        Insert: {
          company_response?: string | null
          created_at?: string
          driver_id: string
          freight_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          company_response?: string | null
          created_at?: string
          driver_id?: string
          freight_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freight_contacts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_contacts_freight_id_fkey"
            columns: ["freight_id"]
            isOneToOne: false
            referencedRelation: "fretes"
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
          altura_carga: number | null
          beneficios: Json | null
          codigo_agregamento: string | null
          collaborator_ids: string[] | null
          company_id: string | null
          comprimento_carga: number | null
          created_at: string
          data_coleta: string | null
          data_entrega: string | null
          descricao_livre_itens: string | null
          descricao_restricao: string | null
          destino_cidade: string | null
          destino_estado: string | null
          destino_possui_carga_descarga: boolean | null
          destino_possui_doca: boolean | null
          destino_possui_elevador: boolean | null
          destino_possui_escada: boolean | null
          destino_tipo_endereco: string | null
          destinos: Json
          horario_carregamento: string | null
          id: string
          itens_detalhados: Json | null
          largura_carga: number | null
          local_possui_restricao: boolean | null
          observacoes: string | null
          origem_cidade: string
          origem_estado: string
          origem_possui_carga_descarga: boolean | null
          origem_possui_doca: boolean | null
          origem_possui_elevador: boolean | null
          origem_possui_escada: boolean | null
          origem_tipo_endereco: string | null
          paradas: Json | null
          pedagio_direcao: string | null
          pedagio_pago_por: string | null
          peso_carga: number | null
          precisa_ajudante: boolean | null
          precisa_embalagem: boolean | null
          precisa_montar_desmontar: boolean | null
          precisa_rastreador: boolean | null
          precisa_seguro: boolean | null
          regras_agendamento: Json | null
          solicitante_confirmar_telefone: string | null
          solicitante_nome: string | null
          solicitante_telefone: string | null
          status: string | null
          tabelas_preco: Json | null
          tipo_frete: string
          tipo_listagem_itens: string | null
          tipo_mercadoria: string
          tipo_solicitacao: string | null
          tipos_carrocerias: Json | null
          tipos_veiculos: Json | null
          updated_at: string
          valor_carga: number | null
          valores_definidos: Json | null
        }
        Insert: {
          altura_carga?: number | null
          beneficios?: Json | null
          codigo_agregamento?: string | null
          collaborator_ids?: string[] | null
          company_id?: string | null
          comprimento_carga?: number | null
          created_at?: string
          data_coleta?: string | null
          data_entrega?: string | null
          descricao_livre_itens?: string | null
          descricao_restricao?: string | null
          destino_cidade?: string | null
          destino_estado?: string | null
          destino_possui_carga_descarga?: boolean | null
          destino_possui_doca?: boolean | null
          destino_possui_elevador?: boolean | null
          destino_possui_escada?: boolean | null
          destino_tipo_endereco?: string | null
          destinos?: Json
          horario_carregamento?: string | null
          id?: string
          itens_detalhados?: Json | null
          largura_carga?: number | null
          local_possui_restricao?: boolean | null
          observacoes?: string | null
          origem_cidade: string
          origem_estado: string
          origem_possui_carga_descarga?: boolean | null
          origem_possui_doca?: boolean | null
          origem_possui_elevador?: boolean | null
          origem_possui_escada?: boolean | null
          origem_tipo_endereco?: string | null
          paradas?: Json | null
          pedagio_direcao?: string | null
          pedagio_pago_por?: string | null
          peso_carga?: number | null
          precisa_ajudante?: boolean | null
          precisa_embalagem?: boolean | null
          precisa_montar_desmontar?: boolean | null
          precisa_rastreador?: boolean | null
          precisa_seguro?: boolean | null
          regras_agendamento?: Json | null
          solicitante_confirmar_telefone?: string | null
          solicitante_nome?: string | null
          solicitante_telefone?: string | null
          status?: string | null
          tabelas_preco?: Json | null
          tipo_frete?: string
          tipo_listagem_itens?: string | null
          tipo_mercadoria: string
          tipo_solicitacao?: string | null
          tipos_carrocerias?: Json | null
          tipos_veiculos?: Json | null
          updated_at?: string
          valor_carga?: number | null
          valores_definidos?: Json | null
        }
        Update: {
          altura_carga?: number | null
          beneficios?: Json | null
          codigo_agregamento?: string | null
          collaborator_ids?: string[] | null
          company_id?: string | null
          comprimento_carga?: number | null
          created_at?: string
          data_coleta?: string | null
          data_entrega?: string | null
          descricao_livre_itens?: string | null
          descricao_restricao?: string | null
          destino_cidade?: string | null
          destino_estado?: string | null
          destino_possui_carga_descarga?: boolean | null
          destino_possui_doca?: boolean | null
          destino_possui_elevador?: boolean | null
          destino_possui_escada?: boolean | null
          destino_tipo_endereco?: string | null
          destinos?: Json
          horario_carregamento?: string | null
          id?: string
          itens_detalhados?: Json | null
          largura_carga?: number | null
          local_possui_restricao?: boolean | null
          observacoes?: string | null
          origem_cidade?: string
          origem_estado?: string
          origem_possui_carga_descarga?: boolean | null
          origem_possui_doca?: boolean | null
          origem_possui_elevador?: boolean | null
          origem_possui_escada?: boolean | null
          origem_tipo_endereco?: string | null
          paradas?: Json | null
          pedagio_direcao?: string | null
          pedagio_pago_por?: string | null
          peso_carga?: number | null
          precisa_ajudante?: boolean | null
          precisa_embalagem?: boolean | null
          precisa_montar_desmontar?: boolean | null
          precisa_rastreador?: boolean | null
          precisa_seguro?: boolean | null
          regras_agendamento?: Json | null
          solicitante_confirmar_telefone?: string | null
          solicitante_nome?: string | null
          solicitante_telefone?: string | null
          status?: string | null
          tabelas_preco?: Json | null
          tipo_frete?: string
          tipo_listagem_itens?: string | null
          tipo_mercadoria?: string
          tipo_solicitacao?: string | null
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
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          status: string
          stripe_payment_intent_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
      subscription_plans: {
        Row: {
          contact_views_limit: number | null
          features: Json
          freight_limit: number | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number | null
          slug: string
          target_user_type: string
          trial_days: number | null
        }
        Insert: {
          contact_views_limit?: number | null
          features?: Json
          freight_limit?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number | null
          slug: string
          target_user_type: string
          trial_days?: number | null
        }
        Update: {
          contact_views_limit?: number | null
          features?: Json
          freight_limit?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number | null
          slug?: string
          target_user_type?: string
          trial_days?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
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
      check_driver_contact_limit: {
        Args: { driver_user_id: string }
        Returns: number
      }
      check_email_exists: {
        Args: { email_param: string }
        Returns: boolean
      }
      generate_aggregation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_common_freight_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_freight_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_return_freight_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_company_in_trial: {
        Args: { company_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_target_type: string
          p_target_id?: string
          p_description?: string
          p_metadata?: Json
        }
        Returns: string
      }
      search_body_types: {
        Args: { body_data: Json; search_values: string[] }
        Returns: boolean
      }
      search_destinations: {
        Args: {
          destino_cidade_val: string
          destino_estado_val: string
          destinos_data: Json
          search_value: string
        }
        Returns: boolean
      }
      search_public_freights: {
        Args: { p_filters?: Json; p_page?: number; p_page_size?: number }
        Returns: {
          freight_data: Json
          total_count: number
        }[]
      }
      search_vehicle_types: {
        Args: { vehicle_data: Json; search_values: string[] }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
