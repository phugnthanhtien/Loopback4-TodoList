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
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import {ERole} from '../enum';
import {Project, Task} from '../models';
import {
  ProjectRepository,
  ProjectUserRepository,
  TaskRepository,
} from '../repositories';

@authenticate('jwt')
export class ProjectTaskController {
  constructor(
    @repository(ProjectRepository)
    protected projectRepository: ProjectRepository,

    @repository(ProjectUserRepository)
    protected projectUserRepository: ProjectUserRepository,

    @repository(TaskRepository)
    protected taskRepository: TaskRepository,
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
    const projectUser = this.projectUserRepository.find({
      where: {userId: {like: userId}, projectId: {like: id}},
    });
    const userRole = (await projectUser)[0].role;
    if (userRole == ERole.ADMIN)
      return this.taskRepository.find({
        where: {projectId: {like: id}},
      });
    else
      return this.taskRepository.find({
        where: {projectId: {like: id}, isCreatedByAdmin: {like: false}},
      });
  }

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
    @param.path.string('id') id: typeof Project.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTaskInProject',
            exclude: ['id'],
            optional: ['projectId'],
          }),
        },
      },
    })
    task: Omit<Task, 'id'>,
  ): Promise<Task> {
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
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Partial<Task>,
    @param.query.object('where', getWhereSchemaFor(Task)) where?: Where<Task>,
  ): Promise<Count> {
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
