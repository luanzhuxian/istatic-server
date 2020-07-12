/*
 * @Author: your name
 * @Date: 2020-07-11 15:31:53
 * @LastEditTime: 2020-07-11 16:32:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /istatic-server/config/config.local.ts
 */

import { EggAppConfig, PowerPartial } from "egg";

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.mysql = {
    client: {
      host: "127.0.0.1",
      port: "3306",
      user: "root",
      password: "lzx19870620",
      database: "istatic",
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  config.redis = {
    client: {
      host: "127.0.0.1",
      port: 6379,
      password: "",
      db: 0,
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  return config;
};
