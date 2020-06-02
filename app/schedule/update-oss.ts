import egg = require('egg')
import OSS = require("ali-oss")
const Subscription = egg.Subscription
export default class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10m', // 10 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe () {
    // const { data } = await getSTS()
    // const { accessKeySecret, accessKeyId, securityToken } = data.result.credentials
    this.ctx.app.ossClient = new OSS({
      region: 'oss-cn-hangzhou',
      // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
      accessKeyId: 'LTAIDGIAtLNBANQ5',
      accessKeySecret: 'AnzFTZL25nddBhaJ4VqrLu9jrY5Hjk',
      bucket: 'penglai-weimall',
      // 是否使用https
      secure: false
    })
  }
}
