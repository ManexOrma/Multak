import { Database, Enums, Tables } from './database.types';

type Funciones = Database['public']['Functions'];

export type Rol = Enums<'rol_miembro'>;
export type MetodoPago = Enums<'metodo_pago'>;
export type Equipo = Tables<'equipos'>;
export type Miembro = Tables<'miembros'>;
export type TipoMulta = Tables<'tipos_multa'>;

/** Una de mis fichas (en cualquier estado) con el nombre de su equipo. */
export type MiEquipo = Funciones['mis_equipos']['Returns'][number];
export type FichaReclamable = Funciones['miembros_reclamables']['Returns'][number];
export type InfoInvitacion = Funciones['info_invitacion']['Returns'][number];
