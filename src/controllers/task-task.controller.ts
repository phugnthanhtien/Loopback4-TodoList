import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Task} from '../models';
import {TaskRepository} from '../repositories';

@authenticate('jwt')
export class TaskTaskController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {}

  @get('/tasks/{id}/task', {
    responses: {
      '200': {
        description: 'Task belonging to Task',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Task)},
          },
        },
      },
    },
  })
  async getTask(
    @param.path.string('id') id: typeof Task.prototype.id,
  ): Promise<Task> {
    return this.taskRepository.linked(id);
  }
}
