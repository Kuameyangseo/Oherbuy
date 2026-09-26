import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import prisma from '../../../../packages/libs/prisma';
import { randomBytes } from 'crypto';

const getGoogleCallbackUrl = () => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }

  const serverUrl = new URL(process.env.SERVER_URI || 'http://localhost:3000');
  return `${serverUrl.protocol}//${serverUrl.hostname}:8080/api/auth/google/callback`;
};

export const configureGoogleAuth = () => {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: getGoogleCallbackUrl(),
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google account did not provide an email address'));
        }

        let user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
          const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
          user = await prisma.users.create({
            data: {
              email,
              name: profile.displayName || email.split('@')[0],
              password,
              country: 'Unknown',
            },
          });
        }

        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
        });
      } catch (error) {
        return done(error as Error);
      }
    },
  ));
};