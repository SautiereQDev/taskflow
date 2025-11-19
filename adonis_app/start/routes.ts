/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { loginThrottle, taskMutationsThrottle } from '#start/limiter'
import { healthChecks } from '#start/health'

const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const TasksController = () => import('#controllers/tasks_controller')
const UsersController = () => import('#controllers/users_controller')
const LocaleController = () => import('#controllers/locale_controller')
const DiagnosticController = () => import('#controllers/diagnostic_controller')

router.get('/health', async ({ response }) => {
  const report = await healthChecks.run()
  return report.isHealthy ? response.ok(report) : response.serviceUnavailable(report)
})

router.post('/locale', [LocaleController, 'update']).as('locale.update')

router
  .group(() => {
    router.get('/login', [AuthController, 'showLogin']).as('auth.showLogin')
    router.post('/login', [AuthController, 'login']).use(loginThrottle).as('auth.login')
  })
  .middleware([middleware.guest()])

router.post('/logout', [AuthController, 'logout']).middleware([middleware.auth()]).as('auth.logout')

router
  .group(() => {
    router.get('/', [HomeController, 'index']).as('home')

    router
      .get('/diagnostic', [DiagnosticController, 'index'])
      .middleware([middleware.admin()])
      .as('diagnostic.index')

    router
      .group(() => {
        router.get('/', [TasksController, 'index']).as('index')
        router.get('/create', [TasksController, 'create']).as('create')
        router.post('/', [TasksController, 'store']).use(taskMutationsThrottle).as('store')
        router.get('/:id/edit', [TasksController, 'edit']).as('edit')
        router.put('/:id', [TasksController, 'update']).use(taskMutationsThrottle).as('update')
        router.delete('/:id', [TasksController, 'destroy']).as('destroy')
        router
          .patch('/:id/toggle', [TasksController, 'toggle'])
          .use(taskMutationsThrottle)
          .as('toggle')
        router.get('/:id', [TasksController, 'show']).as('show')
      })
      .prefix('tasks')
      .as('tasks')

    router.resource('users', UsersController).except(['show'])
  })
  .middleware([middleware.auth()])
