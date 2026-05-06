import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { TodoEntity } from '@modules/todo/domain/entities/TodoEntity'

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'username', type: 'varchar', length: 64, unique: true, nullable: false })
  username!: string

  @Column({ name: 'password', type: 'varchar', length: 256, nullable: false })
  password!: string

  @Column({ name: 'name', type: 'varchar', length: 128, nullable: false })
  name!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => TodoEntity, (todo) => todo.user)
  todos?: TodoEntity[]
}
