import { Router, Request, Response } from 'express';
import axios from 'axios';
//import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import AuthService from '../services/auth.service';

const router = Router();

// 1. Redirect user to Google
router.get('/', (_req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const redirectUri = 'http://localhost:3002/auth/google/callback';
    // Standard OAuth scopes for email and profile
    const scope = 'openid email profile';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    res.redirect(googleAuthUrl);
});

// 2. Google redirects back here with a `code`
router.get('/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
            client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            code,
            redirect_uri: 'http://localhost:3002/auth/google/callback',
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenResponse.data;

        // Fetch user profile from Google
        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const { email, name, id: googleId } = profileResponse.data;

        // Check if user exists in your DB
        let user = await User.findByEmail(email);
        if (!user) {
            // Create new user (Password is null for Google users)
            user = await User.create({
                id: await AuthService['generateUniqueUserId'](),
                full_name: name || email.split('@')[0],
                email: email,
                password_hash: null, // This will now be valid because we fixed the Model!
                role: 'student',
                google_id: googleId // <-- optional: add if you add this column to your DB
            });
        }
        else {
            // 2. User already exists -> just link the google_id to their account!
            await User.updateGoogleId(user.id, googleId); // <-- You'll need to write this small DB query in your user.model.ts
        }

        // Generate your internal JWT 
        const token = AuthService.generateToken({ id: user.id, email: user.email, role: user.role });

        // Redirect back to the FRONTEND 
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?token=${token}&role=${user.role}`);

    } catch (error) {
        console.error('Google OAuth Error:', error);
        res.status(500).send('Authentication failed');
    }
});

export default router;