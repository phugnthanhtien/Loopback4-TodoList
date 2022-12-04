import {Entity, model, property} from '@loopback/repository';
import { ERole } from '../enum';


@model({settings: {
  strictObjectIDCoercion: true
}})
export class ProjectUser extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'}
  })
  id?: string;

  @property({
    required: true,
    default: ERole.USER,
    jsonSchema: {
      enum: Object.values(ERole)
    }
  })
  role: ERole;

  constructor(data?: Partial<ProjectUser>) {
    super(data);
  }
}

export interface ProjectUserRelations {
  // describe navigational properties here
}

export type ProjectUserWithRelations = ProjectUser & ProjectUserRelations;
