export class LoginResponseUserDto {
  id!: number
  username!: string
  name!: string
}

export class LoginResponseDto {
  accessToken!: string
  user!: LoginResponseUserDto
}
