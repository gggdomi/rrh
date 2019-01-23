// An helper used by utils/networking/sagas to perform requests

import axios from 'axios'

import rrh from './'

export const axiosHelper = ({
  route,
  method = 'GET',
  data,
  auth,
  ignoreBaseURL,
}) => {
  // route must be without starting or trailing slash
  let url =
    !ignoreBaseURL && rrh.baseURL && !route.startsWith('http')
      ? rrh.baseURL
      : ''
  url += route

  let options = {
    url,
    method,
    data,
  }

  for (let p of rrh.plugins) {
    if (p.beforeRequest) options = p.beforeRequest(options)
  }

  return axios
    .request(options)
    .then(response => ({ response }))
    .catch(error => ({ error }))
}
