import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import {UserEntity} from '@modules/auth/domain/entities/UserEntity'

@Entity({
  name: 'todo',
})
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({length: 256, type: 'varchar', nullable: false})
  title!: string

  @Column({length: 1024, type: 'varchar', nullable: true})
  description?: string

  @Column({type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium'})
  priority!: 'low' | 'medium' | 'high'

  @Column({type: 'boolean', default: false})
  completed!: boolean

  @Column({name: 'list_id', type: 'int', nullable: true})
  listId?: number

  @Column({name: 'user_id', type: 'int'})
  userId!: number

  @ManyToOne(() => UserEntity, user => user.todos, {nullable: false})
  @JoinColumn({name: 'user_id'})
  user!: UserEntity
}
