import axios from "axios"
/*  */
const Interface = axios.create({
  baseURL: 'http://192.168.130.37'
})
Interface.defaults.baseURL = ''
export const getSTS = () => Interface.get('/apis/v1/oss/upload/sts')
