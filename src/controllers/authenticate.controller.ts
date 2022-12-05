import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { getModelSchemaRef, post, requestBody } from "@loopback/rest";
import { User } from "../models";
import { UserRepository } from "../repositories";
import {pick} from 'lodash';
import { BcryptHasher, Credentials, JWTService, MyUserService, PasswordHasherBindings, TokenServiceBindings, UserServiceBindings, validateCredentials } from "../services";
export class AuthController {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,

        @inject(PasswordHasherBindings.PASSWORD_HASHER)
        public hasher: BcryptHasher,

        @inject(UserServiceBindings.USER_SERVICE)
        public userService: MyUserService,

        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: JWTService,
    ){}

    @post('/signup', {
        responses: {
          '200': {
            description: 'Create a new user',
            content: {
              'application/json': {
                schema: getModelSchemaRef(User, {
                  title: 'NewUser',
                }),
              },
            },
          },
        },
      })
      async signup(
        @requestBody({
          content: {
            'application/json': {
              schema: getModelSchemaRef(User, {
                exclude: ['id', 'createdAt', 'updatedAt'],
              }),
            },
          },
        })
        userData: Omit<User, 'id'>,
      ) {
        await validateCredentials(pick(userData, ['email', 'password']), this.userRepository);
    
        const hashedPassword = await this.hasher.hashPassword(userData.password);
        const newUser = await this.userRepository.create({
          email: userData.email,
          password: hashedPassword,
        });
        return newUser;
      }

      @post('/login', {
        responses: {
          '200': {
            description: 'Token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      })
      async login(
        @requestBody() credentials: Credentials,
      ): Promise<{token: string}> {
        const user = await this.userService.verifyCredentials(credentials);
        const userProfile = this.userService.convertToUserProfile(user);
        const token = await this.jwtService.generateToken(userProfile);
        return Promise.resolve({token});
      }
}