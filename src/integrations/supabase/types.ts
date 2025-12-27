export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_transactions: {
        Row: {
          amount: number
          balance: number
          created_at: string
          description: string
          id: string
          invoice_id: string | null
          property_id: string | null
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance?: number
          created_at?: string
          description: string
          id?: string
          invoice_id?: string | null
          property_id?: string | null
          transaction_date?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string | null
          property_id?: string | null
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      checkin_form_templates: {
        Row: {
          created_at: string
          id: string
          include_estimated_arrival: boolean
          include_special_requests: boolean
          is_default: boolean
          name: string
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          include_estimated_arrival?: boolean
          include_special_requests?: boolean
          is_default?: boolean
          name: string
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          include_estimated_arrival?: boolean
          include_special_requests?: boolean
          is_default?: boolean
          name?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_form_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_booking_pages: {
        Row: {
          amenities: Json | null
          book_button_text: string | null
          button_color: string | null
          button_hover_color: string | null
          cancellation_policy: string | null
          check_in_time: string | null
          check_out_time: string | null
          cleaning_fee: number | null
          contact_button_text: string | null
          contact_form_enabled: boolean | null
          created_at: string
          description: string | null
          font_family: string | null
          gallery_images: Json | null
          hero_image_url: string | null
          house_rules: string | null
          ical_airbnb_url: string | null
          ical_booking_url: string | null
          ical_last_sync: string | null
          id: string
          is_published: boolean
          logo_url: string | null
          max_nights: number | null
          min_nights: number | null
          payment_enabled: boolean | null
          price_per_night: number | null
          primary_color: string | null
          property_id: string
          secondary_color: string | null
          short_description: string | null
          show_amenities: boolean | null
          show_cancellation_policy: boolean | null
          show_gallery: boolean | null
          show_rules: boolean | null
          slug: string
          title: string | null
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          book_button_text?: string | null
          button_color?: string | null
          button_hover_color?: string | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          cleaning_fee?: number | null
          contact_button_text?: string | null
          contact_form_enabled?: boolean | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          gallery_images?: Json | null
          hero_image_url?: string | null
          house_rules?: string | null
          ical_airbnb_url?: string | null
          ical_booking_url?: string | null
          ical_last_sync?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          max_nights?: number | null
          min_nights?: number | null
          payment_enabled?: boolean | null
          price_per_night?: number | null
          primary_color?: string | null
          property_id: string
          secondary_color?: string | null
          short_description?: string | null
          show_amenities?: boolean | null
          show_cancellation_policy?: boolean | null
          show_gallery?: boolean | null
          show_rules?: boolean | null
          slug: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          book_button_text?: string | null
          button_color?: string | null
          button_hover_color?: string | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          cleaning_fee?: number | null
          contact_button_text?: string | null
          contact_form_enabled?: boolean | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          gallery_images?: Json | null
          hero_image_url?: string | null
          house_rules?: string | null
          ical_airbnb_url?: string | null
          ical_booking_url?: string | null
          ical_last_sync?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          max_nights?: number | null
          min_nights?: number | null
          payment_enabled?: boolean | null
          price_per_night?: number | null
          primary_color?: string | null
          property_id?: string
          secondary_color?: string | null
          short_description?: string | null
          show_amenities?: boolean | null
          show_cancellation_policy?: boolean | null
          show_gallery?: boolean | null
          show_rules?: boolean | null
          slug?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_booking_pages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_booking_requests: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          message: string | null
          num_guests: number
          page_id: string
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          num_guests?: number
          page_id: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          num_guests?: number
          page_id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_booking_requests_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "direct_booking_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing: {
        Row: {
          created_at: string
          end_date: string
          id: string
          min_nights: number | null
          name: string
          page_id: string
          price_per_night: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          min_nights?: number | null
          name: string
          page_id: string
          price_per_night: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          min_nights?: number | null
          name?: string
          page_id?: string
          price_per_night?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_pricing_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "direct_booking_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_events: {
        Row: {
          created_at: string
          end_date: string
          external_id: string | null
          id: string
          page_id: string
          source: string
          start_date: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          external_id?: string | null
          id?: string
          page_id: string
          source: string
          start_date: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          external_id?: string | null
          id?: string
          page_id?: string
          source?: string
          start_date?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_events_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "direct_booking_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_tasks: {
        Row: {
          categoria: string
          concluida: boolean
          created_at: string
          descricao: string
          id: string
          month: string
          prazo: string
          prioridade: string
          property_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria: string
          concluida?: boolean
          created_at?: string
          descricao: string
          id?: string
          month: string
          prazo: string
          prioridade?: string
          property_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          concluida?: boolean
          created_at?: string
          descricao?: string
          id?: string
          month?: string
          prazo?: string
          prioridade?: string
          property_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      guidebook_sections: {
        Row: {
          content: Json
          created_at: string
          guidebook_id: string
          icon: string | null
          id: string
          is_visible: boolean
          order_index: number
          section_type: string
          title: Json
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          guidebook_id: string
          icon?: string | null
          id?: string
          is_visible?: boolean
          order_index?: number
          section_type: string
          title?: Json
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          guidebook_id?: string
          icon?: string | null
          id?: string
          is_visible?: boolean
          order_index?: number
          section_type?: string
          title?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidebook_sections_guidebook_id_fkey"
            columns: ["guidebook_id"]
            isOneToOne: false
            referencedRelation: "guidebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      guidebook_upsells: {
        Row: {
          category: string | null
          created_at: string
          description: Json
          guidebook_id: string
          id: string
          image_url: string | null
          is_available: boolean
          name: Json
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: Json
          guidebook_id: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: Json
          price: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: Json
          guidebook_id?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: Json
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidebook_upsells_guidebook_id_fkey"
            columns: ["guidebook_id"]
            isOneToOne: false
            referencedRelation: "guidebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      guidebooks: {
        Row: {
          cover_image_url: string | null
          created_at: string
          id: string
          is_published: boolean
          languages: Json
          logo_url: string | null
          primary_color: string | null
          property_id: string
          title: string
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          languages?: Json
          logo_url?: string | null
          primary_color?: string | null
          property_id: string
          title: string
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          languages?: Json
          logo_url?: string | null
          primary_color?: string | null
          property_id?: string
          title?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guidebooks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      ine_statistics: {
        Row: {
          country: string
          created_at: string
          id: string
          month: string
          num_guests: number
          num_nights: number
          overnight_stays: number
          property_id: string
          transit_nights: number | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          month: string
          num_guests?: number
          num_nights?: number
          overnight_stays?: number
          property_id: string
          transit_nights?: number | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          month?: string
          num_guests?: number
          num_nights?: number
          overnight_stays?: number
          property_id?: string
          transit_nights?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ine_statistics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_series: {
        Row: {
          created_at: string
          current_number: number
          id: string
          is_active: boolean
          prefix: string | null
          series_code: string
          series_name: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_number?: number
          id?: string
          is_active?: boolean
          prefix?: string | null
          series_code: string
          series_name: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          current_number?: number
          id?: string
          is_active?: boolean
          prefix?: string | null
          series_code?: string
          series_name?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_address: string | null
          client_name: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          items: Json
          nif_cliente: string | null
          notes: string | null
          payment_status: string
          property_id: string | null
          reservation_id: string | null
          series: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_name: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          items?: Json
          nif_cliente?: string | null
          notes?: string | null
          payment_status?: string
          property_id?: string | null
          reservation_id?: string | null
          series?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_name?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json
          nif_cliente?: string | null
          notes?: string | null
          payment_status?: string
          property_id?: string | null
          reservation_id?: string | null
          series?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_costs: {
        Row: {
          amount: number
          cost_type: string
          created_at: string
          description: string | null
          id: string
          month: string
          property_id: string
          reservation_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cost_type: string
          created_at?: string
          description?: string | null
          id?: string
          month: string
          property_id: string
          reservation_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cost_type?: string
          created_at?: string
          description?: string | null
          id?: string
          month?: string
          property_id?: string
          reservation_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_costs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_costs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_documents: {
        Row: {
          created_at: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          name: string
          owner_id: string
          property_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          name: string
          owner_id: string
          property_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          name?: string
          owner_id?: string
          property_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          owner_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          owner_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          owner_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_sessions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          mbway_phone: string | null
          multibanco_entity: string | null
          multibanco_reference: string | null
          payment_method: string
          payment_status: string
          subscription_plan: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          mbway_phone?: string | null
          multibanco_entity?: string | null
          multibanco_reference?: string | null
          payment_method: string
          payment_status?: string
          subscription_plan: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mbway_phone?: string | null
          multibanco_entity?: string | null
          multibanco_reference?: string | null
          payment_method?: string
          payment_status?: string
          subscription_plan?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          extra_users_cost: number | null
          extra_users_count: number | null
          id: string
          name: string
          nif: string | null
          phone: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          extra_users_cost?: number | null
          extra_users_count?: number | null
          id: string
          name: string
          nif?: string | null
          phone?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          extra_users_cost?: number | null
          extra_users_count?: number | null
          id?: string
          name?: string
          nif?: string | null
          phone?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          capacity: number | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          description: string | null
          id: string
          insurance_file_url: string | null
          insurance_validity: string | null
          name: string
          parking_info: string | null
          platform_status: string | null
          region: string | null
          rnal: string | null
          updated_at: string
          user_id: string
          wifi_password: string | null
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          capacity?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          insurance_file_url?: string | null
          insurance_validity?: string | null
          name: string
          parking_info?: string | null
          platform_status?: string | null
          region?: string | null
          rnal?: string | null
          updated_at?: string
          user_id: string
          wifi_password?: string | null
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          capacity?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          insurance_file_url?: string | null
          insurance_validity?: string | null
          name?: string
          parking_info?: string | null
          platform_status?: string | null
          region?: string | null
          rnal?: string | null
          updated_at?: string
          user_id?: string
          wifi_password?: string | null
        }
        Relationships: []
      }
      property_access_credentials: {
        Row: {
          created_at: string
          credentials: Json
          id: string
          platform: string
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials: Json
          id?: string
          platform: string
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          id?: string
          platform?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_access_credentials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          property_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          property_id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          property_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_members_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          commission_rate: number | null
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
          phone: string | null
          property_id: string
          updated_at: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
          phone?: string | null
          property_id: string
          updated_at?: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
          phone?: string | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_owners_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_guests: {
        Row: {
          created_at: string
          data_nascimento: string | null
          id: string
          local_nascimento: string | null
          local_residencia: string | null
          nacionalidade: string | null
          nome_completo: string
          numero_documento: string | null
          pais_emissor: string | null
          pais_residencia: string
          reservation_id: string
          tipo_documento: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          id?: string
          local_nascimento?: string | null
          local_residencia?: string | null
          nacionalidade?: string | null
          nome_completo: string
          numero_documento?: string | null
          pais_emissor?: string | null
          pais_residencia: string
          reservation_id: string
          tipo_documento?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          id?: string
          local_nascimento?: string | null
          local_residencia?: string | null
          nacionalidade?: string | null
          nome_completo?: string
          numero_documento?: string | null
          pais_emissor?: string | null
          pais_residencia?: string
          reservation_id?: string
          tipo_documento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_guests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          booking_source: string | null
          check_in: string
          check_out: string
          checkin_token: string | null
          country_origin: string
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          num_guests: number
          num_nights: number
          property_id: string
          status: string
          template_id: string | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          booking_source?: string | null
          check_in: string
          check_out: string
          checkin_token?: string | null
          country_origin: string
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          num_guests: number
          num_nights: number
          property_id: string
          status?: string
          template_id?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          booking_source?: string | null
          check_in?: string
          check_out?: string
          checkin_token?: string | null
          country_origin?: string
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          num_guests?: number
          num_nights?: number
          property_id?: string
          status?: string
          template_id?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checkin_form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      saft_submissions: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          month: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          month: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          month?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      tourist_tax: {
        Row: {
          created_at: string
          id: string
          month: string
          paid: boolean | null
          property_id: string
          tax_per_night: number
          total_guests: number
          total_nights: number
          total_tax: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          paid?: boolean | null
          property_id: string
          tax_per_night?: number
          total_guests?: number
          total_nights?: number
          total_tax: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          paid?: boolean | null
          property_id?: string
          tax_per_night?: number
          total_guests?: number
          total_nights?: number
          total_tax?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourist_tax_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      upsell_orders: {
        Row: {
          created_at: string
          guest_email: string
          guest_name: string
          guidebook_id: string
          id: string
          items: Json
          payment_status: string
          reservation_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_email: string
          guest_name: string
          guidebook_id: string
          id?: string
          items?: Json
          payment_status?: string
          reservation_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_email?: string
          guest_name?: string
          guidebook_id?: string
          id?: string
          items?: Json
          payment_status?: string
          reservation_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_orders_guidebook_id_fkey"
            columns: ["guidebook_id"]
            isOneToOne: false
            referencedRelation: "guidebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_orders_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          property_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          property_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          property_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_checkin_token: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_property_member: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      is_property_owner: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      verify_owner_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          owner_id: string
          owner_name: string
          property_id: string
          property_name: string
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "editor" | "viewer"
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
      app_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
