import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models';
import type { GoogleProfile } from '../types/requests';

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

passport.serializeUser((user: Express.User, done) => {
  console.log('Serializing user:', user.userId);
  done(null, user.userId);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    console.log('Deserializing user:', id);
    const user = await User.findByPk(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
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
        console.log('Google profile:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName
        });

        // Check if user exists
        let user = await User.findOne({
          where: { email: profile.emails?.[0]?.value }
        });

        if (!user) {
          console.log('Creating new user');
          // Create new user
          user = await User.create({
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            roleAccess: 98, // default user role
            password: 'google-oauth' // placeholder password as it's not used
          });
          console.log('New user created:', user.toJSON());
        } else {
          console.log('Existing user found:', user.toJSON());
        }

        return done(null, user);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error as Error, undefined);
      }
    }
  )
); 