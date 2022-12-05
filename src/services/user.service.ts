import {UserService} from '@loopback/authentication';
import { inject } from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
import {User} from '../models';
import {UserRepository} from '../repositories';
import { Credentials, MyUserProfile } from './Credentials';
import { BcryptHasher } from './hash.password';
import { JWTService } from './jwt.service';
import { PasswordHasherBindings, TokenServiceBindings } from './Keys';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized("User does not exist");
    }
    const passwordMatched = await compare(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized("Wrong password");
    }
    return foundUser;
  }

  convertToUserProfile(user: User): MyUserProfile {
    return {
      [securityId]: user.id!,
      id: user.id!,
      email: user.email,
      fullName: user.fullName!
    };
  }
}