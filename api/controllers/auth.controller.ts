import type { Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.model';
import AuthService from '../services/auth.service';

interface AuthenticatedRequest extends Request {
    user?: JwtPayload & { id?: string };
}

const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : 'Unknown error';
};

const signup = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body);

        res.status(201).json({
            message: 'User added successfully',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        const message = getErrorMessage(error);
        console.error('Signup error:', error);

        if (
            message === 'User already exists' ||
            message === 'Full name, email and password are required' ||
            message === 'Password must be at least 6 characters long'
        ) {
            return res.status(400).json({ message });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);

        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            token: result.token,
            role: result.user.role
        });
    } catch (error) {
        const message = getErrorMessage(error);
        console.error('Login error:', error);

        if (message === 'Invalid credentials') {
            return res.status(401).json({ message });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

const profile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile retrieved successfully',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                created_at: user.created_at,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'failed',
                message: 'Access denied. No token provided.',
            });
        }

        await AuthService.changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
        });
    } catch (error) {
        const message = getErrorMessage(error);
        console.error('Change password error:', error);

        if (message === 'User not found') {
            return res.status(404).json({
                status: 'failed',
                message,
            });
        }

        if (
            message === 'Current password is incorrect' ||
            message === 'Password must be at least 6 characters long' ||
            message === 'Failed to update password' ||
            message === 'Current password and new password are required'
        ) {
            return res.status(400).json({
                status: 'failed',
                message,
            });
        }

        res.status(500).json({
            status: 'failed',
            message: 'Internal server error',
        });
    }
};

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'failed',
                message: 'Email is required',
            });
        }

        const result = await AuthService.forgotPassword(email);

        res.status(200).json({
            status: 'success',
            message: result.message,

        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal server error',
        });
    }
};

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                status: 'failed',
                message: 'Token and password are required',
            });
        }

        await AuthService.resetPassword(token, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully. You can now login with your new password.',
        });
    } catch (error) {
        const message = getErrorMessage(error);
        console.error('Reset password error:', error);

        if (message === 'jwt expired') {
            return res.status(400).json({
                status: 'failed',
                message: 'Reset token has expired. Please request a new password reset.',
            });
        }

        if (message === 'jwt malformed' || message === 'invalid signature') {
            return res.status(400).json({
                status: 'failed',
                message: 'Invalid reset token. Please request a new password reset.',
            });
        }

        if (
            message === 'User not found' ||
            message === 'Invalid token type' ||
            message === 'Password must be at least 6 characters long' ||
            message === 'Failed to update password'
        ) {
            return res.status(400).json({
                status: 'failed',
                message,
            });
        }

        res.status(500).json({
            status: 'failed',
            message: 'Internal server error',
        });
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            return res.status(400).json({
                status: 'failed',
                message: 'No token provided',
            });
        }

        const result = await AuthService.logout(token);

        if (result.userId) {
            console.log(`User ${result.userId} logged out at ${new Date().toISOString()}`);
        }

        res.status(200).json({
            status: 'success',
            message: 'Logout successful. Please delete the token from your client storage.',
        });
    } catch (error) {
        console.log('Logout attempt with invalid/expired token:', getErrorMessage(error));

        res.status(200).json({
            status: 'success',
            message: 'Logout successful. Please delete the token from your client storage.',
        });
    }
};

export default {
    signup,
    login,
    profile,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
};
