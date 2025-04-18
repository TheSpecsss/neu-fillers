import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();

// Configure Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `http://localhost:${process.env.PORT || 3003}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              first_name: profile.name?.givenName || '',
              last_name: profile.name?.familyName || '',
              role_access: 98,
              password: 'google-oauth',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Google OAuth login route
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.error('No user object in request');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      const token = jwt.sign(
        { 
          user_id: user.user_id, 
          email: user.email, 
          role_access: user.role_access 
        },
        process.env.JWT_SECRET || 'your-secret-key'
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error('Error in auth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
);

export default router; 