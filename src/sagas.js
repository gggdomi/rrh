// Dispatch request and success/fail actions for all rrhActions

import { call, put, takeEvery } from 'redux-saga/effects'
//import { toast } from 'react-toastify'

import { axiosHelper } from './requests'
//import { formatError } from './misc'
import { rrhActions, rrhStartRegex } from './'
// import { removeCredentialsAction } from 'auth/actions'

export function* networkingSaga() {
  yield takeEvery(action => action.type.match(rrhStartRegex), function*(
    action
  ) {
    const groupName = action.type.match(rrhStartRegex)[1]
    const actions = rrhActions[groupName]

    if (!action.route) {
      yield put(actions.Fail(`No route specified in ${action.type}`))
    } else {
      const { response, error } = yield call(axiosHelper, {
        route: action.route,
        method: action.method,
        authenticated: action.authenticated,
        postData: action.postData,
      })

      if (response) {
        if (actions.successAlert) {
          // toast.success(actions.successAlert, { autoClose: 2000 })
        }

        if (actions.hasPresuccess)
          yield put(actions.PreSuccess(response.data, action.reqId))
        else {
          yield put(actions.Success(response.data, action.reqId))
        }
      } else {
        yield put(actions.Fail(error, action.reqId))
        // if (actions.displayFailAlert) toast.error(formatError(error))
        /*
         */
      }
    }
  })
}

export default [networkingSaga]
