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

const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const TasksController = () => import('#controllers/tasks_controller')

router
  .group(() => {
    router.get('/login', [AuthController, 'showLogin']).as('auth.showLogin')
    router.post('/login', [AuthController, 'login']).as('auth.login')
  })
  .middleware([middleware.guest()])

router.post('/logout', [AuthController, 'logout']).middleware([middleware.auth()]).as('auth.logout')

router
  .group(() => {
    router.get('/', [HomeController, 'index']).as('home')
    router.get('/tasks', [TasksController, 'index']).as('tasks.index')
    router.get('/tasks/create', [TasksController, 'create']).as('tasks.create')
    router.post('/tasks', [TasksController, 'store']).as('tasks.store')
    router.get('/tasks/:id/edit', [TasksController, 'edit']).as('tasks.edit')
    router.put('/tasks/:id', [TasksController, 'update']).as('tasks.update')
    router.get('/tasks/:id', [TasksController, 'show']).as('tasks.show')
  })
  .middleware([middleware.auth()])
