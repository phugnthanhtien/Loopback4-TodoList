import {belongsTo, Entity, model, property} from '@loopback/repository';
import {ERole} from '../enum';
import {Project} from './project.model';
import {User} from './user.model';

@model({
  settings: {
    strictObjectIDCoercion: true,
  },
})
export class ProjectUser extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id?: string;

  @property({
    required: true,
    default: ERole.USER,
    jsonSchema: {
      enum: Object.values(ERole),
    },
  })
  role: ERole;

  @belongsTo(
    () => User,
    {keyTo: 'id'},
    {
      required: true,
    },
  )
  userId: string;

  @belongsTo(
    () => Project,
    {keyTo: 'id'},
    {
      required: true,
    },
  )
  projectId: string;

  constructor(data?: Partial<ProjectUser>) {
    super(data);
  }
}

export interface ProjectUserRelations {
  // describe navigational properties here
}

export type ProjectUserWithRelations = ProjectUser & ProjectUserRelations;
