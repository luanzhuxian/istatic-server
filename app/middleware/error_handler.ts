module.exports = () => {
  return async function (ctx, next) {
    try {
      await next()
    } catch (e) {
      ctx.app.emit('error', e, ctx)
      const status = ctx.status || 500
      ctx.body = {
        message: e.message,
        status,
        result: null
      }
    }
  }
}
