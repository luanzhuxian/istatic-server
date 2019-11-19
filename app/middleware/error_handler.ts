module.exports = () => {
  return async function (ctx, next) {
    try {
      await next()
    } catch (e) {
      ctx.app.emit('error', e, ctx)
      const status = ctx.status = ctx.status || 500
      if (status === 403) {
        e.message = '无效的参数'
        e.devMessage = e.errors
      }
      ctx.body = {
        devMessage: e.devMessage || '',
        message: e.message,
        status,
        result: null
      }
    }
  }
}
