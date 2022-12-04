import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Task, TaskRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class TaskRepository extends DefaultCrudRepository<
  Task,
  typeof Task.prototype.id,
  TaskRelations
> {

  public readonly taskUser: BelongsToAccessor<User, typeof Task.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Task, dataSource);
    this.taskUser = this.createBelongsToAccessorFor('taskUser', userRepositoryGetter,);
    this.registerInclusionResolver('taskUser', this.taskUser.inclusionResolver);
  }
}
