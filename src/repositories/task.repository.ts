import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Project, Task, TaskRelations, User} from '../models';
import {ProjectRepository} from './project.repository';
import {UserRepository} from './user.repository';

export class TaskRepository extends DefaultCrudRepository<
  Task,
  typeof Task.prototype.id,
  TaskRelations
> {
  public readonly taskUser: BelongsToAccessor<User, typeof Task.prototype.id>;

  public readonly creator: BelongsToAccessor<User, typeof Task.prototype.id>;

  public readonly project: BelongsToAccessor<Project, typeof Task.prototype.id>;

  public readonly assignee: BelongsToAccessor<User, typeof Task.prototype.id>;

  public readonly linked: BelongsToAccessor<Task, typeof Task.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('ProjectRepository')
    protected projectRepositoryGetter: Getter<ProjectRepository>,
    @repository.getter('TaskRepository')
    protected taskRepositoryGetter: Getter<TaskRepository>,
  ) {
    super(Task, dataSource);
    this.linked = this.createBelongsToAccessorFor(
      'linked',
      taskRepositoryGetter,
    );
    this.registerInclusionResolver('linked', this.linked.inclusionResolver);
    this.assignee = this.createBelongsToAccessorFor(
      'assignee',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('assignee', this.assignee.inclusionResolver);
    this.project = this.createBelongsToAccessorFor(
      'project',
      projectRepositoryGetter,
    );
    this.registerInclusionResolver('project', this.project.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor(
      'creator',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
  }
}
