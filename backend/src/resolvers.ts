import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { GraphQLError } from 'graphql';
import { z } from 'zod';
import type { Context } from './types.js';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const postSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  coverMediaId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional()
});

const uploadSchema = z.object({
  fileName: z.string().min(1),
  mime: z.string().min(3),
  size: z.number().min(1).max(50 * 1024 * 1024)
});

function ensureAuth(ctx: Context) {
  if (!ctx.user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.user;
}

function ensureAdmin(ctx: Context) {
  const user = ensureAuth(ctx);
  if (user.role !== 'ADMIN') throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
  return user;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 // 1h
  };
}

function sign(user: { id: string; role: string; email: string }) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function avScanPlaceholder(_objectKey: string) {
  // Hook for AV scanner (e.g., ClamAV daemon). Integrate here.
  return true;
}

export const resolvers = {
  Query: {
    me: (_: any, __: any, ctx: Context) => ctx.user,
    posts: async (_: any, args: { status?: 'DRAFT' | 'PUBLISHED' }, ctx: Context) => {
      const where = args.status ? { status: args.status } : {};
      return ctx.prisma.post.findMany({
        where,
        include: { author: true, coverMedia: true, counters: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    post: (_: any, { id }: { id: string }, ctx: Context) =>
      ctx.prisma.post.findUnique({ where: { id }, include: { author: true, coverMedia: true, counters: true } })
  },
  Mutation: {
    signup: async (_: any, args: { email: string; password: string }, ctx: Context) => {
      const data = signupSchema.parse(args);
      const hashed = await bcrypt.hash(data.password, 12);
      const user = await ctx.prisma.user.create({ data: { email: data.email, password: hashed, role: 'ADMIN' } });
      const token = sign({ id: user.id, role: user.role, email: user.email });
      ctx.res.cookie('access_token', token, cookieOptions());
      return { accessToken: token, user };
    },
    login: async (_: any, { email, password }: { email: string; password: string }, ctx: Context) => {
      const user = await ctx.prisma.user.findUnique({ where: { email } });
      if (!user) throw new GraphQLError('Invalid credentials');
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) throw new GraphQLError('Invalid credentials');
      const token = sign({ id: user.id, role: user.role, email: user.email });
      ctx.res.cookie('access_token', token, cookieOptions());
      return { accessToken: token, user };
    },
    logout: (_: any, __: any, ctx: Context) => {
      ctx.res.clearCookie('access_token');
      return true;
    },
    createPost: async (_: any, args: any, ctx: Context) => {
      const user = ensureAuth(ctx);
      const data = postSchema.parse(args);
      return ctx.prisma.post.create({
        data: {
          title: data.title,
          body: data.body,
          coverMediaId: data.coverMediaId,
          status: 'DRAFT',
          authorId: user.id,
          counters: { create: {} }
        },
        include: { author: true, coverMedia: true, counters: true }
      });
    },
    updatePost: async (_: any, args: any, ctx: Context) => {
      const user = ensureAuth(ctx);
      const data = postSchema.partial().parse(args);
      const post = await ctx.prisma.post.findUnique({ where: { id: args.id } });
      if (!post) throw new GraphQLError('Not found');
      if (user.role !== 'ADMIN' && post.authorId !== user.id) throw new GraphQLError('Forbidden');
      return ctx.prisma.post.update({
        where: { id: args.id },
        data: {
          title: data.title ?? undefined,
          body: data.body ?? undefined,
          coverMediaId: data.coverMediaId,
          status: data.status,
          publishedAt: data.status === 'PUBLISHED' ? new Date() : post.publishedAt
        },
        include: { author: true, coverMedia: true, counters: true }
      });
    },
    deletePost: async (_: any, { id }: { id: string }, ctx: Context) => {
      const user = ensureAuth(ctx);
      const post = await ctx.prisma.post.findUnique({ where: { id } });
      if (!post) return false;
      if (user.role !== 'ADMIN' && post.authorId !== user.id) throw new GraphQLError('Forbidden');
      await ctx.prisma.counter.deleteMany({ where: { postId: id } });
      await ctx.prisma.post.delete({ where: { id } });
      return true;
    },
    incrementCounters: async (_: any, { id, likes = 0, shares = 0, comments = 0 }: any, ctx: Context) => {
      await ctx.prisma.counter.upsert({
        where: { postId: id },
        create: { postId: id, likes, shares, comments },
        update: {
          likes: { increment: likes },
          shares: { increment: shares },
          comments: { increment: comments }
        }
      });
      return ctx.prisma.counter.findUnique({ where: { postId: id } });
    },
    createUploadUrl: async (_: any, args: any, ctx: Context) => {
      const user = ensureAuth(ctx);
      const data = uploadSchema.parse(args);

      await ctx.minio.makeBucket(ctx.bucket).catch(() => {});
      const objectKey = `${nanoid()}-${data.fileName}`;

      const url = await ctx.minio.presignedPutObject(ctx.bucket, objectKey, 60 * 5, { 'Content-Type': data.mime });
      const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
      const publicUrl = `${endpoint}/${ctx.bucket}/${objectKey}`;

      // AV hook placeholder
      await avScanPlaceholder(objectKey);

      const media = await ctx.prisma.media.create({
        data: { url: publicUrl, type: data.mime.startsWith('video') ? 'VIDEO' : 'IMAGE', mime: data.mime, size: data.size, ownerId: user.id }
      });

      return { url, fields: null, publicUrl, objectKey, mediaId: media.id };
    }
  },
  Post: {
    counters: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.counter.findUnique({ where: { postId: parent.id } }),
    author: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.user.findUnique({ where: { id: parent.authorId } })
  }
};