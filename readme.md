A factory for networking actions to abstract and reuse common logic. 
One group of actions is created for each API endpoint and includes in particular :
- 4 actions : actions.Start(), actions.PreSuccess(), actions.Success(), actions.Fail()
- their types : actions.START, actions.PRESUCCESS, actions.SUCCESS, actions.FAIL
- a reducer to display request state

USAGE:
- For each endpoint, you create a group of actions with an unique identifier : 
  ex: const refreshSomethingActions = fam('REFRESH_SOMETHING', {options})
  (see arguments below for options)
- You also have to define the API endpoint in consts.js (groupNameToRoutes):
  ex: REFRESH_SOMETHING: 'refresh/something'

- You probably only need to dispatch refreshSomethingActions.Start(data, reqId). With optional params :
  - data will be the json body for POST request / an appended url path for GET request
  - reqId is used to uniquely identify the request, and will be passed to the next actions
    (ex: if we dispatch multiple request for the same group simultaneously and need to know which one completed)
- the utils/networking/sagas.js will dispatch refreshSomethingActions.Success(), refreshSomethingActions.Fail()

- in your reducers, you should listen to refreshSomethingActions.SUCCESS, refreshSomethingActions.FAIL...

- in your components, you can now access the request state to update UI via 
  state.fetch.REFRESH_SOMETHING.loading (.error, .success)
