import React, {Component} from 'react'
import './searchUser.css'
import { withFirebase } from '../firebase/';
import { HeaderBar, NotLoggedIn } from '../profile_page/'
import { Header } from '../log_in_page/'
import * as ROUTES from '../constants/routes'
import {Link , withRouter} from 'react-router-dom'
import ResultUser from './result_user'

const classes = {
    searchPageBody : 'search-page-body',
    searchForm : 'search-form',
    searchBar : 'search-bar',
    results : 'results',
}

const SearchUser = ({UID}) => (
    <div className={classes.searchPageBody}>
        {UID ? <HeaderBar/> : <Header/>}
        {UID ? withFirebase(withRouter(SearchUserBaseClass))({UID}) : <NotLoggedIn/>}
    </div>
);

class SearchUserBaseClass extends Component {
    state={
        searchuser : '',
        searchResult : null,
        friendlist : null,
    }

    onSearch = (event) => {
        event.preventDefault();
        console.log(this.state.searchuser);
        this.props.firebase.users().orderByChild('username').startAt(this.state.searchuser).endAt(this.state.searchuser+"\uf8ff").on('value', snapshot=>{
            if(snapshot.val() === null){
                console.log("Not Found");
            }
            else{
                console.log("Searched: ",snapshot.val());
                this.setState({searchResult: snapshot.val()});
            }
        });
    }

    componentDidMount(){
        this.props.firebase.user(this.props.UID.uid).on('value', snapshot=>{
            const userInfo = snapshot.val();
            console.log("UserInfo: ", userInfo);
            this.setState({friendlist: userInfo.friends});
        });
    }

    addFriend = (event) => {
        const key = event.target.name;
        let { friendlist } = this.state;
        if(friendlist){
            friendlist.push(key);
        }
        else{
            friendlist = [key];
        }
        this.props.firebase.user(this.props.UID.uid).child('friends').set(friendlist);
        let userFriendList = null;
        this.props.firebase.user(key).on('value', snapshot=>{
            userFriendList = snapshot.val().friends;
        });
        if(userFriendList){
            userFriendList.push(this.props.UID.uid);
        }
        else{
            userFriendList = [this.props.UID.uid];
        }
        this.props.firebase.user(key).child('friends').set(userFriendList);
        this.setState({friendlist});
    }

    onChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render(){
        return(
            <div>
                <form className={classes.searchForm} onSubmit={this.onSearch} autoComplete="off">
                    <input className={classes.searchBar} type='text' name='searchuser' onChange={this.onChange} value={this.state.searchuser} placeholder="Search..."/>
                </form>
                <div className={classes.results}>
                    {this.state.searchResult &&<Searcher onAddFriend={this.addFriend} searchResult={this.state.searchResult} friendlist={this.state.friendlist}/>}
                </div>
            </div>
        );
    }
}

const Searcher = ({searchResult, friendlist, onAddFriend}) => (
    <React.Fragment>
        {Object.keys(searchResult).map(user=><ResultUser key={user} userID = {user} onAddFriend={onAddFriend} email={searchResult[user].email} username={searchResult[user].username} friends={friendlist}/>)}
    </React.Fragment>
);
export default SearchUser;