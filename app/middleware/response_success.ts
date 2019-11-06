module.exports = () => {
  return async function (ctx, next) {
    const data = await next()
    if (ctx.status === 200) {
      ctx.body = {
        message: 'SUCCESS',
        status: 200,
        result: data
      }
    }
  }
}
