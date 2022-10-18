## typeORM 0.3.x version => EntityRepository : deprecated
  typeORM 0.3.x ver 이후로 EntityRepository가 deprecated 되었다.
  아래서 설명하는 개념은 기존의 EntityRepository를 사용하는 것과 비슷한 방법을 제시한다.
  간단하게 말하자면 직접 decorator를 생성하고, decorator가 적용된 repository를 받아줄 모듈을 사용하는 방법이다.
  
1. @CustomRepository decorator를 생성한다.
```typescript
import { SetMetadata } from "@nestjs/common";

export const TYPEORM_EX_CUSTOM_REPOSITORY = "TYPEORM_EX_CUSTOM_REPOSITORY";

export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}
```
* @CustomRepository decorator를 생성해준다.
* SetMetadata() 메서드를 이용하여 전달받은 entity를 TYPEORM_EX_CUSTOM_REPOSITORY 메타데이터에 지정해준다.

2. TypeOrmExModule 생성
```typescript
import { DynamicModule, Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TYPEORM_EX_CUSTOM_REPOSITORY } from './user.custom-decorator';

export class TypeOrmExModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(
    repositories: T[]
  ): DynamicModule {
    const providers: Provider[] = [];

    for (const repository of repositories) {
      const entity = Reflect.getMetadata(
        TYPEORM_EX_CUSTOM_REPOSITORY,
        repository
      );

      if (!entity) {
        continue;
      }

      providers.push({
        inject: [getDataSourceToken()],
        provide: repository,
        useFactory: (dataSource: DataSource): typeof repository => {
          const baseRepository = dataSource.getRepository<any>(entity);
          return new repository(
            baseRepository.target,
            baseRepository.manager,
            baseRepository.queryRunner
          );
        },
      });
    }

    return {
      exports: providers,
      module: TypeOrmExModule,
      providers,
    };
  }
}
```
* @CustomRepository decorator가 적용된 Repository를 받아줄 모듈이다.
* Reflect.getMetadata() 메서드로 메타데이터 키값인 TPYEORM_EX_CUSTOM_REPOSITORY에 해당되는 엔티티를 가져온다.
* 메타데이터 키값에 해당하는 엔티티가 존재하는 경우 Factory를 이용하여 provider를 동적으로 생성하여 providers에 추가한다.

3. 데코레이터 적용
```typescript
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CustomRepository } from './user.custom-decorator';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  ...
}
```
* @CustomRepository decorator를 기존에 사용하던 @EntityRepository decorator 적용하는 부분에 대체하여 사용한다.

4. Module 설정
```typescript
@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository]),
  ],
  ...
})
```
* 전에 생성한 모듈을 추가해준다.

5. Service에서 사용
```typescript
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}
  ...
}
```
* 기존 @EntityRepository를 사용한 경우 @InjectRepository 를 사용했지만 해당 부분을 유지하면 오류가 발생한다.
* 따라서 @CustomRepository를 생성하여 사용하는 경우 @InjectRepository를 제거하고 사용하자.
