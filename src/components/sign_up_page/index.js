import React, { Component } from 'react';
import { Link , withRouter } from 'react-router-dom';
import * as ROUTES from '../constants/routes'
import { Header } from '../log_in_page/'
import "./sign_up_page.css"
import { withFirebase } from '../firebase/'

let signedUpUID = ''

const classes = {
    signUpBlock : "sign-up-block",
    signUpForm : "sign-up-form",
    signUpInput : "sign-up-input",
    signUpLabels : "sign-up-label",
    signUpBtn : "sign-up-btn",
    logInOption : "log-in-option",
    emailPassBox : "email-pass-box",
    usernameConfirmBox : "username-confirm-box"
}

const SignUpPage = () => (
    <React.Fragment>
    <Header/>
    <SignUp/>
    </React.Fragment>
);

const INITIAL_STATE = {
    email : '',
    username : '', 
    password : '',
    confirmpassword : '',
    error : null,
}

class SignUpClass extends Component {
    constructor(props){
        super(props);
        this.state = {...INITIAL_STATE}
    }
    state={

    }
    onChange=(event)=>{
        this.setState({[event.target.name] : event.target.value});
    }
    onSubmit=(event)=>{
        const {email , password , username } = this.state;
        this.props.firebase.doCreateUserWithEmailAndPassword(email, password)
        .then(authUser=>{signedUpUID=authUser; console.log("NEW USER: ",signedUpUID); return this.props.firebase.user(authUser.user.uid).set({username, email})})
        .then(()=>{this.setState({...INITIAL_STATE}); this.props.history.push(ROUTES.PROFILE_PAGE);})
        .catch(error=>{this.setState({error})});
        event.preventDefault();
    }

    render(){
        const { email , password , username, confirmpassword , error} = this.state;
        let isInvalid = password !== confirmpassword || username === '' || email === '' || password === '';
        console.log(email , password, confirmpassword, username)
        console.log(isInvalid)
        return(
        <div className={classes.signUpBlock}>
            <form className={classes.signUpForm} onSubmit={this.onSubmit}>
                <div className={classes.emailPassBox}>
                    <label className={classes.signUpLabels} style={{marginRight:"20px"}}>E-Mail </label>
                    <input className={classes.signUpInput} style={{marginRight:"20px"}} type="text" onChange={this.onChange} name="email" value={this.state.email} placeholder="E-Mail"/>
                    <label className={classes.signUpLabels} style={{marginRight:"20px"}}>Password </label>
                    <input className={classes.signUpInput} style={{marginRight:"20px"}} type="password" onChange={this.onChange} name="password" value={this.state.password} placeholder="Password"/>
                </div>
                <div className={classes.usernameConfirmBox}>
                <label className={classes.signUpLabels}>Username </label>
                    <input className={classes.signUpInput} type="text" onChange={this.onChange} name="username" value={this.state.username} placeholder="Username"/>
                    <label className={classes.signUpLabels}>Password </label>
                    <input className={classes.signUpInput} type="password" onChange={this.onChange} name="confirmpassword" value={this.state.confirmpassword} placeholder="Confirm Password"/>
                    <button disabled={isInvalid} className={classes.signUpBtn} type="submit" name="sign-up-btn" onSubmit={this.onSubmit}>Sign Up!</button>
                    <span className={classes.logInOption}>Already Registered?<Link to={ROUTES.LOGIN_PAGE}> Log In Here!</Link></span>
                    {error && <span>{error.message}</span>}
                </div>
            </form>
            
        </div>
        );
    }
}
const SignUp = withRouter(withFirebase(SignUpClass));
export default SignUpPage;
export { signedUpUID };