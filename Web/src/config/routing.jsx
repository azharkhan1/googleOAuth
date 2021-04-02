import React from "react";
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";


import Signin from "../containers/signin"
import Signup from "../containers/signup"
import UserDashboard from "../containers/userdashboard";
// Improrting Global context
import { useGlobalState } from '../context/index';




export default function AppRouter() {

  const globalState = useGlobalState();

  return (
    <HashRouter>
      {(globalState.loginStatus === false) ?
        <>
          <Switch>
            <Route exact={true} path="/">
              <Signin />
            </Route>
            <Route path="/signup">
              <Signup />
            </Route>
  
          </Switch>
        </>
        : null}
      {/* private routes */}

      {(globalState.role === "user" && globalState.loginStatus === true) ?
        <>
          <Switch>
            <Route exact path="/">
              <UserDashboard />
            </Route>
            <Route path='*'>
              <UserDashboard />
            </Route>
          </Switch>
        </>
        : null}
    </HashRouter >

  )
}