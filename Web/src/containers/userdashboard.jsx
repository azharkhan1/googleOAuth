import React, { useState, useEffect, useRef } from "react";
import axios from "axios";



// import global state
import { useGlobalState, useGlobalStateUpdate } from "../context/index";

// importing components
import Logout from '../components/logout'



axios.defaults.withCredentials = true



export default function UserDashboard() {

    const globalState = useGlobalState();


    return (
        <div>
            <div className="wrapper">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className='container'>
                        <a className="navbar-brand" href="#">{globalState.user.userName}</a>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon" />
                        </button>
                            <Logout />
                    </div>
                </nav>
              
            </div>
        </div>
    )
}