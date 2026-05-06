import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from '../services/auth.service'

describe('AuthController', () => {
  let controller: AuthController
  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    jest.clearAllMocks()
  })

  it('should login and return token payload', async () => {
    const expected = {
      accessToken: 'token',
      user: { id: 1, username: 'admin', name: 'Administrator' },
    }
    mockAuthService.login.mockResolvedValue(expected)

    const result = await controller.login({
      username: 'admin',
      password: 'password123',
    })

    expect(result).toEqual(expected)
    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'password123',
    })
  })

  it('should logout and return a success message', async () => {
    mockAuthService.logout.mockResolvedValue({ message: 'Successfully logged out' })

    const result = await controller.logout({ headers: { authorization: 'Bearer token' } })

    expect(result).toEqual({ message: 'Successfully logged out' })
    expect(mockAuthService.logout).toHaveBeenCalledWith('token')
  })
})
