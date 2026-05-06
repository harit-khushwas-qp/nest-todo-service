import {ExecutionContext, UnauthorizedException} from '@nestjs/common'
import {JwtAuthGuard} from './jwt-auth.guard'
import {IAuthenticatedRequest} from '@modules/todo/application/types/AuthenticatedRequest'
import {HttpArgumentsHost} from '@nestjs/common/interfaces'

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  const mockAuthService = {
    verifyToken: jest.fn(),
  }

  const createMockContext = (
    request: Partial<IAuthenticatedRequest>,
  ): ExecutionContext => {
    const mockHttpArgumentsHost: HttpArgumentsHost = {
      getRequest: <T = IAuthenticatedRequest>() => request as T,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }
    return {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ExecutionContext
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    guard = new JwtAuthGuard(mockAuthService as any)
  })

  it('should allow access when authorization header is valid', () => {
    const request: Partial<IAuthenticatedRequest> = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    }
    const context = createMockContext(request)

    mockAuthService.verifyToken.mockReturnValue({
      sub: 1,
      username: 'testuser',
      name: 'Test User',
    })

    expect(guard.canActivate(context)).toBe(true)
    expect((request as Partial<IAuthenticatedRequest>).user).toEqual({
      userId: 1,
      username: 'testuser',
      name: 'Test User',
    })
    expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token')
  })

  it('should throw if authorization header is missing', () => {
    const request: Partial<IAuthenticatedRequest> = {headers: {}}
    const context = createMockContext(request)

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should throw if authorization header is invalid format', () => {
    const request: Partial<IAuthenticatedRequest> = {
      headers: {
        authorization: 'InvalidHeader',
      },
    }
    const context = createMockContext(request)

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should throw if token verification fails', () => {
    const request: Partial<IAuthenticatedRequest> = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    }
    const context = createMockContext(request)

    mockAuthService.verifyToken.mockImplementation(() => {
      throw new UnauthorizedException('Invalid token')
    })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should handle whitespace in authorization header', () => {
    const request: Partial<IAuthenticatedRequest> = {
      headers: {
        authorization: 'Bearer   token-with-spaces  ',
      },
    }
    const context = createMockContext(request)

    mockAuthService.verifyToken.mockReturnValue({
      sub: 2,
      username: 'admin',
      name: 'Admin User',
    })

    expect(guard.canActivate(context)).toBe(true)
    expect((request as Partial<IAuthenticatedRequest>).user).toEqual({
      userId: 2,
      username: 'admin',
      name: 'Admin User',
    })
  })

  it('should accept case-sensitive Bearer prefix', () => {
    const request: Partial<IAuthenticatedRequest> = {
      headers: {
        authorization: 'Bearer token123',
      },
    }
    const context = createMockContext(request)

    mockAuthService.verifyToken.mockReturnValue({
      sub: 3,
      username: 'user3',
      name: 'User Three',
    })

    expect(guard.canActivate(context as ExecutionContext)).toBe(true)
    expect(mockAuthService.verifyToken).toHaveBeenCalledWith('token123')
  })
})
