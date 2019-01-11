// An helper used by utils/networking/sagas to perform requests

import axios from 'axios'

import rrh from './'

export const axiosHelper = ({
  route,
  method = 'GET',
  postData,
  auth,
  ignoreBaseURL,
}) => {
  // route must be without starting or trailing slash
  let url =
    !ignoreBaseURL && rrh.backURL && !route.startsWith('http')
      ? rrh.backURL
      : ''
  url += route

  let options = {
    url,
    method,
    data: postData,
    withCredentials: true,
  }

  for (let p of rrh.plugins) {
    options = p.beforeRequest(options)
  }

  return axios
    .request(options)
    .then(response => ({ response }))
    .catch(error => ({ error }))
}
