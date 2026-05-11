import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {AuthService} from '../services/AuthService'
import {LoginDto} from '../dtos/LoginDto'
import {LoginResponseDto} from '../dtos/LoginResponseDto'
import {JwtAuthGuard} from '@src/common/guards/JwtAuthGuard'
import {BearerToken} from '@src/common/decorators/BearerToken'

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
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate token',
  })
  async logout(@BearerToken() token: string): Promise<{message: string}> {
    return this.authService.logout(token)
  }
}
