import {authenticate} from '@loopback/authentication';
import {User} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import set from 'lodash/set';
import {ETaskStatus} from '../enum';
import {Task} from '../models';
import {TaskRepository} from '../repositories';

@authenticate('jwt')
export class TaskController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {}

  @get('/tasks/count')
  @response(200, {
    description: 'Task model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Task) where?: Where<Task>): Promise<Count> {
    return this.taskRepository.count(where);
  }

  // @get('/tasks')
  // @response(200, {
  //   description: 'Array of Task model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(Task, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @inject(SecurityBindings.USER)
  //   currentUserProfile: User,
  //   @param.filter(Task) filter?: Filter<Task>,
  // ): Promise<Task[]> {
  //   return this.taskRepository.find(filter);
  // }

  // @patch('/tasks')
  // @response(200, {
  //   description: 'Task PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Task, {partial: true}),
  //       },
  //     },
  //   })
  //   task: Task,
  //   @param.where(Task) where?: Where<Task>,
  // ): Promise<Count> {
  //   return this.taskRepository.updateAll(task, where);
  // }

  @get('/tasks/{id}')
  @response(200, {
    description: 'Task model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Task, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Task, {exclude: 'where'}) filter?: FilterExcludingWhere<Task>,
  ): Promise<Task> {
    return this.taskRepository.findById(id, filter);
  }

  @patch('/tasks/{id}')
  @response(204, {
    description: 'Task PATCH success',
  })
  async updateById(
    @inject(SecurityBindings.USER)
    currentUserProfile: User,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Task,
  ): Promise<void> {
    const userId: string = currentUserProfile?.id;
    set(task, 'updatedBy', userId);
    set(task, 'updatedAt', new Date());
    if (task?.status === ETaskStatus.DONE) {
      set(task, 'doneTime', new Date());
    }
    await this.taskRepository.updateById(id, task);
  }

  @put('/tasks/{id}')
  @response(204, {
    description: 'Task PUT success',
  })
  async replaceById(
    @inject(SecurityBindings.USER)
    currentUserProfile: User,
    @param.path.string('id') id: string,
    @requestBody() task: Task,
  ): Promise<void> {
    const userId: string = currentUserProfile?.id;
    set(task, 'createdBy', userId);
    set(task, 'updatedBy', userId);
    set(task, 'updatedAt', new Date());
    await this.taskRepository.replaceById(id, task);
  }

  @del('/tasks/{id}')
  @response(204, {
    description: 'Task DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.taskRepository.deleteById(id);
  }
}
