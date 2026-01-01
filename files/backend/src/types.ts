import type { Response } from 'express';
import type { Client as MinioClient } from 'minio';

export type Role = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export interface Context {
  prisma: any;
  user: AuthUser | null;
  minio: MinioClient;
  bucket: string;
  res: Response;
}