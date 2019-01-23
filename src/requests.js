// An helper used by utils/networking/sagas to perform requests

import axios from 'axios'

import rrh from './'

export const axiosHelper = action => {
  let url =
    !action.ignoreBaseURL && rrh.baseURL && !action.route.startsWith('http')
      ? rrh.baseURL
      : ''
  url += action.route

  let options = {
    ...action.axiosOptions,
    url,
    method: action.method,
    data: action.data,
  }

  for (let p of rrh.plugins) {
    if (p.beforeRequest) options = p.beforeRequest(action, options)
  }

  return axios
    .request(options)
    .then(response => ({ response }))
    .catch(error => ({ error }))
}
