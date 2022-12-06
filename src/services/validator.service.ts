import {HttpErrors} from '@loopback/rest';
import * as isEmail from 'isemail';
import {UserRepository} from '../repositories';
import {Credentials} from '../repositories/index';

export async function validateCredentials(
  credentials: Credentials,
  userRepository: UserRepository,
) {
  const foundUser = await userRepository.findOne({
    where: {
      email: credentials.email,
    },
  });
  if (!foundUser) {
    throw new HttpErrors.NotFound('User does not exist');
  }
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid Email');
  }
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8',
    );
  }
}
