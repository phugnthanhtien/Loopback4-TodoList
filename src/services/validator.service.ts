import {HttpErrors} from '@loopback/rest';
import * as isEmail from 'isemail';
import {Task} from '../models';
import {
  ProjectUserRepository,
  TaskRepository,
  UserRepository,
} from '../repositories';
import {Credentials} from '../repositories/index';

export async function validateCredentials(
  credentials: Credentials,
  userRepository: UserRepository,
) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid Email');
  }
  const foundUser = await userRepository.findOne({
    where: {
      email: credentials.email,
    },
  });
  if (foundUser) {
    throw new HttpErrors.NotFound('Email already exists');
  }
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8',
    );
  }
}
export async function getProjectUser(
  userId: string,
  projectId: string,
  projectUserRepository: ProjectUserRepository,
) {
  const projectUser = await projectUserRepository.find({
    where: {userId, projectId},
  });
  if (projectUser.length == 0) {
    throw new HttpErrors.Unauthorized('You do not in this project');
  }
  return projectUser;
}

export async function verifyTaskId(
  task: Task,
  taskRepository: TaskRepository,
  projectId: string,
) {
  const foundedLinkedTask = await taskRepository.findById(task.linkedTo);
  if (foundedLinkedTask.projectId === projectId) {
    throw new HttpErrors.Unauthorized(
      'The task is linked to must be at the same project',
    );
  }
}

export async function verifyUserId(
  task: Task,
  userRepository: UserRepository,
  userId: string,
  projectId: string,
  projectUserRepository: ProjectUserRepository,
) {
  const foundedProjectUser = await projectUserRepository.find({
    where: {
      userId,
      projectId,
    },
  });
  const foundedUser = await userRepository.findById(task.assignedTo);
  if (!foundedUser) {
    throw new HttpErrors.NotFound('User assigned to is no valid');
  }
  // if (
  //   !(await projectUserRepository.find({
  //     where: {
  //       userId: task.assignedTo,
  //       projectId: projectId,
  //     },
  //   }))
  // ) {
  //   throw new HttpErrors.NotFound('User assigned must be in this project');
  // }
}
