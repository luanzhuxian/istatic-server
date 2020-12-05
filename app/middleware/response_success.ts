module.exports = () => {
    return async function(ctx, next) {
        try {
            const data = await next()
            if (data !== undefined && ctx.status === 200) {
                ctx.body = {
                    message: 'SUCCESS',
                    status: 200,
                    result: data
                }
            }
        } catch (e) {
            throw e
        }
    }
}
