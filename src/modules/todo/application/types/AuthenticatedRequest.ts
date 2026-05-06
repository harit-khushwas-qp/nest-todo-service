import {Request} from 'express'

export interface IAuthenticatedRequest extends Request {
  user: {
    userId: number
    username: string
    name: string
  }
}
