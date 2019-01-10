// An helper used by utils/networking/sagas to perform requests

import axios from 'axios'

import rrh from './'

export const axiosHelper = ({ route, method = 'GET', postData, auth }) => {
  // route must be without starting or trailing slash
  let url = rrh.backURL && !route.startsWith('http') ? rrh.backURL : ''
  url += route

  return axios
    .request({
      url,
      method,
      data: postData,
      withCredentials: true,
    })
    .then(response => ({ response }))
    .catch(error => ({ error }))
}
