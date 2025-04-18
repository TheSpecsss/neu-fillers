import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma';
import type { GoogleProfile } from '../types/requests';

interface PrismaUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_access: number;
}

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string;
      firstName: string;
      lastName: string;
      roleAccess: number;
    }
  }
}

class AuthService {
  constructor() {
    this.setupPassport();
  }

  private setupPassport() {
    passport.serializeUser((user: Express.User, done) => {
      done(null, user.userId);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const prismaUser = await prisma.user.findUnique({
          where: { user_id: id }
        });
        if (!prismaUser) {
          return done(new Error('User not found'), null);
        }
        const user: Express.User = {
          userId: prismaUser.user_id,
          email: prismaUser.email,
          firstName: prismaUser.first_name,
          lastName: prismaUser.last_name,
          roleAccess: prismaUser.role_access
        };
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          callbackURL: `http://localhost:${process.env.PORT || 3003}/api/auth/google/callback`,
        },
        async (accessToken: string, refreshToken: string, profile: GoogleProfile, done) => {
          try {
            let prismaUser = await prisma.user.findUnique({
              where: { email: profile.emails?.[0]?.value || '' }
            });

            if (!prismaUser) {
              prismaUser = await prisma.user.create({
                data: {
                  email: profile.emails?.[0]?.value || '',
                  first_name: profile.name?.givenName || '',
                  last_name: profile.name?.familyName || '',
                  role_access: 98,
                  password: 'google-oauth',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
            }

            const user: Express.User = {
              userId: prismaUser.user_id,
              email: prismaUser.email,
              firstName: prismaUser.first_name,
              lastName: prismaUser.last_name,
              roleAccess: prismaUser.role_access
            };

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  getPassport() {
    return passport;
  }
}

export const authService = new AuthService(); 