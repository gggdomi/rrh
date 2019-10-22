// Dispatch request and success/fail actions for all rrhActions

import { call, put, takeEvery } from 'redux-saga/effects'
import { axiosHelper } from './requests'
import { rrhStartRegex } from './misc'

export const makeNetworkingSaga = rrh => function* networkingSaga() {
  yield takeEvery(action => action.type.match(rrhStartRegex), function*(
    action
  ) {
    const actions = rrh.actions[action.groupName]

    if (!action.route) {
      yield put(actions.Fail(`No route in ${action.type}`, action.reqId))
    } else {
      const { response, error } = yield call(axiosHelper, rrh, action)

      if (response) {
        if (actions.hasPresuccess)
          yield put(actions.PreSuccess(response, action))
        else {
          yield put(actions.Success(response, action))
        }
      } else {
        yield put(actions.Fail(error, action))
      }
    }
  })
}
