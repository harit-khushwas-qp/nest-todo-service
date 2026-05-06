import { UnauthorizedException } from '@nestjs/common'
import { JwtAuthGuard } from './jwt-auth.guard'

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  const mockAuthService = {
    verifyToken: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    guard = new JwtAuthGuard(mockAuthService as any)
  })

  it('should allow access when authorization header is valid', () => {
    const request: any = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    }
    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
    }

    mockAuthService.verifyToken.mockReturnValue({
      sub: 1,
      username: 'testuser',
      name: 'Test User',
    })

    expect(guard.canActivate(context)).toBe(true)
    expect(request.user).toEqual({
      userId: 1,
      username: 'testuser',
      name: 'Test User',
    })
    expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token')
  })

  it('should throw if authorization header is missing', () => {
    const request = { headers: {} }
    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
    }

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should throw if authorization header is invalid format', () => {
    const request = {
      headers: {
        authorization: 'InvalidHeader',
      },
    }
    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
    }

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should throw if token verification fails', () => {
    const request = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    }
    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
    }

    mockAuthService.verifyToken.mockImplementation(() => {
      throw new UnauthorizedException('Invalid token')
    })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should handle whitespace in authorization header', () => {
    const request: any = {
      headers: {
        authorization: 'Bearer   token-with-spaces  ',
      },
    }
    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
    }

    mockAuthService.verifyToken.mockReturnValue({
      sub: 2,
      username: 'admin',
      name: 'Admin User',
    })

    expect(guard.canActivate(context)).toBe(true)
    expect(request.user).toEqual({
      userId: 2,
      username: 'admin',
      name: 'Admin User',
    })
  })

  it('should accept case-sensitive Bearer prefix', () => {
    const request = {
      headers: {
        authorization: 'Bearer token123',
      },
    }
    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
    }

    mockAuthService.verifyToken.mockReturnValue({
      sub: 3,
      username: 'user3',
      name: 'User Three',
    })

    expect(guard.canActivate(context)).toBe(true)
    expect(mockAuthService.verifyToken).toHaveBeenCalledWith('token123')
  })
})
