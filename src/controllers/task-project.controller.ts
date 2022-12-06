import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Project, Task} from '../models';
import {TaskRepository} from '../repositories';

@authenticate('jwt')
export class TaskProjectController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {}

  @get('/tasks/{id}/project', {
    responses: {
      '200': {
        description: 'Project belonging to Task',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Project)},
          },
        },
      },
    },
  })
  async getProject(
    @param.path.string('id') id: typeof Task.prototype.id,
  ): Promise<Project> {
    return this.taskRepository.project(id);
  }
}
