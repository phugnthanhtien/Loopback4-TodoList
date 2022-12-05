import {TokenService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import lodashSplit from 'lodash/split';
import {promisify} from 'util';
import {User} from '../models';
import {MyUserProfile} from './Credentials';
import {TokenServiceBindings} from './Keys';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

interface DecodedToken {
  iat: number;
  exp: number;
  id: string;
}

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    public readonly jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    public readonly jwtExpiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: MyUserProfile;

    try {
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      userProfile = Object.assign(
        {[securityId]: '', id: '', email: '', role: '', fullName: ''},
        {
          [securityId]: decodedToken.id,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          id: decodedToken.id,
          role: decodedToken.role,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: MyUserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }
    let token: string;
    try {
      token = await signAsync(userProfile, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }

  async generateTemporaryTokenForResetPassword(
    userProfile: User,
  ): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'error-generating-token-user-profile-is-null',
      );
    }
    const payload = {
      userId: userProfile.id,
    };
    let token: string;
    try {
      token = await signAsync(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }

  async decodeToken(token: string): Promise<DecodedToken> {
    const decodedToken = await verifyAsync(token, this.jwtSecret);
    return decodedToken;
  }

  extractToken(authHeader: string): string {
    if (authHeader && lodashSplit(authHeader, ' ')[0] === 'Bearer') {
      return lodashSplit(authHeader, ' ')[1];
    }
    return '';
  }
}
