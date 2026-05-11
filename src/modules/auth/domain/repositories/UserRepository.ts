import {DataSource, Repository} from 'typeorm'
import {UserEntity} from '../entities/UserEntity'
import {Inject, Injectable} from '@nestjs/common'

export const USER_TABLE = 'users'

export const USER_COLUMNS = {
  id: 'id',
  username: 'username',
  password: 'password',
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const

export const userRepositoryProvider = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource): Repository<UserEntity> =>
      dataSource.getRepository(UserEntity),
    inject: ['DATA_SOURCE'],
  },
]

@Injectable()
export class UserRepository {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({where: {username}})
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({where: {id}})
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user)
  }
}
