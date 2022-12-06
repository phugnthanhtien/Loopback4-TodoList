import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Task, User} from '../models';
import {TaskRepository} from '../repositories';

@authenticate('jwt')
export class TaskUserController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {}
  @get('/tasks/{id}/assign', {
    responses: {
      '200': {
        description: 'User belonging to Task',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getAssignee(
    @param.path.string('id') id: typeof Task.prototype.id,
  ): Promise<User> {
    return this.taskRepository.assignee(id);
  }
}
