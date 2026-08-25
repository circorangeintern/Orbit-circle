import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import User, { type UserAuthRecord, type UserRecord } from '../models/user.model';
import { sendPasswordResetEmail } from './email.service';


interface RegisterInput {
    email?: string;
    password?: string;
    full_name?: string;
    role?: 'student' | 'mentor';
}

interface AuthResult {
    user: UserRecord;
    token: string;
}

interface ForgotPasswordResult {
    message: string;
    token?: string;
}

interface ResetTokenPayload extends jwt.JwtPayload {
    id: string;
    email: string;
    type: 'password_reset';
}

class AuthService {
    private static getJwtSecret(): string {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        return secret;
    }

    private static sanitizeUser(user: UserRecord): UserRecord {
        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            created_at: user.created_at,
            role: user.role, 
        };
    }

    private static getMonthMessage(): string {
        const monthName = new Date().toLocaleString('en-US', { month: 'long' });
        return `Welcome to Orbit Circle. Have a great ${monthName}.`;
    }

    private static generateUserId(): string {
        return randomUUID().replace(/-/g, '').slice(0, 4);
    }

    private static async generateUniqueUserId(): Promise<string> {
        for (let attempt = 0; attempt < 5; attempt++) {
            const id = this.generateUserId();
            const existing = await User.findById(id);

            if (!existing) {
                return id;
            }
        }

        throw new Error('Unable to generate a unique user id');
    }

    // Generate JWT token
    static generateToken(payload: object, expiresIn: jwt.SignOptions['expiresIn'] = '7d'): string {
        return jwt.sign(payload, this.getJwtSecret(), { expiresIn });
    }

    

    // Verify JWT token
    static verifyToken(token: string): string | jwt.JwtPayload {
        return jwt.verify(token, this.getJwtSecret());
    }

    // Hash password
    static async hashPassword(password: string, saltRounds = 10): Promise<string> {
        return bcrypt.hash(password, saltRounds);
    }

    // Compare password
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    // Generate password reset token
    static generateResetToken(user: UserRecord): string {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                type: 'password_reset'
            },
            this.getJwtSecret(),
            { expiresIn: '15m' }
        );
    }

    // Validate password strength
    static validatePassword(password: string) {
        if (!password || password.length < 6) {
            return {
                isValid: false,
                message: "Password must be at least 6 characters long"
            };
        }
        return { isValid: true };
    }

    private static validateRegistrationInput(data: RegisterInput): { email: string; password: string; full_name: string } {
        const email = data.email?.trim().toLowerCase();
        const password = data.password?.trim();
        const full_name = data.full_name?.trim() ?? '';

        if (!email || !password || !full_name) {
            throw new Error('Full name, email and password are required');
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        return { email, password, full_name };
    }

    static async register(data: RegisterInput): Promise<AuthResult > {
        const { email, password, full_name } = this.validateRegistrationInput(data);
        const role = data.role || 'student';

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const password_hash = await this.hashPassword(password);
        const id = await this.generateUniqueUserId();
        const user = await User.create({ id, full_name, email, password_hash, role });
        const token = this.generateToken({ id: user.id, email: user.email, role: user.role });

        return {
            user: this.sanitizeUser(user),
            token, 
        };
    }

    static async login(email: string, password: string): Promise<AuthResult> {
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            throw new Error('Invalid credentials');
        }

        const user = await User.findAuthByEmail(normalizedEmail);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return {
            user: this.sanitizeUser(user),
            token: this.generateToken({ id: user.id, email: user.email, role: user.role  }),
        };
    }

    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        if (!currentPassword || !newPassword) {
            throw new Error('Current password and new password are required');
        }

        const passwordValidation = this.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        const user = await User.findAuthById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        const password_hash = await this.hashPassword(newPassword);
        const updatedUser = await User.updatePassword(userId, password_hash);

        if (!updatedUser) {
            throw new Error('Failed to update password');
        }
    }

    static async forgotPassword(email: string): Promise<ForgotPasswordResult> {
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail) {
            throw new Error('Email is required');
        }

        const user = await User.findByEmail(normalizedEmail);

        if (!user) {
            return {
                message: 'If an account with that email exists, a reset link has been generated.',
            };
        }

        const token = this.generateResetToken(user);

        await sendPasswordResetEmail({
            to: user.email,
            fullName: user.full_name ?? '',
            token,
        });

        return {
            message: 'Password reset link generated successfully.',
            token,
        };
    }

    static async resetPassword(token: string, newPassword: string): Promise<void> {
        const passwordValidation = this.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        const decoded = this.verifyToken(token);
        if (typeof decoded === 'string' || decoded.type !== 'password_reset') {
            throw new Error('Invalid token type');
        }

        const payload = decoded as ResetTokenPayload;
        const user = await User.findById(payload.id);

        if (!user || user.email !== payload.email) {
            throw new Error('User not found');
        }

        const password_hash = await this.hashPassword(newPassword);
        const updatedUser = await User.updatePassword(payload.id, password_hash);

        if (!updatedUser) {
            throw new Error('Failed to reset password');
        }
    }

    static async logout(token: string): Promise<{ userId: string | null }> {
        const decoded = this.verifyToken(token);

        if (typeof decoded === 'string') {
            return { userId: null };
        }

        return {
            userId: typeof decoded.id === 'string' ? decoded.id : null,
        };
    }
}

export default AuthService;
