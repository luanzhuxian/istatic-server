module.exports = () => {
  return async function (ctx, next) {
    await next()
    if (ctx.status === 404 && !ctx.body) {
      ctx.body = {
        message: 'not found',
        status: 404,
        result: null
      }
    }
  }
}
