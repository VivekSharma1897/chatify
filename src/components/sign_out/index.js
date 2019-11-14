import React from 'react';
import {withFirebase} from '../firebase/';
import './sign_out.css'
import {withRouter} from 'react-router-dom'

const classes = {
    signOutBtn : 'sign-out-btn',
}

const SignOut = ({firebase}) => (
    <button className={classes.signOutBtn} onClick={firebase.doSignOut}>Log Out</button>
);

export default withRouter(withFirebase(SignOut));