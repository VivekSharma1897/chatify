import React, { Component } from 'react';
import './log_in_page.css'
import { Link , withRouter } from 'react-router-dom';
import {SIGNUP_PAGE, PROFILE_PAGE} from '../constants/routes';
import { withFirebase } from '../firebase/';

const classes = {
    headerBar : "header-bar",
    websiteName : "website-name",
    logInBlock : "log-in-block",
    logInForm : "log-in-form",
    logInLabels : "log-in-label",
    logInInput : "log-in-input",
    logInBtn : "log-in-btn",
    signUpOption : "sign-up-option",
}

let uid = ''

const LogInPage = () => (
    <React.Fragment>
        <Header/>
        <LogInBlock/>
    </React.Fragment>
);

const Header = () => (
    <div className={classes.headerBar}>
        <h1 className={classes.websiteName}>Chatify</h1>
    </div>   
);

const INITIAL_STATE = {
    email : '',
    password : '',
    error : null,
}

class LogInBlockClass extends Component {
    constructor(props){
        console.log("CONSTRUCTOR");
        super(props);
        this.state = {...INITIAL_STATE};
    }
    state={

    }
    onChange=(event)=>{
        this.setState({[event.target.name] : event.target.value});
    }
    onSubmit=(event)=>{
        console.log("LOGGINGIN")
        const {email , password} = this.state;
        this.props.firebase.doSignInWithEmailAndPassword(email, password)
        .then(authUser=>{ uid=authUser;})
        .then(()=>{ this.setState({...INITIAL_STATE}); this.props.history.push(PROFILE_PAGE);})
        .catch(error=>{this.setState({error})});
        event.preventDefault();
    }

    render(){
        const { email , password , error } = this.state;
        let isValid = password === '' || email === ''; 
        return(
        <div className={classes.logInBlock}>
            <form className={classes.logInForm} onSubmit={this.onSubmit}>
                <label className={classes.logInLabels}>E-Mail </label>
                <input className={classes.logInInput} type="text" onChange={this.onChange} name="email" value={this.state.email} placeholder="E-Mail"/>
                <label className={classes.logInLabels}>Password </label>
                <input className={classes.logInInput} type="password" onChange={this.onChange} name="password" value={this.state.password} placeholder="Password"/>
                <button disabled={isValid} className={classes.logInBtn} type="submit" name="log-in-btn" onSubmit={this.onSubmit}>Log In!</button>
                <span className={classes.signUpOption}>New to Chatify?<Link to={SIGNUP_PAGE}> Sign Up Now!</Link></span>
                {error && <span>{error.message}</span>}
            </form>
        </div>
        );
    }
}

const LogInBlock = withRouter(withFirebase(LogInBlockClass))

export default LogInPage;
export { Header, uid };