import { formatError } from './misc'

import randint from 'random-int'

export const rrhStartRegex = /@RRH\/(.+)_START/
export const rrhSuccessRegex = /@RRH\/(.+)_SUCCESS/
export const rrhFailRegex = /@RRH\/(.+)_FAIL/

const editReqIds = (reqIds, reqId, value) => {
  return { ...reqIds, [reqId]: value }
}

const fam = (
  groupName,
  route,
  {
    method = 'GET', // may be POST
    authenticated = true, // set to true to attach JWT Token to request

    // set to true if we need to do intermediate operations (ex: data transformation) before dispatching .Success()
    // (notably used for login)
    hasPresuccess = false,

    // text content of the alert (null: no alert)
    successAlert = null,

    // set to false if you don't want alerts when a request fail
    displayFailAlert = true,

    isLoginRoute = false,
    isLogoutRoute = false,
    ignoreBaseURL = false,
  } = {}
) => {
  const actionTypes = {
    START: `@RRH/${groupName}_START`,
    PRESUCCESS: `@RRH/${groupName}_PRESUCCESS`,
    SUCCESS: `@RRH/${groupName}_SUCCESS`,
    FAIL: `@RRH/${groupName}_FAIL`,
  }

  const startAction = (
    postData = null,
    reqId = null,
    overrideRoute = null
  ) => ({
    type: actionTypes.START,
    route:
      (overrideRoute || route) + (method === 'GET' && postData ? postData : ''),
    method,
    authenticated,
    postData: method === 'POST' ? postData : null,
    reqId: reqId || randint(0, 999999),
    ignoreBaseURL,
  })

  const preSuccessAction = (rawData, reqId) => ({
    type: actionTypes.PRESUCCESS,
    rawData,
    reqId,
  })

  const successAction = (data, reqId) => ({
    type: actionTypes.SUCCESS,
    data,
    reqId,
  })

  const failAction = (error, reqId) => ({
    type: actionTypes.FAIL,
    error,
    reqId,
  })

  const uiReducer = (
    state = { loading: false, error: false, success: false, reqIds: {} },
    action
  ) => {
    switch (action.type) {
      case actionTypes.START:
        return {
          ...state,
          loading: true,
          error: null,
          success: false,
          reqIds: editReqIds(state.reqIds, action.reqId, 'loading'),
        }
      case actionTypes.SUCCESS:
        return {
          ...state,
          loading: false,
          error: null,
          success: true,
          reqIds: editReqIds(state.reqIds, action.reqId, 'success'),
        }
      case actionTypes.FAIL:
        return {
          ...state,
          loading: false,
          error: action.error,
          errorMessage: formatError(action.error),
          success: false,
          reqIds: editReqIds(state.reqIds, action.reqId, 'error'),
        }
      default:
        break
    }

    return state
  }

  const actions = {
    ...actionTypes,
    groupName,
    hasPresuccess,
    Start: startAction,
    PreSuccess: preSuccessAction,
    Success: successAction,
    Fail: failAction,
    uiReducer,
    successAlert,
    displayFailAlert,
    isLoginRoute,
    isLogoutRoute,
  }

  _fetchActions[groupName] = actions
  _uiReducers[groupName] = uiReducer
  return actions
}

export default {
  new: fam,
  baseURL: null,
  plugins: [],
}

const _fetchActions = {}
const _uiReducers = {}
export const rrhActions = _fetchActions
export const rrhReducers = _uiReducers
