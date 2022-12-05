import { UserProfile } from '@loopback/security';
import { ERole } from '../enums';

export type Credentials = {
  email: string;
  password: string;
};

export interface MyUserProfile extends UserProfile {
  id: string;
  email: string;
  fullName: string;
  role?: ERole;
}