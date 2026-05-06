import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { LoginDto } from '../dtos/LoginDto'
import { User } from '../types/User'
import { UserRepository } from '../../domain/repositories/UserRepository'
import { UserEntity } from '../../domain/entities/UserEntity'

const JWT_SECRET = process.env.JWT_SECRET ?? 'default_jwt_secret'
const JWT_EXPIRATION = '2h'

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly blacklistedTokens = new Set<string>()

  constructor(private readonly userRepository: UserRepository) {}

  async onModuleInit() {
    await this.ensureDefaultUsers()
  }

  async ensureDefaultUsers() {
    const defaultUsers: User[] = [
      {
        id: 1,
        username: 'admin',
        password: 'password123',
        name: 'Administrator',
      },
      {
        id: 2,
        username: 'user',
        password: 'password',
        name: 'Demo User',
      },
    ]

    for (const defaultUser of defaultUsers) {
      const existingUser = await this.userRepository.findByUsername(defaultUser.username)
      if (!existingUser) {
        const userEntity = new UserEntity()
        userEntity.username = defaultUser.username
        userEntity.password = defaultUser.password
        userEntity.name = defaultUser.name
        await this.userRepository.save(userEntity)
      }
    }
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const userEntity = await this.userRepository.findByUsername(username)
    if (!userEntity || userEntity.password !== password) {
      return null
    }

    return {
      id: userEntity.id,
      username: userEntity.username,
      password: userEntity.password,
      name: userEntity.name,
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password)
    if (!user) {
      throw new UnauthorizedException('Invalid username or password')
    }

    const payload = {
      sub: user.id,
      username: user.username,
      name: user.name,
    }

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    })
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    }
  }

  logout(token: string) {
    if (!token) {
      throw new UnauthorizedException('Authorization token is required for logout')
    }
    this.blacklistedTokens.add(token)
    return { message: 'Successfully logged out' }
  }

  verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Authorization token not found')
    }

    if (this.blacklistedTokens.has(token)) {
      throw new UnauthorizedException('Token has been revoked')
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (typeof decoded === 'string' || !('sub' in decoded)) {
        throw new UnauthorizedException('Invalid or expired token')
      }
      return decoded as unknown as {
        sub: number
        username: string
        name: string
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
