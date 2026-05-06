export interface ITodo {
  id: number
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
  listId?: number
}
