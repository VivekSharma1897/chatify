import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import LogInPage from '../log_in_page/';
import SignUpPage from '../sign_up_page/';
import { withFirebase } from '../firebase/'
import ProfilePage from '../profile_page/'
import SearchUser from '../search_user/'

class App extends Component{
    constructor(props){
        super(props);
        this.state={
            authUser : null
        }
    }
    componentDidMount(){
        this.listener = this.props.firebase.auth.onAuthStateChanged( authUser=>
            { authUser ? this.setState({authUser}) : this.setState({authUser: null})}
        );
    }
    componentWillUnmount(){
        this.listener();
    }
    render(){
        return(
            <Router>
                <Switch>
                <Route exact path={ROUTES.LOGIN_PAGE} component={LogInPage}/>
                <Route exact path={ROUTES.SIGNUP_PAGE} component={SignUpPage} />
                <Route exact path={ROUTES.PROFILE_PAGE} render={(routeProps)=><ProfilePage {...routeProps} UID={this.state.authUser}/>}/>
                <Route exact path={ROUTES.SEARCH_USER} render={(routeProps)=><SearchUser {...routeProps} UID = {this.state.authUser}/>}/>
                </Switch>
            </Router>
        );
    }
}
export default withFirebase(App);