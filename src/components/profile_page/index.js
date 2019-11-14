import React, { Component } from 'react';
import { withFirebase } from '../firebase/';
import {Link, withRouter} from 'react-router-dom';
import './profile_page.css';
import * as ROUTES from '../constants/routes';
import F from 'firebase';
import SignOut from '../sign_out/';
import {Header} from '../log_in_page/';
import PostCard from './post_card';

const classes = {
    navBar : 'nav-bar',
    navTitle : 'nav-title',
    navList : 'nav-list',
    navListItem : 'nav-list-item',
    testContent : 'ProfilePage',
    postBox : 'post-box',
    postTitleInput : 'post-title-input',
    postContentInput : 'post-content-input',
    postSubmitBtn : 'post-submit-btn',
    feeds : 'feeds',
    postSubmitBtnBox : 'post-submit-btn-box',
    relogInBtn : 'relog-in-btn',
    relogInDialog : 'relog-in-dialog',
    allPosts : 'all-posts',
    searchBtn : 'search-btn',
}

const ProfilePage = ({UID}) => (
    <div>
    {UID ? <HeaderBar/> : <Header/>}
    { UID ? withFirebase(withRouter(ProfilePageBaseClass))({UID}) : <NotLoggedIn/> }
    </div>
);

const NotLoggedIn = () => (
    <div className={classes.feeds}>
    <span className={classes.relogInBtn}>Login to Chatify <Link to={ROUTES.LOGIN_PAGE} className={classes.relogInDialog}>Click Here</Link></span>
    </div>
);

const INITIAL_STATE ={
    email: "",
    username : "",
    titleinput : "",
    postcontent : "",
    userPosts : null,
    loading: false,
}

class ProfilePageBaseClass extends Component {
    constructor(props){
        super(props);
        this.state={...INITIAL_STATE};
    }
    
    componentWillMount(){
        this.props.firebase.user(this.props.UID.uid).on('value', snapshot=>{
            const userInfo = snapshot.val();
            console.log("STATE: ", this.state);
            console.log("FRIEND ON FETCH: ", userInfo.friends);
            this.setState({email: userInfo.email, username : userInfo.username, friendList : userInfo.friends, loading: true});
        });
    }
    componentDidMount(){   
        this.props.firebase.posts().orderByChild("time").on('value', snapshot=>{
            const userInfo = snapshot.val();
            console.log("STATE DID: ", this.state);
            console.log("FETCHED USER POSTS : ", userInfo);
            console.log("FRIENDLIST: ", this.state.friendList)
            setTimeout(()=>{
                Object.keys(userInfo).forEach(key=>{
                    if(this.state.friendList){
                        if(this.state.friendList.includes(userInfo[key].author) || this.props.UID.uid===userInfo[key].author){
                            
                        }
                        else{
                            delete userInfo[key];
                        }
                    }
                    else{
                        delete userInfo[key];
                    }
                }
                );
            }, 5000);
            this.setState({userPosts:userInfo});
        });
    }

    componentWillUnmount(){
        this.props.firebase.user(this.props.UID.uid).off();
    }

    onPostChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    onPostSubmit = (event) => {
        event.preventDefault();
        const postEntry = {postTitle: this.state.titleinput, postContent: this.state.postcontent, username:this.state.username, email: this.state.email, author :this.props.UID.uid, time:F.database.ServerValue.TIMESTAMP, likes:0, dislikes:0, liked:[], disliked:[], access:[]};
        const key = this.props.firebase.posts().push().key;
        let userPosts = [];
        this.props.firebase.post(key).set(postEntry);
        this.props.firebase.user(this.props.UID.uid).on('value', snapshot=>{
            const userInfo = snapshot.val();
            if(userInfo.POST){
                userPosts = [...userInfo.POST];
            }
        });
        userPosts.push(key)
        this.props.firebase.user(this.props.UID.uid).update({POST: userPosts});
        this.setState({titleinput:'', postcontent:''});
    }

