# hackernews-async-ts

[Hacker News](https://news.ycombinator.com/) showcase using typescript && egg

## QuickStart

创建数据库 istatic
执行 database/init.sql：
- windows：mysql -u username -p password -D istatic < sql文件路径
启动 mysql
启动 redis：在redis目录下，在命令窗口执行：
mac：/usr/local/redis-5.0.7/src，redis-server
windows：redis-server.exe redis.windows.conf

### 本地开发环境启动

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

Don't tsc compile at development mode, if you had run `tsc` then you need to `npm run clean` before `npm run dev`.

### 生产环境启动

```bash
$ npm run tsc
$ npm start
```

### Npm Scripts

- Use `npm run lint` to check code style
- Use `npm test` to run unit test
- se `npm run clean` to clean compiled js at development mode once

### Requirement

- Node.js 8.x
- Typescript 2.8+
