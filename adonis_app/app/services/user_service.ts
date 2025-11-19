import User from '#models/user'
import { UserRole } from '#types/domain'

export type UserFilters = {
  search?: string
  role?: UserRole
}

export type UserListMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export type UserListResult = {
  users: User[]
  meta: UserListMeta
}

export default class UserService {
  public async list(
    filters: UserFilters = {},
    pagination: { page?: number; perPage?: number } = {}
  ): Promise<UserListResult> {
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1
    const perPage = pagination.perPage && pagination.perPage > 0 ? pagination.perPage : 10

    const query = User.query().orderBy('created_at', 'desc')

    if (filters.role) {
      query.where('role', filters.role)
    }

    if (filters.search) {
      query.where((builder) => {
        builder
          .whereILike('name', `%${filters.search}%`)
          .orWhereILike('email', `%${filters.search}%`)
      })
    }

    const paginator = await query.paginate(page, perPage)
    const meta = paginator.getMeta()

    return {
      users: paginator.all(),
      meta: {
        total: meta.total,
        perPage: meta.perPage,
        currentPage: meta.currentPage,
        lastPage: meta.lastPage,
      },
    }
  }

  public async findById(id: string): Promise<User | null> {
    return User.find(id)
  }

  public async create(payload: Partial<User>): Promise<User> {
    return User.create(payload)
  }

  public async update(user: User, payload: Partial<User>): Promise<User> {
    user.merge(payload)
    await user.save()
    return user
  }

  public async delete(user: User): Promise<void> {
    await user.delete()
  }
}
