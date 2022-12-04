import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ProjectUser, ProjectUserRelations} from '../models';

export class ProjectUserRepository extends DefaultCrudRepository<
  ProjectUser,
  typeof ProjectUser.prototype.id,
  ProjectUserRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ProjectUser, dataSource);
  }
}
