import 'egg'

declare module 'egg' {
  interface Application {
    mysql: any;
    ossClient: any;
    passport: any;
  }
}
