/**
 * DTOs para colaboración: comentarios, adjuntos y notificaciones.
 */

type CommentRow = {
  id: string | number;
  task_id: string | number;
  user_id: string | number;
  content: string;
  created_at: string;
};

type AttachmentRow = {
  id: string | number;
  task_id: string | number;
  user_id: string | number;
  document_name: string;
  document_url: string;
  created_at: string;
};

type NotificationRow = {
  id: string | number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export interface CommentDto {
  id: string | number;
  taskId: string | number;
  userId: string | number;
  content: string;
  createdAt: string;
}

export interface AttachmentDto {
  id: string | number;
  taskId: string | number;
  userId: string | number;
  documentName: string;
  documentUrl: string;
  createdAt: string;
}

export interface NotificationDto {
  id: string | number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CreateCommentInputDto {
  content: string;
}

export interface CreateAttachmentInputDto {
  documentName: string;
  documentUrl: string;
}

export function commentToDto(row: CommentRow): CommentDto {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at
  };
}

export function commentsToDto(rows: CommentRow[]): CommentDto[] {
  return (rows ?? []).map(commentToDto);
}

export function attachmentToDto(row: AttachmentRow): AttachmentDto {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    documentName: row.document_name,
    documentUrl: row.document_url,
    createdAt: row.created_at
  };
}

export function attachmentsToDto(rows: AttachmentRow[]): AttachmentDto[] {
  return (rows ?? []).map(attachmentToDto);
}

export function notificationToDto(row: NotificationRow): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: row.created_at
  };
}

export function notificationsToDto(rows: NotificationRow[]): NotificationDto[] {
  return (rows ?? []).map(notificationToDto);
}

export function createCommentInputDto(body: Record<string, unknown> = {}): CreateCommentInputDto {
  return { content: String(body.content ?? '').trim() };
}

export function createAttachmentInputDto(body: Record<string, unknown> = {}): CreateAttachmentInputDto {
  return {
    documentName: String(body.documentName ?? body.name ?? '').trim(),
    documentUrl: String(body.documentUrl ?? body.url ?? '').trim()
  };
}

export function commentsListResponseDto(comments: CommentDto[]) {
  return { comments };
}

export function attachmentsListResponseDto(attachments: AttachmentDto[]) {
  return { attachments };
}

export function notificationsListResponseDto(notifications: NotificationDto[]) {
  return { notifications };
}

export function markNotificationReadResponseDto(row: { id: string | number; read: boolean }) {
  return { id: row.id, read: row.read };
}
