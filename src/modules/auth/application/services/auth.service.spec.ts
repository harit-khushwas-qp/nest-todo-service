import {Test, TestingModule} from '@nestjs/testing'
import {UnauthorizedException} from '@nestjs/common'

import {AuthService} from './auth.service'
import {UserRepository} from '../../domain/repositories/UserRepository'

describe('AuthService', () => {
  let service: AuthService

  const mockUserRepository = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)

    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    mockUserRepository.findByUsername.mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'password123',
      name: 'Administrator',
    })

    const result = await service.login({
      username: 'admin',
      password: 'password123',
    })

    expect(result).toHaveProperty('accessToken')

    expect(result.user).toEqual({
      id: 1,
      username: 'admin',
      name: 'Administrator',
    })
  })

  it('should throw UnauthorizedException for invalid username', async () => {
    mockUserRepository.findByUsername.mockResolvedValue(null)

    await expect(
      service.login({
        username: 'bad',
        password: 'bad',
      }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException for invalid password', async () => {
    mockUserRepository.findByUsername.mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'password123',
      name: 'Administrator',
    })

    await expect(
      service.login({
        username: 'admin',
        password: 'wrong',
      }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should verify and decode a valid token', async () => {
    mockUserRepository.findByUsername.mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'password123',
      name: 'Administrator',
    })

    const {accessToken} = await service.login({
      username: 'admin',
      password: 'password123',
    })

    const payload = service.verifyToken(accessToken)

    expect(payload).toEqual({
      sub: 1,
      username: 'admin',
      name: 'Administrator',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })
  })

  it('should blacklist a token on logout', () => {
    const token = 'test-token'

    const logoutResponse = service.logout(token)

    expect(logoutResponse).toEqual({
      message: 'Successfully logged out',
    })

    expect(() => service.verifyToken(token)).toThrow(UnauthorizedException)
  })

  it('should save default users when missing', async () => {
    mockUserRepository.findByUsername.mockResolvedValue(null)

    mockUserRepository.save.mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'password123',
      name: 'Administrator',
    })

    await service.onModuleInit()

    expect(mockUserRepository.save).toHaveBeenCalledTimes(2)
  })
})
