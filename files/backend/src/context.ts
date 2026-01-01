import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { Client as MinioClient } from 'minio';
import type { AuthUser, Context } from './types.js';

const prisma = new PrismaClient();

const endpointUrl = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const parsed = new URL(endpointUrl);

const minio = new MinioClient({
  endPoint: parsed.hostname,
  port: Number(parsed.port) || 9000,
  useSSL: parsed.protocol === 'https:',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || ''
});

const bucket = process.env.MINIO_BUCKET || 'media';

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const token = req.cookies?.access_token || (req.headers.authorization?.split(' ')[1] ?? null);
  let user: AuthUser | null = null;
  if (token && process.env.JWT_SECRET) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET) as AuthUser;
    } catch {
      user = null;
    }
  }
  return { prisma, user, minio, bucket, res };
}