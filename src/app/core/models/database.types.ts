export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      equipos: {
        Row: {
          codigo_invitacion: string;
          creado_en: string;
          creado_por: string | null;
          id: string;
          nombre: string;
        };
        ComputedFields: never;
        Insert: {
          codigo_invitacion: string;
          creado_en?: string;
          creado_por?: string | null;
          id?: string;
          nombre: string;
        };
        Update: {
          codigo_invitacion?: string;
          creado_en?: string;
          creado_por?: string | null;
          id?: string;
          nombre?: string;
        };
        Relationships: [];
      };
      gastos: {
        Row: {
          anulado: boolean;
          anulado_en: string | null;
          anulado_por: string | null;
          concepto: string;
          creado_en: string;
          creado_por: string | null;
          equipo_id: string;
          fecha: string;
          id: string;
          importe_centimos: number;
          nota: string | null;
        };
        ComputedFields: never;
        Insert: {
          anulado?: boolean;
          anulado_en?: string | null;
          anulado_por?: string | null;
          concepto: string;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id: string;
          fecha?: string;
          id?: string;
          importe_centimos: number;
          nota?: string | null;
        };
        Update: {
          anulado?: boolean;
          anulado_en?: string | null;
          anulado_por?: string | null;
          concepto?: string;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id?: string;
          fecha?: string;
          id?: string;
          importe_centimos?: number;
          nota?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'gastos_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'equipos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gastos_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'resumen_equipo';
            referencedColumns: ['equipo_id'];
          },
        ];
      };
      miembros: {
        Row: {
          activo: boolean;
          creado_en: string;
          creado_por: string | null;
          equipo_id: string;
          id: string;
          nombre: string;
          pendiente: boolean;
          rol: Database['public']['Enums']['rol_miembro'];
          usuario_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id: string;
          id?: string;
          nombre: string;
          pendiente?: boolean;
          rol?: Database['public']['Enums']['rol_miembro'];
          usuario_id?: string | null;
        };
        Update: {
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id?: string;
          id?: string;
          nombre?: string;
          pendiente?: boolean;
          rol?: Database['public']['Enums']['rol_miembro'];
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'miembros_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'equipos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'miembros_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'resumen_equipo';
            referencedColumns: ['equipo_id'];
          },
        ];
      };
      multas: {
        Row: {
          anulada: boolean;
          anulada_en: string | null;
          anulada_por: string | null;
          concepto: string;
          creado_en: string;
          creado_por: string | null;
          equipo_id: string;
          fecha: string;
          id: string;
          importe_centimos: number;
          miembro_id: string;
          nota: string | null;
          tipo_multa_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          anulada?: boolean;
          anulada_en?: string | null;
          anulada_por?: string | null;
          concepto: string;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id: string;
          fecha?: string;
          id?: string;
          importe_centimos: number;
          miembro_id: string;
          nota?: string | null;
          tipo_multa_id?: string | null;
        };
        Update: {
          anulada?: boolean;
          anulada_en?: string | null;
          anulada_por?: string | null;
          concepto?: string;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id?: string;
          fecha?: string;
          id?: string;
          importe_centimos?: number;
          miembro_id?: string;
          nota?: string | null;
          tipo_multa_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'multas_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'equipos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'multas_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'resumen_equipo';
            referencedColumns: ['equipo_id'];
          },
          {
            foreignKeyName: 'multas_miembro_fkey';
            columns: ['miembro_id', 'equipo_id'];
            isOneToOne: false;
            referencedRelation: 'miembros';
            referencedColumns: ['id', 'equipo_id'];
          },
          {
            foreignKeyName: 'multas_miembro_fkey';
            columns: ['miembro_id', 'equipo_id'];
            isOneToOne: false;
            referencedRelation: 'saldos_miembros';
            referencedColumns: ['miembro_id', 'equipo_id'];
          },
          {
            foreignKeyName: 'multas_tipo_multa_fkey';
            columns: ['tipo_multa_id', 'equipo_id'];
            isOneToOne: false;
            referencedRelation: 'tipos_multa';
            referencedColumns: ['id', 'equipo_id'];
          },
        ];
      };
      pagos: {
        Row: {
          anulado: boolean;
          anulado_en: string | null;
          anulado_por: string | null;
          creado_en: string;
          creado_por: string | null;
          equipo_id: string;
          fecha: string;
          id: string;
          importe_centimos: number;
          metodo: Database['public']['Enums']['metodo_pago'];
          miembro_id: string;
          nota: string | null;
        };
        ComputedFields: never;
        Insert: {
          anulado?: boolean;
          anulado_en?: string | null;
          anulado_por?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id: string;
          fecha?: string;
          id?: string;
          importe_centimos: number;
          metodo?: Database['public']['Enums']['metodo_pago'];
          miembro_id: string;
          nota?: string | null;
        };
        Update: {
          anulado?: boolean;
          anulado_en?: string | null;
          anulado_por?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id?: string;
          fecha?: string;
          id?: string;
          importe_centimos?: number;
          metodo?: Database['public']['Enums']['metodo_pago'];
          miembro_id?: string;
          nota?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pagos_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'equipos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pagos_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'resumen_equipo';
            referencedColumns: ['equipo_id'];
          },
          {
            foreignKeyName: 'pagos_miembro_fkey';
            columns: ['miembro_id', 'equipo_id'];
            isOneToOne: false;
            referencedRelation: 'miembros';
            referencedColumns: ['id', 'equipo_id'];
          },
          {
            foreignKeyName: 'pagos_miembro_fkey';
            columns: ['miembro_id', 'equipo_id'];
            isOneToOne: false;
            referencedRelation: 'saldos_miembros';
            referencedColumns: ['miembro_id', 'equipo_id'];
          },
        ];
      };
      tipos_multa: {
        Row: {
          activo: boolean;
          creado_en: string;
          creado_por: string | null;
          equipo_id: string;
          id: string;
          importe_centimos: number;
          nombre: string;
        };
        ComputedFields: never;
        Insert: {
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id: string;
          id?: string;
          importe_centimos: number;
          nombre: string;
        };
        Update: {
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          equipo_id?: string;
          id?: string;
          importe_centimos?: number;
          nombre?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tipos_multa_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'equipos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tipos_multa_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'resumen_equipo';
            referencedColumns: ['equipo_id'];
          },
        ];
      };
    };
    Views: {
      resumen_equipo: {
        Row: {
          bote_centimos: number | null;
          equipo_id: string | null;
          gastado_centimos: number | null;
          pendiente_cobro_centimos: number | null;
          recaudado_centimos: number | null;
        };
        ComputedFields: never;
        Relationships: [];
      };
      saldos_miembros: {
        Row: {
          activo: boolean | null;
          equipo_id: string | null;
          miembro_id: string | null;
          nombre: string | null;
          pendiente: boolean | null;
          rol: Database['public']['Enums']['rol_miembro'] | null;
          saldo_centimos: number | null;
          total_multas_centimos: number | null;
          total_pagado_centimos: number | null;
          usuario_id: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: 'miembros_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'equipos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'miembros_equipo_id_fkey';
            columns: ['equipo_id'];
            isOneToOne: false;
            referencedRelation: 'resumen_equipo';
            referencedColumns: ['equipo_id'];
          },
        ];
      };
    };
    Functions: {
      aceptar_solicitud: { Args: { miembro_id: string }; Returns: undefined };
      anular_gasto: { Args: { gasto_id: string }; Returns: undefined };
      anular_multa: { Args: { multa_id: string }; Returns: undefined };
      anular_pago: { Args: { pago_id: string }; Returns: undefined };
      cambiar_rol: {
        Args: { miembro_id: string; rol: Database['public']['Enums']['rol_miembro'] };
        Returns: undefined;
      };
      crear_equipo: {
        Args: { con_catalogo_ejemplo?: boolean; mi_nombre: string; nombre_equipo: string };
        Returns: string;
      };
      desactivar_miembro: { Args: { miembro_id: string }; Returns: undefined };
      desvincular_miembro: { Args: { miembro_id: string }; Returns: undefined };
      miembros_reclamables: {
        Args: { codigo: string };
        Returns: {
          id: string;
          nombre: string;
        }[];
      };
      mis_equipos: {
        Args: Record<PropertyKey, never>;
        Returns: {
          activo: boolean;
          equipo_id: string;
          equipo_nombre: string;
          mi_nombre: string;
          miembro_id: string;
          pendiente: boolean;
          rol: Database['public']['Enums']['rol_miembro'];
        }[];
      };
      reactivar_miembro: { Args: { miembro_id: string }; Returns: undefined };
      rechazar_solicitud: { Args: { miembro_id: string }; Returns: undefined };
      regenerar_codigo: { Args: { equipo_id: string }; Returns: string };
      unirse_con_codigo: {
        Args: { codigo: string; mi_nombre?: string; miembro_id?: string };
        Returns: string;
      };
    };
    Enums: {
      metodo_pago: 'bizum' | 'efectivo' | 'otro';
      rol_miembro: 'admin' | 'tesorero' | 'jugador';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      metodo_pago: ['bizum', 'efectivo', 'otro'],
      rol_miembro: ['admin', 'tesorero', 'jugador'],
    },
  },
} as const;
