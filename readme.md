RRH aims to remove boilerplate when doing common network operations with Redux. It provides:
- helpers to trigger requests by dispatching actions, and dispatching actions when request resolve.
- reducer to automatically store requests state (loading, error), to use directly in components
- plugins
    + [RRH-auth](https://github.com/gggdomi/rrh-auth): store credentials, authenticate requests and redirect to login if needed.
    + [RRH-alerts](https://github.com/gggdomi/rrh-alerts): display notifications when requests resolve.

## Installation

RRH heavily relies on [redux-saga](https://github.com/redux-saga/redux-saga) and requires it to bet set up.

`yarn add @gggdomi/rrh`

## Setup

#### Configure redux-saga
Configure your project to use redux-saga middleware (see [redux-saga documentation](https://redux-saga.js.org/docs/introduction/BeginnerTutorial.html)). It'll probably look like:

```js
// index.js
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)
```

#### Run RRH sagas:
```js
// index.js
import rrhSagas from '@gggdomi/rrh/src/sagas'

// configure saga middleware...

rrhSagas.map(sagaMiddleware.run)
```

#### Add RRH reducers:
```js
// reducers.js
import { combineReducers } from 'redux'
import { rrhReducers } from '@gggdomi/rrh'

export const rootReducer = combineReducers({
    your: yourReducer,
    rrh: combineReducers(rrhReducers),
  })

```

## Usage

#### Define your routes:
```js
// actions.js
import rrh from '@gggdomi/rrh'

const fetchUsers = rrh.new('FETCH_USERS', '/users/', {
    storeData: true,
})

const createUser = rrh.new('CREATE_USER', '/users/new/', {
    method: 'POST',
})
```

#### Start a request & use request state from your components:
```js
// ExampleComponent.js
import React from 'react'
import { connect } from 'react-redux'

import { fetchUsers, createUser } from './actions'

const ExampleComponent = ({ 
    loadingUsers, 
    errorMessage, 
    startFetchingUsers, 
    users,
    startCreateUser,
    creating,
    userCreated,
}) => {
    if (loadingUsers)
        return "Loading..."

    if (errorMessage)
        return `Can't load users: ${errorMessage}`

    return (
        <div>
            <h3>Users</h3>
            <button onClick={startFetchingUsers}>Refresh</button>
            <ul>
                {users.map(x => 
                    <li key={x.id} />{x.firstName} {x.lastName}</li>
                )}
            </ul>
            <button onClick={startCreateUser}>Create a user</button>
            {creating && <div>Creating user...</div>}
            {userCreated && <div>The user has been successfully created</div>}
        </div>
    )
}

const mapStateToProps = state => ({
    loadingUsers: state.rrh.FETCH_USERS.loading,
    errorMessage: state.rrh.FETCH_USERS.errorMessage,
    users: state.rrh.FETCH_USERS.data,
    creating: state.rrh.CREATE_USER.loading,
    userCreated: state.rrh.CREATE_USER.success,
})

const mapDispatchToProps = dispatch => ({
    startFetchingUsers: () => dispatch(fetchUsers.Start()),
    startCreateUser: () => dispatch(createUser.Start({ 
        data: { id: 123, firstName: 'John', lastName: 'Doe' }
    })),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExampleComponent)
```

#### Pre-defined action types available for your reducers:
```js
// reducer.js
import { fetchUsers, createUser } from './actions'

const initialState = {
  users: [],
  createUserCount: 0,
  cantCreateUser: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case fetchUsers.SUCCESS:
      return { ...state, users: action.data }
    case createUser.START:
      return { ...state, createUserCount: state.createUserCount + 1 }
    case createUser.FAIL:
      return { ...state, cantCreateUser: true }
    default:
      break
  }

  return state
}
```

## Configuration

### Global level

```js
import rrh from '@gggdomi/rrh'
import rrhAuth from '@gggdomi/rrh-auth'
import rrhAlerts from '@gggdomi/rrh-alerts'

// base url to be pre-pendend to any route (default: null)
rrh.baseURL = "https://example.com/api"

// plugins
rrh.plugins = [rrhAuth, rrhAlerts]

// 
rrh.getErrorMessage = formatError,
```

### Route level

```js
import rrh from '@gggdomi/rrh'

const createUser = rrh.new('CREATE_USER', '/users/new/', {
    // method, forwarded to axios (default: 'GET')
    method: 'POST',

    // if we use an absolute url for this request and don't want to include rrh.baseURL (default: false)
    ignoreBaseURL: true,

    // automatically store request response data in reducer if set to true (default: false)
    storeData: true,

    // will be forwarded to axios via axios.request(...axiosOptions) (default: {})
    axiosOptions: {
        timeout: 60,
    }
})
```

### Call level

```js
createUser.Start({
    // POST data (default: null)
    data: { id: 123, firstName: 'John', lastName: 'Doe' },

    // appended to url (default: '')
    // ex: will POST on /users/new/1234/
    urlSuffix: '1234',

    // id of the request, to be able to track network state for multiple requests of the same kind simultaneously (default: null, will generate a random reqId)
    reqId: 1234,
})
```

## Plugins

+ [rrh-auth](https://github.com/gggdomi/rrh-auth): store credentials, authenticate requests and redirect to login if needed.
+ [rrh-alerts](https://github.com/gggdomi/rrh-alerts): display notifications when requests resolve.

### Using a plugin

- Add plugin to RRH

```js
import rrh from '@gggdomi/rrh'
import rrhAlerts from '@gggdomi/rrh-auth'

rrh.plugins = [rrhAlerts]
```

- Run plugin's sagas

```js
import rrhAlertsSagas from '@gggdomi/rrh-alerts/src/sagas'

rrhAlertsSagas.map(sagaMiddleware.run)
```

See plugins' repositories for more informations

### Creating your own plugin

There is two ways to plug into RRH behavior:
1. By creating a saga that will take RRH's special actions
2. By implementing `beforeRequest, enhanceStartAction, enhanceSuccessAction and/or enhanceFailAction` to mutate actions and request options

See `rrh-auth` & `rrh-alerts` repositories for implementation examples.