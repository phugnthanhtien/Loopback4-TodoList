import {Entity, model, property} from '@loopback/repository';

@model({settings: {
  strictObjectIDCoercion: true
}})
export class Project extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'}
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'date',
    default: new Date()
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: new Date()
  })
  updatedAt?: string;


  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;
