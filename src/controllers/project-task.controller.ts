import {authenticate} from '@loopback/authentication';
import {User} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import set from 'lodash/set';
import {ERole, ETaskStatus} from '../enum';
import {Task} from '../models';
import {
  ProjectRepository,
  ProjectUserRepository,
  TaskRepository,
  UserRepository,
} from '../repositories';
import {getProjectUser, verifyTaskId, verifyUserId} from '../services';

@authenticate('jwt')
export class ProjectTaskController {
  constructor(
    @repository(ProjectRepository)
    protected projectRepository: ProjectRepository,

    @repository(ProjectUserRepository)
    protected projectUserRepository: ProjectUserRepository,

    @repository(TaskRepository)
    protected taskRepository: TaskRepository,

    @repository(UserRepository)
    protected userRepository: UserRepository,
  ) {}

  @get('/projects/{id}/tasks', {
    responses: {
      '200': {
        description: 'Array of Project has many Task',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Task)},
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER)
    currentUserProfile: User,
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Task>,
  ): Promise<Task[]> {
    const userId: string = currentUserProfile?.id;
    const projectUser = await this.projectUserRepository.findOne({
      where: {userId, projectId: id},
    });
    if (!projectUser) {
      throw new HttpErrors.NotFound('You do not in this project');
    }
    const userRole = projectUser?.role;
    if (userRole == ERole.ADMIN)
      return this.taskRepository.find({
        where: {projectId: id},
      });
    else
      return this.taskRepository.find({
        where: {projectId: id, isCreatedByAdmin: false},
      });
  }

  //create new Task
  @post('/projects/{id}/tasks', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(Task)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: User,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTaskInProject',
            exclude: [
              'id',
              'createdBy',
              'updatedBy',
              'projectId',
              'createdAt',
              'updatedAt',
              'status',
              'isCreatedByAdmin',
            ],
            optional: ['projectId'],
          }),
        },
      },
    })
    task: Omit<Task, 'id'>,
  ): Promise<Task> {
    const userId: string = currentUserProfile?.id;
    const projectUser = await getProjectUser(
      userId,
      id,
      this.projectUserRepository,
    );
    if (task.linkedTo) {
      await verifyTaskId(task, this.taskRepository, id);
    }
    let isCreatedByAdmin = projectUser?.role === ERole.ADMIN;
    if (task.assignedTo) {
      if (!isCreatedByAdmin) {
        throw new HttpErrors.NotFound('Just Admin can assign task');
      } else {
        await verifyUserId(
          task,
          this.userRepository,
          userId,
          id,
          this.projectUserRepository,
        );
      }
    }
    set(task, 'isCreatedByAdmin', isCreatedByAdmin);
    set(task, 'createdBy', userId);
    set(task, 'updatedBy', userId);
    set(task, 'updatedAt', new Date());
    set(task, 'status', ETaskStatus.TODO);

    return this.projectRepository.tasks(id).create(task);
  }

  @patch('/projects/{id}/tasks', {
    responses: {
      '200': {
        description: 'Project.Task PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(SecurityBindings.USER)
    currentUserProfile: User,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'Update task',
            exclude: [
              'id',
              'createdBy',
              'updatedBy',
              'projectId',
              'createdAt',
              'updatedAt',
              'isCreatedByAdmin',
            ],
          }),
        },
      },
    })
    task: Omit<Task, 'id'>,
    @param.query.object('where', getWhereSchemaFor(Task)) where?: Where<Task>,
  ): Promise<Count> {
    const userId: string = currentUserProfile?.id;
    const projectUser = await getProjectUser(
      userId,
      id,
      this.projectUserRepository,
    );
    if (task.linkedTo) {
      await verifyTaskId(task, this.taskRepository, id);
    }
    let isCreatedByAdmin = projectUser.role === ERole.ADMIN;
    if (task.assignedTo) {
      if (!isCreatedByAdmin) {
        throw new HttpErrors.NotFound('Just Admin can assign task');
      } else {
        await verifyUserId(
          task,
          this.userRepository,
          userId,
          id,
          this.projectUserRepository,
        );
      }
    }
    set(task, 'updatedBy', userId);
    set(task, 'updatedAt', new Date());
    set(task, 'status', ETaskStatus.TODO);
    return this.projectRepository.tasks(id).patch(task, where);
  }

  @del('/projects/{id}/tasks', {
    responses: {
      '200': {
        description: 'Project.Task DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Task)) where?: Where<Task>,
  ): Promise<Count> {
    return this.projectRepository.tasks(id).delete(where);
  }
}
