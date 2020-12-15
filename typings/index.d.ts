import 'egg'

declare module 'egg' {
  interface Application {
    mysql: any;
    passport: any;
    aliOssClient: any;
    qiniuOss: {
        mac: any;
        bucketManager: any;
        uploadOptions: {
            accessKey: string;
            secretKey: string;
            bucket: string;
            scope: string
        };
    };
  }
}
