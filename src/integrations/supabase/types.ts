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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      checklist_itens: {
        Row: {
          checklist_id: string | null
          concluido: boolean | null
          concluido_em: string | null
          concluido_por: string | null
          descricao: string
          id: string
          ordem: number | null
        }
        Insert: {
          checklist_id?: string | null
          concluido?: boolean | null
          concluido_em?: string | null
          concluido_por?: string | null
          descricao: string
          id?: string
          ordem?: number | null
        }
        Update: {
          checklist_id?: string | null
          concluido?: boolean | null
          concluido_em?: string | null
          concluido_por?: string | null
          descricao?: string
          id?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_itens_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string | null
          id: string
          tipo: string | null
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tipo?: string | null
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tipo?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_contatos: {
        Row: {
          cargo: string | null
          cliente_id: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string
          principal: boolean | null
          telefone: string | null
        }
        Insert: {
          cargo?: string | null
          cliente_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          principal?: boolean | null
          telefone?: string | null
        }
        Update: {
          cargo?: string | null
          cliente_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          principal?: boolean | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_contatos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          contato_cargo: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_tel: string | null
          created_at: string | null
          estado: string | null
          id: string
          logradouro: string | null
          nome_fantasia: string | null
          numero: string | null
          razao_social: string
          segmento: string | null
          total_eventos: number | null
          total_gasto: number | null
          ultimo_evento: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          contato_cargo?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          razao_social: string
          segmento?: string | null
          total_eventos?: number | null
          total_gasto?: number | null
          ultimo_evento?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          contato_cargo?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          razao_social?: string
          segmento?: string | null
          total_eventos?: number | null
          total_gasto?: number | null
          ultimo_evento?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          base_calculo: number
          conta_id: string | null
          created_at: string | null
          id: string
          pago: boolean | null
          pago_em: string | null
          percentual: number
          tipo: string | null
          usuario_id: string | null
          valor: number
          venda_id: string | null
        }
        Insert: {
          base_calculo: number
          conta_id?: string | null
          created_at?: string | null
          id?: string
          pago?: boolean | null
          pago_em?: string | null
          percentual: number
          tipo?: string | null
          usuario_id?: string | null
          valor: number
          venda_id?: string | null
        }
        Update: {
          base_calculo?: number
          conta_id?: string | null
          created_at?: string | null
          id?: string
          pago?: boolean | null
          pago_em?: string | null
          percentual?: number
          tipo?: string | null
          usuario_id?: string | null
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          beneficiario: string | null
          created_at: string | null
          descricao: string
          empresa_id: string | null
          forma_pgto: string | null
          id: string
          observacao: string | null
          pago_em: string | null
          palestrante_id: string | null
          status: string | null
          tipo: string | null
          valor: number
          vencimento: string | null
          venda_id: string | null
        }
        Insert: {
          beneficiario?: string | null
          created_at?: string | null
          descricao: string
          empresa_id?: string | null
          forma_pgto?: string | null
          id?: string
          observacao?: string | null
          pago_em?: string | null
          palestrante_id?: string | null
          status?: string | null
          tipo?: string | null
          valor: number
          vencimento?: string | null
          venda_id?: string | null
        }
        Update: {
          beneficiario?: string | null
          created_at?: string | null
          descricao?: string
          empresa_id?: string | null
          forma_pgto?: string | null
          id?: string
          observacao?: string | null
          pago_em?: string | null
          palestrante_id?: string | null
          status?: string | null
          tipo?: string | null
          valor?: number
          vencimento?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_polo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_palestrante_id_fkey"
            columns: ["palestrante_id"]
            isOneToOne: false
            referencedRelation: "palestrantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          forma_pgto: string | null
          id: string
          observacao: string | null
          parcela: number
          recebido_em: string | null
          status: string | null
          total_parcelas: number
          valor: number
          valor_recebido: number | null
          vencimento: string
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          forma_pgto?: string | null
          id?: string
          observacao?: string | null
          parcela?: number
          recebido_em?: string | null
          status?: string | null
          total_parcelas?: number
          valor: number
          valor_recebido?: number | null
          vencimento: string
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          forma_pgto?: string | null
          id?: string
          observacao?: string | null
          parcela?: number
          recebido_em?: string | null
          status?: string | null
          total_parcelas?: number
          valor?: number
          valor_recebido?: number | null
          vencimento?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_polo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          assinado_cliente_em: string | null
          assinado_polo_em: string | null
          clicksign_key: string | null
          conteudo: string | null
          created_at: string | null
          data_assinatura: string | null
          data_envio: string | null
          data_geracao: string | null
          empresa_polo_id: string | null
          id: string
          modelo: string | null
          numero: string | null
          pdf_url: string | null
          status: string | null
          venda_id: string | null
        }
        Insert: {
          assinado_cliente_em?: string | null
          assinado_polo_em?: string | null
          clicksign_key?: string | null
          conteudo?: string | null
          created_at?: string | null
          data_assinatura?: string | null
          data_envio?: string | null
          data_geracao?: string | null
          empresa_polo_id?: string | null
          id?: string
          modelo?: string | null
          numero?: string | null
          pdf_url?: string | null
          status?: string | null
          venda_id?: string | null
        }
        Update: {
          assinado_cliente_em?: string | null
          assinado_polo_em?: string | null
          clicksign_key?: string | null
          conteudo?: string | null
          created_at?: string | null
          data_assinatura?: string | null
          data_envio?: string | null
          data_geracao?: string | null
          empresa_polo_id?: string | null
          id?: string
          modelo?: string | null
          numero?: string | null
          pdf_url?: string | null
          status?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_empresa_polo_id_fkey"
            columns: ["empresa_polo_id"]
            isOneToOne: false
            referencedRelation: "empresas_polo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          enviado_por: string | null
          id: string
          nome: string
          palestrante_id: string | null
          tamanho_kb: number | null
          tipo: string | null
          url: string
          venda_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          enviado_por?: string | null
          id?: string
          nome: string
          palestrante_id?: string | null
          tamanho_kb?: number | null
          tipo?: string | null
          url: string
          venda_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          enviado_por?: string | null
          id?: string
          nome?: string
          palestrante_id?: string | null
          tamanho_kb?: number | null
          tipo?: string | null
          url?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_palestrante_id_fkey"
            columns: ["palestrante_id"]
            isOneToOne: false
            referencedRelation: "palestrantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas_polo: {
        Row: {
          aliq_cofins: number | null
          aliq_csll: number | null
          aliq_irrf: number | null
          aliq_iss: number | null
          aliq_pis: number | null
          ativo: boolean | null
          cnpj: string
          created_at: string | null
          id: string
          nome_fantasia: string | null
          razao_social: string
          regime: string | null
        }
        Insert: {
          aliq_cofins?: number | null
          aliq_csll?: number | null
          aliq_irrf?: number | null
          aliq_iss?: number | null
          aliq_pis?: number | null
          ativo?: boolean | null
          cnpj: string
          created_at?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          regime?: string | null
        }
        Update: {
          aliq_cofins?: number | null
          aliq_csll?: number | null
          aliq_irrf?: number | null
          aliq_iss?: number | null
          aliq_pis?: number | null
          ativo?: boolean | null
          cnpj?: string
          created_at?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          regime?: string | null
        }
        Relationships: []
      }
      eventos_nps: {
        Row: {
          created_at: string | null
          id: string
          nota_organizacao: number | null
          nota_palestrante: number | null
          nps_medio: number | null
          qr_code_token: string | null
          qr_code_url: string | null
          total_respostas: number | null
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nota_organizacao?: number | null
          nota_palestrante?: number | null
          nps_medio?: number | null
          qr_code_token?: string | null
          qr_code_url?: string | null
          total_respostas?: number | null
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nota_organizacao?: number | null
          nota_palestrante?: number | null
          nps_medio?: number | null
          qr_code_token?: string | null
          qr_code_url?: string | null
          total_respostas?: number | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_nps_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          coluna: string
          id: string
          notas: string | null
          posicao: number | null
          responsavel_id: string | null
          setor: string
          updated_at: string | null
          venda_id: string | null
        }
        Insert: {
          coluna: string
          id?: string
          notas?: string | null
          posicao?: number | null
          responsavel_id?: string | null
          setor: string
          updated_at?: string | null
          venda_id?: string | null
        }
        Update: {
          coluna?: string
          id?: string
          notas?: string | null
          posicao?: number | null
          responsavel_id?: string | null
          setor?: string
          updated_at?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interacoes: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          lead_id: string | null
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          lead_id?: string | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          lead_id?: string | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_interacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cidade_evento: string | null
          cliente_id: string | null
          consultor_id: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_tel: string | null
          convertido: boolean | null
          created_at: string | null
          data_pretendida: string | null
          descricao: string | null
          empresa: string
          etapa: string | null
          formato: string | null
          id: string
          motivo_perda: string | null
          orcamento_est: number | null
          origem: string | null
          publico_estimado: number | null
          tema_evento: string | null
          updated_at: string | null
        }
        Insert: {
          cidade_evento?: string | null
          cliente_id?: string | null
          consultor_id?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          convertido?: boolean | null
          created_at?: string | null
          data_pretendida?: string | null
          descricao?: string | null
          empresa: string
          etapa?: string | null
          formato?: string | null
          id?: string
          motivo_perda?: string | null
          orcamento_est?: number | null
          origem?: string | null
          publico_estimado?: number | null
          tema_evento?: string | null
          updated_at?: string | null
        }
        Update: {
          cidade_evento?: string | null
          cliente_id?: string | null
          consultor_id?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          convertido?: boolean | null
          created_at?: string | null
          data_pretendida?: string | null
          descricao?: string | null
          empresa?: string
          etapa?: string | null
          formato?: string | null
          id?: string
          motivo_perda?: string | null
          orcamento_est?: number | null
          origem?: string | null
          publico_estimado?: number | null
          tema_evento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      logistica: {
        Row: {
          hotel_checkin: string | null
          hotel_checkout: string | null
          hotel_endereco: string | null
          hotel_nome: string | null
          hotel_reserva: string | null
          hotel_url: string | null
          id: string
          observacoes: string | null
          passagem_ida_cia: string | null
          passagem_ida_data: string | null
          passagem_ida_destino: string | null
          passagem_ida_hora: string | null
          passagem_ida_origem: string | null
          passagem_ida_url: string | null
          passagem_ida_voo: string | null
          passagem_volta_cia: string | null
          passagem_volta_data: string | null
          passagem_volta_hora: string | null
          passagem_volta_voo: string | null
          status: string | null
          transfer_ida_data: string | null
          transfer_ida_empresa: string | null
          transfer_ida_obs: string | null
          transfer_volta_data: string | null
          transfer_volta_empresa: string | null
          transfer_volta_obs: string | null
          updated_at: string | null
          venda_id: string | null
        }
        Insert: {
          hotel_checkin?: string | null
          hotel_checkout?: string | null
          hotel_endereco?: string | null
          hotel_nome?: string | null
          hotel_reserva?: string | null
          hotel_url?: string | null
          id?: string
          observacoes?: string | null
          passagem_ida_cia?: string | null
          passagem_ida_data?: string | null
          passagem_ida_destino?: string | null
          passagem_ida_hora?: string | null
          passagem_ida_origem?: string | null
          passagem_ida_url?: string | null
          passagem_ida_voo?: string | null
          passagem_volta_cia?: string | null
          passagem_volta_data?: string | null
          passagem_volta_hora?: string | null
          passagem_volta_voo?: string | null
          status?: string | null
          transfer_ida_data?: string | null
          transfer_ida_empresa?: string | null
          transfer_ida_obs?: string | null
          transfer_volta_data?: string | null
          transfer_volta_empresa?: string | null
          transfer_volta_obs?: string | null
          updated_at?: string | null
          venda_id?: string | null
        }
        Update: {
          hotel_checkin?: string | null
          hotel_checkout?: string | null
          hotel_endereco?: string | null
          hotel_nome?: string | null
          hotel_reserva?: string | null
          hotel_url?: string | null
          id?: string
          observacoes?: string | null
          passagem_ida_cia?: string | null
          passagem_ida_data?: string | null
          passagem_ida_destino?: string | null
          passagem_ida_hora?: string | null
          passagem_ida_origem?: string | null
          passagem_ida_url?: string | null
          passagem_ida_voo?: string | null
          passagem_volta_cia?: string | null
          passagem_volta_data?: string | null
          passagem_volta_hora?: string | null
          passagem_volta_voo?: string | null
          status?: string | null
          transfer_ida_data?: string | null
          transfer_ida_empresa?: string | null
          transfer_ida_obs?: string | null
          transfer_volta_data?: string | null
          transfer_volta_empresa?: string | null
          transfer_volta_obs?: string | null
          updated_at?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistica_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_respostas: {
        Row: {
          comentario: string | null
          created_at: string | null
          evento_nps_id: string | null
          id: string
          nota_geral: number | null
          nota_organizacao: number | null
          nota_palestrante: number | null
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          evento_nps_id?: string | null
          id?: string
          nota_geral?: number | null
          nota_organizacao?: number | null
          nota_palestrante?: number | null
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          evento_nps_id?: string | null
          id?: string
          nota_geral?: number | null
          nota_organizacao?: number | null
          nota_palestrante?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_respostas_evento_nps_id_fkey"
            columns: ["evento_nps_id"]
            isOneToOne: false
            referencedRelation: "eventos_nps"
            referencedColumns: ["id"]
          },
        ]
      }
      palestrante_indicacoes: {
        Row: {
          id: string
          palestrante_id: string | null
          total_cotacoes: number | null
          total_recebido: number | null
          total_vendas: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          palestrante_id?: string | null
          total_cotacoes?: number | null
          total_recebido?: number | null
          total_vendas?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          palestrante_id?: string | null
          total_cotacoes?: number | null
          total_recebido?: number | null
          total_vendas?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "palestrante_indicacoes_palestrante_id_fkey"
            columns: ["palestrante_id"]
            isOneToOne: false
            referencedRelation: "palestrantes"
            referencedColumns: ["id"]
          },
        ]
      }
      palestrantes: {
        Row: {
          agencia: string | null
          avaliacao_media: number | null
          bairro: string | null
          banco: string | null
          bio: string | null
          cache_max: number | null
          cache_min: number | null
          cache_padrao: number | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          conta: string | null
          cpf: string | null
          created_at: string | null
          email: string
          estado: string | null
          exclusivo: boolean | null
          formatos: string[] | null
          foto_url: string | null
          id: string
          insc_municipal: string | null
          logradouro: string | null
          mini_bio: string | null
          nome: string
          nome_artistico: string | null
          nome_fantasia: string | null
          numero: string | null
          pix: string | null
          publicar_site: boolean | null
          razao_social: string | null
          regime: string | null
          status: string | null
          telefone: string | null
          temas: string[] | null
          tipo_conta: string | null
          tipo_pessoa: string | null
          total_eventos: number | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          agencia?: string | null
          avaliacao_media?: number | null
          bairro?: string | null
          banco?: string | null
          bio?: string | null
          cache_max?: number | null
          cache_min?: number | null
          cache_padrao?: number | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          estado?: string | null
          exclusivo?: boolean | null
          formatos?: string[] | null
          foto_url?: string | null
          id?: string
          insc_municipal?: string | null
          logradouro?: string | null
          mini_bio?: string | null
          nome: string
          nome_artistico?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          pix?: string | null
          publicar_site?: boolean | null
          razao_social?: string | null
          regime?: string | null
          status?: string | null
          telefone?: string | null
          temas?: string[] | null
          tipo_conta?: string | null
          tipo_pessoa?: string | null
          total_eventos?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          agencia?: string | null
          avaliacao_media?: number | null
          bairro?: string | null
          banco?: string | null
          bio?: string | null
          cache_max?: number | null
          cache_min?: number | null
          cache_padrao?: number | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          estado?: string | null
          exclusivo?: boolean | null
          formatos?: string[] | null
          foto_url?: string | null
          id?: string
          insc_municipal?: string | null
          logradouro?: string | null
          mini_bio?: string | null
          nome?: string
          nome_artistico?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          pix?: string | null
          publicar_site?: boolean | null
          razao_social?: string | null
          regime?: string | null
          status?: string | null
          telefone?: string | null
          temas?: string[] | null
          tipo_conta?: string | null
          tipo_pessoa?: string | null
          total_eventos?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      proposta_palestrantes: {
        Row: {
          cache_proposto: number | null
          id: string
          justificativa: string | null
          ordem: number | null
          palestrante_id: string | null
          proposta_id: string | null
          selecionado: boolean | null
        }
        Insert: {
          cache_proposto?: number | null
          id?: string
          justificativa?: string | null
          ordem?: number | null
          palestrante_id?: string | null
          proposta_id?: string | null
          selecionado?: boolean | null
        }
        Update: {
          cache_proposto?: number | null
          id?: string
          justificativa?: string | null
          ordem?: number | null
          palestrante_id?: string | null
          proposta_id?: string | null
          selecionado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_palestrantes_palestrante_id_fkey"
            columns: ["palestrante_id"]
            isOneToOne: false
            referencedRelation: "palestrantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_palestrantes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          cliente_id: string | null
          consultor_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          lead_id: string | null
          pdf_proposta_url: string | null
          pdf_sugestao_url: string | null
          status: string | null
          titulo: string
          updated_at: string | null
          validade: string | null
        }
        Insert: {
          cliente_id?: string | null
          consultor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          pdf_proposta_url?: string | null
          pdf_sugestao_url?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
          validade?: string | null
        }
        Update: {
          cliente_id?: string | null
          consultor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          pdf_proposta_url?: string | null
          pdf_sugestao_url?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_comissao: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          percentual: number
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          percentual: number
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          percentual?: number
          tipo?: string
        }
        Relationships: []
      }
      site_config: {
        Row: {
          chave: string
          id: string
          updated_at: string | null
          valor: string | null
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string | null
          valor?: string | null
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          perfil: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          perfil: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          perfil?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          briefing: string | null
          cache_palestr: number
          cidade: string | null
          cliente_id: string
          consultor_id: string | null
          created_at: string | null
          data_evento: string | null
          empresa_polo_id: string | null
          estado: string | null
          formato: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          lead_id: string | null
          local_evento: string | null
          palestrante_id: string
          proposta_id: string | null
          publico_estimado: number | null
          status: string | null
          titulo: string
          total_impostos: number | null
          updated_at: string | null
          valor_cofins: number | null
          valor_csll: number | null
          valor_irrf: number | null
          valor_iss: number | null
          valor_liquido: number | null
          valor_pis: number | null
          valor_total: number
        }
        Insert: {
          briefing?: string | null
          cache_palestr: number
          cidade?: string | null
          cliente_id: string
          consultor_id?: string | null
          created_at?: string | null
          data_evento?: string | null
          empresa_polo_id?: string | null
          estado?: string | null
          formato?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          lead_id?: string | null
          local_evento?: string | null
          palestrante_id: string
          proposta_id?: string | null
          publico_estimado?: number | null
          status?: string | null
          titulo: string
          total_impostos?: number | null
          updated_at?: string | null
          valor_cofins?: number | null
          valor_csll?: number | null
          valor_irrf?: number | null
          valor_iss?: number | null
          valor_liquido?: number | null
          valor_pis?: number | null
          valor_total: number
        }
        Update: {
          briefing?: string | null
          cache_palestr?: number
          cidade?: string | null
          cliente_id?: string
          consultor_id?: string | null
          created_at?: string | null
          data_evento?: string | null
          empresa_polo_id?: string | null
          estado?: string | null
          formato?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          lead_id?: string | null
          local_evento?: string | null
          palestrante_id?: string
          proposta_id?: string | null
          publico_estimado?: number | null
          status?: string | null
          titulo?: string
          total_impostos?: number | null
          updated_at?: string | null
          valor_cofins?: number | null
          valor_csll?: number | null
          valor_irrf?: number | null
          valor_iss?: number | null
          valor_liquido?: number | null
          valor_pis?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_empresa_polo_id_fkey"
            columns: ["empresa_polo_id"]
            isOneToOne: false
            referencedRelation: "empresas_polo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_palestrante_id_fkey"
            columns: ["palestrante_id"]
            isOneToOne: false
            referencedRelation: "palestrantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      meu_perfil: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
