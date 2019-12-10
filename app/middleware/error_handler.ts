module.exports = () => {
  return async function (ctx, next) {
    try {
      await next()
    } catch (e) {
      const status = ctx.status
      switch (status) {
        case 422:
          e.devMessage = e.errors
          e.message = '参数校验失败'
          break
        case 405:
          e.devMessage = e.message
          e.message = 'Method Not Allowed'
          break
        case 500:
          e.devMessage = e.message
          e.message = '运行时异常'
          break
        default:
          e.devMessage = e.message
          e.message = '未知错误'
      }
      ctx.body = {
        devMessage: e.devMessage || '',
        message: e.message,
        result: null
      }
    }
  }
}
