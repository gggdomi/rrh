import { formatError } from './misc'

import randint from 'random-int'

export const rrhStartRegex = /@RRH\/(.+)_START/
export const rrhSuccessRegex = /@RRH\/(.+)_SUCCESS/
export const rrhFailRegex = /@RRH\/(.+)_FAIL/

const editReqIds = (reqIds, reqId, value) => {
  return { ...reqIds, [reqId]: value }
}

const fam = (groupName, route, options = {}) => {
  const {
    method = 'GET', // may be POST, PUT...
    // set to true if we need to do intermediate operations (ex: data transformation) before dispatching .Success()
    hasPresuccess = false,
    ignoreBaseURL = false,
    ...more // used by plugins
  } = options

  const actionTypes = {
    START: `@RRH/${groupName}_START`,
    PRESUCCESS: `@RRH/${groupName}_PRESUCCESS`,
    SUCCESS: `@RRH/${groupName}_SUCCESS`,
    FAIL: `@RRH/${groupName}_FAIL`,
  }

  const startAction = params => {
    const {
      data = null,
      urlSuffix = '',
      reqId = null,
      overrideRoute = null,
      ...moreParams
    } = params

    let action = {
      type: actionTypes.START,
      route: (overrideRoute || route) + urlSuffix,
      method,
      data,
      reqId: reqId || randint(0, 999999),
      ignoreBaseURL,
    }

    for (let p of rrh.plugins) {
      action = p.enhanceStartAction(action, params, options)
    }

    return action
  }

  const preSuccessAction = (response, startAction) => {
    return {
      type: actionTypes.PRESUCCESS,
      response,
      rawData: response.data,
      reqId: startAction.reqId,
      startAction,
    }
  }

  const successAction = (response, startAction) => {
    let action = {
      type: actionTypes.SUCCESS,
      response,
      data: response.data,
      reqId: startAction.reqId,
      startAction,
    }

    for (let p of rrh.plugins) {
      action = p.enhanceSuccessAction(action, options)
    }

    return action
  }

  const failAction = (response, startAction) => {
    let action = {
      type: actionTypes.FAIL,
      response,
      error: response.error,
      reqId: startAction.reqId,
      startAction,
    }

    for (let p of rrh.plugins) {
      action = p.enhanceFailAction(action, options)
    }

    return action
  }

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
          data: action.data,
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
    ...more,
  }

  _fetchActions[groupName] = actions
  _uiReducers[groupName] = uiReducer
  return actions
}

const rrh = {
  new: fam,
  baseURL: null,
  plugins: [],
}

export default rrh

const _fetchActions = {}
const _uiReducers = {}
export const rrhActions = _fetchActions
export const rrhReducers = _uiReducers
