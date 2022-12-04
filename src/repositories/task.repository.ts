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
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Task, dataSource);
  }
}
