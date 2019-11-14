import axios from "axios"
axios.defaults.baseURL = 'https://admall.youpenglai.com'
export const getSTS = () => axios.get('/apis/v1/oss/upload/sts')
