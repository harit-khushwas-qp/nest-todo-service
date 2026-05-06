import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {AuthService} from '../services/auth.service'
import {LoginDto} from '../dtos/LoginDto'
import {IAuthenticatedRequest} from '@modules/todo/application/types/AuthenticatedRequest'
import {JwtAuthGuard} from '../guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT token',
  })
  @ApiBody({type: LoginDto})
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
  })
  @ApiResponse({status: 401, description: 'Invalid credentials'})
  @ApiResponse({status: 400, description: 'Bad request'})
  async login(@Body() loginDto: LoginDto): Promise<{
    accessToken: string
    user: {id: number; username: string; name: string}
  }> {
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate token',
  })
  @ApiResponse({status: 200, description: 'Logout successful'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async logout(
    @Req() request: IAuthenticatedRequest,
  ): Promise<{message: string}> {
    const authHeader = request.headers?.authorization || ''
    const token = authHeader.replace('Bearer ', '').trim()
    return this.authService.logout(token)
  }
}
