// Dispatch request and success/fail actions for all rrhActions

import { call, put, takeEvery } from 'redux-saga/effects'
import { axiosHelper } from './requests'
//import { formatError } from './misc'
import { rrhActions, rrhStartRegex } from './'

export function* networkingSaga() {
  yield takeEvery(action => action.type.match(rrhStartRegex), function*(
    action
  ) {
    const actions = rrhActions[action.groupName]

    if (!action.route) {
      yield put(actions.Fail(`No route in ${action.type}`, action.reqId))
    } else {
      const { response, error } = yield call(axiosHelper, action)

      if (response) {
        if (actions.hasPresuccess)
          yield put(actions.PreSuccess(response, action))
        else {
          yield put(actions.Success(response, action))
        }
      } else {
        yield put(actions.Fail(error, action.reqId))
      }
    }
  })
}

export default [networkingSaga]
