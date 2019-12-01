import axios from "axios"
const Instance = axios.create({
  baseURL: 'https://admall.youpenglai.com'
})
export const getSTS = () => Instance.get('/apis/v1/oss/upload/sts')
