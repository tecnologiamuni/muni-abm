export type Rol = "root" | "admin" | "manager"

export interface Usuario {
  id: number
  username: string
  role: Rol
}
