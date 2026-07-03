import UserModel from '../models/userModel.js';

type NameRoleInput = {
  name?: string;
  nombre?: string;
  role?: string;
  rol?: string;
};

/**
 * Maps PostgreSQL row to UserModel entity.
 * @param {Record<string, unknown>|null|undefined} row
 * @returns {UserModel|null}
 */
function mapUserRow(row: Record<string, unknown> | null | undefined): UserModel | null {
  return UserModel.fromRow(row);
}

/**
 * @param {Record<string, unknown>[]} rows
 * @returns {UserModel[]}
 */
function mapUserRows(rows: Record<string, unknown>[]) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => UserModel.fromRow(row)).filter(Boolean) as UserModel[];
}

function pickName(body: NameRoleInput = {}) {
  return body.name ?? body.nombre ?? null;
}

function pickRole(body: NameRoleInput = {}) {
  return body.role ?? body.rol ?? null;
}

export { mapUserRow, mapUserRows, pickName, pickRole };
