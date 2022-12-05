import { inject } from "@loopback/core";
import { compare, genSalt, hash } from 'bcryptjs';
import { PasswordHasherBindings } from './Keys' 

export interface PasswordHasher<T = string> {
    hashPassword(password: T): Promise<T>;
    comparePassword(password: T, storedPassword: T): Promise<boolean>;
}

export class BcryptHasher implements PasswordHasher<string> {
    async comparePassword(password: string, storedPassword: string): Promise<boolean> {
        const passwordMatched = await compare(password, storedPassword);
        return passwordMatched;
    }

    @inject(PasswordHasherBindings.ROUNDS)
    public readonly rounds: number;

    async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(this.rounds);
        return hash(password, salt);
    }
}