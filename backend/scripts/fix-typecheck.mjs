#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function patch(relPath, replacers) {
  const full = path.join(root, relPath);
  let content = fs.readFileSync(full, 'utf8');
  let changed = false;
  for (const [from, to] of replacers) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(full, content, 'utf8');
    console.log('patched', relPath);
  }
}

patch('ms-auth/src/clients/elasticAuditClient.ts', [
  ['  const opts = { node };', '  const opts: Record<string, unknown> = { node };']
]);

patch('ms-auth/src/clients/usersClient.ts', [
  ['class UsersClient {\n  constructor() {', `class UsersClient {
  baseUrl: string;
  apiPrefix: string;

  constructor() {`],
  ['logger.info(`[UsersClient] Usuario no encontrado - Email: ${email}`);', 'logger.info(`[UsersClient] Usuario no encontrado - Email: ${email}`, {});']
]);

patch('ms-auth/src/models/userModel.ts', [
  ['class UserModel {\n  constructor({', `class UserModel {
  id: unknown;
  nombre: unknown;
  email: unknown;
  password: unknown;
  rol: unknown;
  createdAt: unknown;
  updatedAt: unknown;

  constructor({`]
]);

patch('ms-auth/src/services/token.blacklist.service.ts', [
  ['class TokenBlacklistService {\n  constructor() {', `class TokenBlacklistService {
  blacklist: Set<string>;
  metadata: Map<string, Record<string, unknown>>;
  cleanupInterval: ReturnType<typeof setInterval> | null;

  constructor() {`],
  ['    this.startCleanupInterval();', '    this.cleanupInterval = null;\n    this.startCleanupInterval();']
]);

patch('ms-auth/src/routes/jwks.routes.ts', [
  ["import fs from 'fs';\nimport path from 'path';\nimport crypto from 'crypto';", "import fs from 'fs';\nimport crypto from 'crypto';"]
]);

patch('ms-auth/src/config/database.ts', [
  ['port: process.env.DB_PORT || 5432,', 'port: Number(process.env.DB_PORT || 5432),']
]);

patch('ms-auth/src/controllers/auth.controller.ts', [
  ['error.errors.length', '(Array.isArray(error.errors) ? error.errors : []).length']
]);

patch('ms-auth/src/utils/responseUtil.ts', [
  ['err.errors?.length', 'Array.isArray(err.errors) && err.errors.length']
]);

patch('ms-project-manager/src/clients/elasticAuditClient.ts', [
  ['  const opts = { node };', '  const opts: Record<string, unknown> = { node };']
]);

patch('ms-project-manager/src/dtos/taskDto.ts', [
  ['export function taskToDto(task: Record<string, unknown> | null) {', 'export function taskToDto(task: Record<string, unknown> | null | object) {'],
  ['export function createTaskDto(body: Record<string, unknown> = {}) {', 'export function createTaskDto(body: Record<string, unknown> | object = {}) {']
]);

patch('ms-project-manager/src/dtos/projectDto.ts', [
  ['export function projectToDto(project: Record<string, unknown> | null) {', 'export function projectToDto(project: Record<string, unknown> | null | object) {']
]);

patch('ms-project-manager/src/dtos/resourceAvailabilityDto.ts', [
  ['export function projectAvailabilityToDto(project: { id: string | number }): ResourceAvailabilityDto {', 'export function projectAvailabilityToDto(project: { id: string | number | unknown }): ResourceAvailabilityDto {'],
  ['export function taskAvailabilityToDto(task: {\n  id: string | number;\n  projectId: string | number;\n}): ResourceAvailabilityDto {', 'export function taskAvailabilityToDto(task: {\n  id: string | number | unknown;\n  projectId: string | number | unknown;\n}): ResourceAvailabilityDto {']
]);

patch('ms-project-manager/src/lib/internalHttpClient.ts', [
  ['const err = new Error(`HTTP ${res.status}`);', 'const err = new Error(`HTTP ${res.status}`) as Error & { status: number; body: unknown };']
]);

console.log('Done patching typecheck fixes.');
