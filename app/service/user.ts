import { Service } from 'egg'

export default class UserService extends Service {
    async create(body) {
        console.log(body)
        return body
    }
}
