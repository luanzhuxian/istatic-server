import axios from 'axios'
const instance = axios.create({
  baseURL: 'http://192.168.130.34'
})
export const getSTS = () => instance .get('/apis/v1/oss/upload/sts')
