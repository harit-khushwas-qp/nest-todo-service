import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'

@Entity({
  name: 'todo', // table name in the database
})
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({length: 256, type: 'varchar', nullable: false})
  title!: string
}
