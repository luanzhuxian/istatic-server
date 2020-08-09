import { Controller } from 'egg'

export default class UserController extends Controller {
    // 获取用户信息
    index(ctx) {
    // ctx.rotateCsrfSecret()
        console.log(ctx.session)
        console.log(ctx.query)
        ctx.session.user = ctx.query
        const { pass } = ctx.query
        if (pass === '1') {
            // 登录成功
            ctx.status = 200
            return '登录成功'
        }
        if (pass === '2') {
            // 登录成功
            ctx.status = 401
            throw new Error('用户名或密码错误')
        }
    }
    // 创建用户（注册）
    async create(ctx) {
        const { body } = ctx.request
        const { addRule } = this.app.validator

        addRule('checkPassword', ({}, value) => {
            if (!value) return '请输入密码'
            if (body.password !== body.repeatPassword) return '两次密码必须一致'
            if (value.length > 16) return '密码长度不能大于16个字符'
            if (value.length < 6) return '密码长度不能少于6个字符'
        })
        addRule('checkAccount', ({}, value) => {
            if (!value) return '请输入注册账号'
            if (value.length > 100) return '账号长度不能大于100个字符'
            if (value.length < 5) return '账号长度不能少于5个字符'
        })
        addRule('checkNickname', ({}, value) => {
            if (!value) return '请输入昵称'
            if (value.length > 64) return '账号长度不能大于64个字符'
        })
        const rule = {
            account: {
                type: 'checkAccount'
            },
            password: {
                type: 'checkPassword'
            },
            repeatPassword: {
                type: 'checkPassword'
            },
            nickname: {
                type: 'checkNickname'
            }
        }

        try {
            ctx.validate(rule, body)
        } catch (e) {
            ctx.status = 422
            e.message = e.errors[0].message
            throw e
        }

        try {
            const body = await ctx.service.user.create(ctx.request.body)
            ctx.status = 200
            return body
        } catch (e) {
            ctx.status = 500
            throw e
        }
    }
}
