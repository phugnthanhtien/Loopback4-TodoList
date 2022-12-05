import {registerAuthenticationStrategy} from '@loopback/authentication';
import {
  Application,
  Binding,
  Component,
  CoreBindings,
  inject,
} from '@loopback/core';
import {BcryptHasher} from './hash.password';
import {JWTStrategy} from './jwt-authenticate-strategy';
import {JWTService} from './jwt.service';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './Keys';
import {MyUserService} from './user.service';

export class MyJWTAuthenticationComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService),

    Binding.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher),
    Binding.bind(PasswordHasherBindings.ROUNDS).to(10),

    Binding.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService),
    Binding.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    ),
  ];
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    registerAuthenticationStrategy(app, JWTStrategy);
  }
}
