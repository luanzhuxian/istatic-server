module.exports = () => {
    return async function(ctx, next) {
        try {
            await next()
            if (ctx.status === 404 && !ctx.body) {
                ctx.status = 404
                ctx.body = {
                    message: 'not found',
                    status: 404,
                    result: null
                }
            }
        } catch (e) {
            throw e
        }
    }
}
