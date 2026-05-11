export class TodoResponseDto {
  id!: number
  title!: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}
