interface ProjectData {
  name: string
  id?: string
  fontFace?: string
}
interface Axios {
  get: any,
  post: any,
  create: any
}
interface IconsFields {
  projectId: string,
  namespace: string,
  id?: string,
  content: string,
  iconName: string,
  iconDesc: string
}
