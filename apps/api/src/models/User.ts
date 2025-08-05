export interface IUser {
  id: string
  name: string
  email: string
  password?: string
  passwordHash: string
  createdAt: Date
}
