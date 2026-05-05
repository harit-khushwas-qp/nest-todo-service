import {Inject, Injectable} from '@nestjs/common'
import {DataSource, EntityTarget, ObjectLiteral, Repository} from 'typeorm'

@Injectable()
export class RepositoryService {
  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
    @Inject('ANOTHER_DATA_SOURCE')
    private readonly anotherDataSource: DataSource,
  ) {}

  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    resultSource: 'DATA_SOURCE' | 'ANOTHER_DATA_SOURCE',
  ): Repository<T> {
    if (resultSource === 'DATA_SOURCE') {
      return this.dataSource.getRepository(entity)
    } else {
      return this.anotherDataSource.getRepository(entity)
    }
  }
}
