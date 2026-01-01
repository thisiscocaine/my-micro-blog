import crypto from 'crypto';
import { sendEmail } from '../services/mailer'; // implement with nodemailer

export const resolvers = {
  Mutation: {
    signup: async (_: any, { firstName, lastName, email, password }: any, ctx: any) => {
      // create user
      const user = await ctx.db.user.create({
        data: { firstName, lastName, email, passwordHash: hash(password), verified: false },
      });

      // verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

      await ctx.db.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: token, emailVerifyExpires: expires },
      });

      // send email
      const verifyUrl = `https://your-frontend-domain/verify-email?token=${token}`;
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        text: `Click to verify: ${verifyUrl}`,
        html: `Click to verify: <a href="${verifyUrl}">${verifyUrl}</a>`,
      });

      // return login token if you want auto-login; or return success message
      const jwt = makeJwt({ sub: user.id });
      return { token: jwt, user };
    },

    verifyEmail: async (_: any, { token }: any, ctx: any) => {
      const user = await ctx.db.user.findFirst({
        where: { emailVerifyToken: token, emailVerifyExpires: { gt: new Date() } },
      });
      if (!user) throw new Error('Invalid or expired token');

      await ctx.db.user.update({
        where: { id: user.id },
        data: { verified: true, emailVerifyToken: null, emailVerifyExpires: null },
      });
      return true;
    },
  },
};
