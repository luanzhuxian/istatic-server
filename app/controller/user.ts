import { Controller } from 'egg'

export default class UserController extends Controller {
  // 获取用户信息
  index (ctx) {
    console.log(ctx.session)
    console.log(ctx.query)
    ctx.status = 200
    ctx.session.user = ctx.query
    return {
      csrfToken: ctx.session.csrfToken
    }
  }
  // 创建用户（注册）
  create (ctx) {
    console.log(ctx.session)
    ctx.status = 200
    return true
  }
}
