import {Entity, model, property} from '@loopback/repository';
import { ERole } from '../enum';


@model()
export class ProjectUser extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property.array(ERole, {
    required: true,
    default: ERole.USER
  })
  role: ERole[];

  constructor(data?: Partial<ProjectUser>) {
    super(data);
  }
}

export interface ProjectUserRelations {
  // describe navigational properties here
}

export type ProjectUserWithRelations = ProjectUser & ProjectUserRelations;
