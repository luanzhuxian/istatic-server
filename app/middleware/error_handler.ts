module.exports = () => {
    return async function(ctx, next) {
        try {
            await next()
        } catch (e) {
            const status = ctx.status
            switch (status) {
                case 422:
                    e.devMessage = e.errors
                    break
                case 405:
                    e.devMessage = e.message
                    e.message = 'Method Not Allowed'
                    break
                case 409:
                    e.devMessage = e.message
                    e.message = '文件名重复'
                    break
                case 401:
                    break
                case 403:
                    break
                case 400:
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