    onLikeBtn = (event) => {
        const key = event.target.name;
        let { userPosts } = this.state;
        
        if(userPosts[key].liked || userPosts[key].disliked){
            if(userPosts[key].liked && !userPosts[key].disliked){
                let index = userPosts[key].liked.indexOf(this.props.UID.uid);
                if(index>-1){
                }
                else{
                    userPosts[key].liked.push(this.props.UID.uid);
                    this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                    userPosts[key].likes = userPosts[key].likes + 1;
                    this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                }
            }
            else
            if(!userPosts[key].liked && userPosts[key].disliked){
                let index = userPosts[key].disliked.indexOf(this.props.UID.uid);
                if(index>-1){
                    userPosts[key].disliked.splice(index, 1);
                    userPosts[key].dislikes = userPosts[key].dislikes - 1;
                    userPosts[key]['liked'] = [this.props.UID.uid];
                    this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                    this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);        
                    userPosts[key].likes = userPosts[key].likes + 1;
                    this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                    this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);

                }
                else{
                    userPosts[key]['liked'] = [this.props.UID.uid];
                    this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                    userPosts[key].likes = userPosts[key].likes + 1;
                    this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                }
            }
            if(userPosts[key].liked && userPosts[key].disliked){
                let likedindex = userPosts[key].liked.indexOf(this.props.UID.uid);
                if(likedindex>-1){
                    
                }
                else{
                    let dislikeindex = userPosts[key].disliked.indexOf(this.props.UID.uid);
                    if(dislikeindex>-1){
                        userPosts[key].disliked.splice(dislikeindex, 1);
                        userPosts[key].dislikes = userPosts[key].dislikes - 1;
                        userPosts[key].liked.push(this.props.UID.uid);
                        this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                        this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);        
                        userPosts[key].likes = userPosts[key].likes + 1;
                        this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                        this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);
                    }
                    else{
                        userPosts[key].liked.push(this.props.UID.uid);
                        this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                        userPosts[key].likes = userPosts[key].likes + 1;
                        this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                    }
                }
            }
        }
        else{
            userPosts[key]['liked'] = [this.props.UID.uid];
            this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
            userPosts[key].likes = userPosts[key].likes + 1;
            this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
        }
        console.log(userPosts[key]);
        this.setState({userPosts});
    }

    onDislikeBtn = (event) => {
        const key = event.target.name;
        let { userPosts } = this.state;

        if(userPosts[key].disliked || userPosts[key].liked){
            if(userPosts[key].disliked && !userPosts[key].liked){
                userPosts[key].disliked.push(this.props.UID.uid);
                this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);
                userPosts[key].dislikes = userPosts[key].dislikes + 1;
                this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);

            }
            else
            if(!userPosts[key].disliked && userPosts[key].liked){
                let index = userPosts[key].liked.indexOf(this.props.UID.uid);
                if(index>-1){
                    userPosts[key].liked.splice(index, 1);
                    userPosts[key].likes = userPosts[key].likes - 1;
                    userPosts[key]['disliked'] = [this.props.UID.uid];
                    this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                    this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);        
                    userPosts[key].dislikes = userPosts[key].dislikes + 1;
                    this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                    this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);
                }
                else{
                    userPosts[key]['disliked'] = [this.props.UID.uid];
                    this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);
                    userPosts[key].dislikes = userPosts[key].dislikes + 1;
                    this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);
                }
            }
            if(userPosts[key].liked && userPosts[key].disliked){
                let dislikedindex = userPosts[key].disliked.indexOf(this.props.UID.uid);
                if(dislikedindex>-1){
                    
                }
                else{
                    let likeindex = userPosts[key].liked.indexOf(this.props.UID.uid);
                    if(likeindex>-1){
                        userPosts[key].liked.splice(likeindex, 1);
                        userPosts[key].likes = userPosts[key].likes - 1;
                        userPosts[key].disliked.push(this.props.UID.uid);
                        this.props.firebase.post(key).child('liked').set(userPosts[key].liked);
                        this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);        
                        userPosts[key].dislikes = userPosts[key].dislikes + 1;
                        this.props.firebase.post(key).child('likes').set(userPosts[key].likes);
                        this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);
                    }
                    else{
                        userPosts[key].disliked.push(this.props.UID.uid);
                        this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);
                        userPosts[key].dislikes = userPosts[key].dislikes + 1;
                        this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);
                    }
                }
            }
        }
        else{
            userPosts[key]['disliked'] = [this.props.UID.uid];
            this.props.firebase.post(key).child('disliked').set(userPosts[key].disliked);
            userPosts[key].dislikes = userPosts[key].dislikes + 1;
            this.props.firebase.post(key).child('dislikes').set(userPosts[key].dislikes);
        }
        console.log(userPosts[key]);
        this.setState({userPosts});
    }

    render(){
        const {titleinput, postcontent} = this.state;
        let inValid = titleinput === '' || postcontent==='';
        return (
            <div className={classes.feeds}>
            <p style={{marginTop:'10px'}}>{this.state.username}</p>
            <form onSubmit={this.onPostSubmit} className={classes.postBox} autoComplete="off">
                <input className={classes.postTitleInput} type="text" name="titleinput" onChange={this.onPostChange} value={this.state.titleinput} placeholder="Title"/>
                <textarea className={classes.postContentInput} type="text" name="postcontent" onChange={this.onPostChange} value={this.state.postcontent} placeholder="Post here" rows="2"/>
                <div className={classes.postSubmitBtnBox}>
                <button disabled={inValid} className={classes.postSubmitBtn} onSubmit={this.onPostSubmit} type="submit">Post</button>
                </div>
            </form>
            <div className={classes.allPosts}>       
                {this.state.userPosts && <Feeders onDislikeBtn={this.onDislikeBtn} onLikeBtn={this.onLikeBtn} posts = {this.state.userPosts} UID = {this.props.UID.uid} />}
            </div>
            </div>
        );
    }

}

const Feeders = ({onDislikeBtn, onLikeBtn, posts, UID}) => (
    <React.Fragment>
        {Object.keys(posts).reverse().map(key=><PostCard key={key} postID = {key} onDislikeBtn={onDislikeBtn} onLikeBtn = {onLikeBtn} postTitle={posts[key].postTitle} postContent={posts[key].postContent} timestamp={posts[key].time} likes={posts[key].likes} dislikes={posts[key].dislikes} liked={posts[key].liked} disliked={posts[key].disliked} UID={UID} postAuthor = {posts[key].username}/>)}
    </React.Fragment>
);

const HeaderBar = () => (
    <div className={classes.navBar}>
        <h1 className={classes.navTitle}><Link to={ROUTES.PROFILE_PAGE}>Chatify</Link></h1>
        <ul className={classes.navList}>
            <li className={classes.navListItem}>Chat</li>
            <li className={classes.navListItem}>ProfilePic</li>
            <li className={classes.navListItem}>Notification</li>
        </ul>
        <SearchUser/>
        <SignOut/>
    </div>
);

const SearchUser = () =>(
    <React.Fragment>
        <Link to={ROUTES.SEARCH_USER}  className={classes.searchBtn} >Search</Link>
    </React.Fragment>
);

const UserData = ({email, username}) =>(
    <ul>
        <li>{email}</li>
        <li>{username}</li>
    </ul>
);

//const ProfilePageBase = withRouter(withFirebase(ProfilePageBaseClass));

export default ProfilePage;
export {HeaderBar, NotLoggedIn};