import {HttpErrors} from '@loopback/rest';
import {Credentials} from './Credentials';
import { UserRepository } from '../repositories';

export async function validateCredentials(credentials: Credentials, userRepository: UserRepository) {
  const foundUser = await userRepository.findOne({
    where: {
      email: credentials.email
    }
  });
  if (foundUser !== null) {
    throw new HttpErrors.UnprocessableEntity('this email already exists');
  }
  const regEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (credentials.email.length < 8) {
    throw new HttpErrors.UnprocessableEntity('email length should be greater than 8 ');
  }
  if (!regEmail.test(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('email is not valid');
  }
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity("passwordd length should be greater than 8")
  }
}