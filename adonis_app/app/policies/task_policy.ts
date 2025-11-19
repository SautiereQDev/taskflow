import User from '#models/user'
import Task from '#models/task'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class TaskPolicy extends BasePolicy {
  /**
   * Every logged-in user can create a task
   */
  public create(user: User): AuthorizerResponse {
    return true
  }

  /**
   * Only the creator or the assignee can view the task
   */
  public view(user: User, task: Task): AuthorizerResponse {
    return user.id === task.creatorId || user.id === task.assigneeId
  }

  /**
   * Only the creator or the assignee can edit the task
   */
  public edit(user: User, task: Task): AuthorizerResponse {
    return user.id === task.creatorId || user.id === task.assigneeId
  }

  /**
   * Only the creator can delete the task (assuming this rule, or maybe assignee too?)
   * For now, let's say same as edit.
   */
  public delete(user: User, task: Task): AuthorizerResponse {
    return user.id === task.creatorId
  }
}
