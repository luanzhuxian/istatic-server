import { Service } from 'egg'

export default class User extends Service {
  async create (body) {
    console.log(body)
    return body
  }
}
