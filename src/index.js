import randint from 'random-int'
import { formatError, editReqIds, rrhStartRegex, rrhSuccessRegex, rrhFailRegex } from './misc'
import { makeNetworkingSaga } from './sagas'

const defaultOptions = {
  baseURL: null,
  getErrorMessage: formatError,
}

export const createRRH = ({ options, plugins = [] }) => {
  const finalOptions = { ...defaultOptions, ...options }
  
  const rrh = {
    options: finalOptions,
    actions: {},
    reducers: {},
  }

  rrh.new = (groupName, route, famOptions = {}) => {
    const {
      // method, forwarded to axios
      method = 'GET',

      // set to true if we need to do intermediate operations (ex: data transformation) before dispatching .Success()
      hasPresuccess = false,

      // if we use an absolute url for this request
      ignoreBaseURL = false,

      // automatically store request data in reducer if true
      storeData = false,

      // forwarded to axios
      axiosOptions = {},

      // used by plugins
      ...more
    } = famOptions

    const actionTypes = {
      START: `@RRH/${groupName}_START`,
      PRESUCCESS: `@RRH/${groupName}_PRESUCCESS`,
      SUCCESS: `@RRH/${groupName}_SUCCESS`,
      FAIL: `@RRH/${groupName}_FAIL`,
    }

    const startAction = (params = {}) => {
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
        axiosOptions,
        groupName,
        moreParams,
      }

      for (let p of rrh.plugins) {
        if (p.enhanceStartAction)
          action = p.enhanceStartAction(action, params, famOptions)
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
        groupName,
      }
    }

    const successAction = (response, startAction) => {
      let action = {
        type: actionTypes.SUCCESS,
        response,
        data: response.data,
        reqId: startAction.reqId,
        startAction,
        groupName,
      }

      for (let p of rrh.plugins) {
        if (p.enhanceSuccessAction)
          action = p.enhanceSuccessAction(action, famOptions)
      }

      return action
    }

    const failAction = (error, startAction) => {
      let action = {
        type: actionTypes.FAIL,
        response: error.response,
        error: error,
        reqId: startAction.reqId,
        startAction,
        groupName,
      }

      for (let p of rrh.plugins) {
        if (p.enhanceFailAction) action = p.enhanceFailAction(action, famOptions)
      }

      return action
    }

    const uiReducer = (
      state = {
        fresh: true, // True until any request is fired
        loading: false,
        error: null,
        errorMessage: null,
        success: false,
        reqIds: {},
      },
      action
    ) => {
      switch (action.type) {
        case actionTypes.START:
          return {
            ...state,
            fresh: false,
            loading: true,
            error: null,
            errorMessage: null,
            success: false,
            reqIds: editReqIds(state.reqIds, action.reqId, 'loading'),
          }
        case actionTypes.SUCCESS:
          const dataToStore = storeData ? action.data : undefined

          return {
            ...state,
            fresh: false,
            loading: false,
            error: null,
            errorMessage: null,
            success: true,
            reqIds: editReqIds(state.reqIds, action.reqId, 'success'),
            data: dataToStore,
          }
        case actionTypes.FAIL:
          return {
            ...state,
            fresh: false,
            loading: false,
            error: action.error,
            errorMessage: rrh.options.getErrorMessage(action.error),
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
      ...more,
    }

    if (rrh.actions[groupName] != null)
      console.error(`Trying to register "${groupName}" twice in rrh`)

    rrh.actions[groupName] = actions
    rrh.reducers[groupName] = uiReducer
    return actions
  }

  rrh.plugins = plugins.map(p => p(rrh))
  rrh.sagas = [makeNetworkingSaga(rrh), ...rrh.plugins.flatMap(p => p.sagas)]

  return rrh
}

export { rrhStartRegex, rrhSuccessRegex, rrhFailRegex}
