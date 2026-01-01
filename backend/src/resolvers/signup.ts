import crypto from 'crypto';
// ...

// helper: SHA-256 hex
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token, 'utf8').digest('hex');

export const resolvers = {
  Mutation: {
    signup: async (_: any, args: any, ctx: any) => {
      const user = await ctx.db.user.create({
        data: {
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          passwordHash: hash(args.password), // your existing password hashing
          verified: false,
        },
      });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          emailVerifyTokenHash: tokenHash,
          emailVerifyExpires: expires,
        },
      });

      const verifyUrl = `https://your-frontend-domain/verify-email?token=${rawToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        text: `Click to verify: ${verifyUrl}`,
        html: `Click to verify: <a href="${verifyUrl}">${verifyUrl}</a>`,
      });

      const jwt = makeJwt({ sub: user.id });
      return { token: jwt, user };
    },

    verifyEmail: async (_: any, { token }: any, ctx: any) => {
      const tokenHash = hashToken(token);

      const user = await ctx.db.user.findFirst({
        where: {
          emailVerifyTokenHash: tokenHash,
          emailVerifyExpires: { gt: new Date() },
        },
      });
      if (!user) throw new Error('Invalid or expired token');

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          emailVerifyTokenHash: null,
          emailVerifyExpires: null,
        },
      });

      return true;
    },
  },
};
