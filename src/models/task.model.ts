import {belongsTo, Entity, model, property} from '@loopback/repository';
import {ETaskStatus} from '../enum';
import {Project} from './project.model';
import {User} from './user.model';

@model({
  settings: {
    strictObjectIDCoercion: true,
  },
})
export class Task extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'boolean',
  })
  isCreatedByAdmin: boolean;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: string;

  @property({
    default: ETaskStatus.TODO,
    jsonSchema: {
      enum: Object.values(ETaskStatus),
    },
  })
  status?: ETaskStatus;

  @belongsTo(() => User, {name: 'creator'})
  createdBy: string;

  @belongsTo(() => User, {name: 'updater'})
  updatedBy: string;

  @belongsTo(() => Project)
  projectId: string;

  @belongsTo(() => User, {name: 'assignee'})
  assignedTo: string;

  @belongsTo(() => Task, {name: 'linked'})
  linkedTo: string;

  constructor(data?: Partial<Task>) {
    super(data);
  }
}

export interface TaskRelations {
  // describe navigational properties here
}

export type TaskWithRelations = Task & TaskRelations;
