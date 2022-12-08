import {authenticate} from '@loopback/authentication';
import {User, UserRepository} from '@loopback/authentication-jwt';
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
import {ERole} from '../enum';
import {ProjectUser} from '../models';
import {ProjectRepository, ProjectUserRepository} from '../repositories';
import {getProjectUser} from '../services';

@authenticate('jwt')
export class ProjectProjectUserController {
  constructor(
    @repository(ProjectRepository)
    protected projectRepository: ProjectRepository,

    @repository(ProjectUserRepository)
    protected projectUserRepository: ProjectUserRepository,

    @repository(UserRepository)
    protected userRepository: UserRepository,
  ) {}

  @get('/projects/{id}/project-users', {
    responses: {
      '200': {
        description: 'Array of Project has many ProjectUser',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProjectUser)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ProjectUser>,
  ): Promise<ProjectUser[]> {
    return this.projectRepository.projectUsers(id).find(filter);
  }

  @post('/projects/{id}/project-users', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(ProjectUser)}},
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
          schema: getModelSchemaRef(ProjectUser, {
            title: 'AssignToProject',
            exclude: ['id', 'projectId'],
            optional: ['projectId'],
          }),
        },
      },
    })
    projectUser: Omit<ProjectUser, 'id'>,
  ): Promise<ProjectUser> {
    const userId: string = currentUserProfile?.id;

    //check userId is valid
    await this.userRepository.findById(projectUser?.userId);

    const projectUserCard = await getProjectUser(
      userId,
      id,
      this.projectUserRepository,
    );

    if (projectUserCard?.role !== ERole.ADMIN) {
      throw new HttpErrors.Unauthorized('You must be admin to do this');
    }
    projectUser.role = projectUser.role ? projectUser.role : ERole.USER;
    return this.projectRepository.projectUsers(id).create(projectUser);
  }

  @patch('/projects/{id}/project-users', {
    responses: {
      '200': {
        description: 'Project.ProjectUser PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProjectUser, {partial: true}),
        },
      },
    })
    projectUser: Partial<ProjectUser>,
    @param.query.object('where', getWhereSchemaFor(ProjectUser))
    where?: Where<ProjectUser>,
  ): Promise<Count> {
    return this.projectRepository.projectUsers(id).patch(projectUser, where);
  }

  @del('/projects/{id}/project-users', {
    responses: {
      '200': {
        description: 'Project.ProjectUser DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ProjectUser))
    where?: Where<ProjectUser>,
  ): Promise<Count> {
    return this.projectRepository.projectUsers(id).delete(where);
  }
}
