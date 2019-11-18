import React, { Component } from "react";
import { withFirebase } from "../firebase/";
import { Link, withRouter } from "react-router-dom";
import "./profile_page.css";
import * as ROUTES from "../constants/routes";
import F from "firebase";
import SignOut from "../sign_out/";
import { Header } from "../log_in_page/";
import PostCard from "./post_card";
import FriendListSideBar from "./friend_list_sidebar";

const classes = {
  navBar: "nav-bar",
  navTitle: "nav-title",
  navList: "nav-list",
  navListItem: "nav-list-item",
  testContent: "ProfilePage",
  postBox: "post-box",
  postTitleInput: "post-title-input",
  postContentInput: "post-content-input",
  postSubmitBtn: "post-submit-btn",
  feeds: "feeds",
  postSubmitBtnBox: "post-submit-btn-box",
  relogInBtn: "relog-in-btn",
  relogInDialog: "relog-in-dialog",
  allPosts: "all-posts",
  searchBtn: "search-btn",
  pageContent: "page-content",
  friendListContent: "friend-list-content",
  addImageLabel: "add-image-label",
  addImageInput: "add-image-input"
};

const ProfilePage = ({ UID }) => (
  <div>
    {UID ? <HeaderBar /> : <Header />}
    {UID ? (
      withFirebase(withRouter(ProfilePageBaseClass))({ UID })
    ) : (
      <NotLoggedIn />
    )}
  </div>
);

const NotLoggedIn = () => (
  <div className={classes.feeds} style={{ marginRight: "0px" }}>
    <span className={classes.relogInBtn}>
      Login to Chatify{" "}
      <Link to={ROUTES.LOGIN_PAGE} className={classes.relogInDialog}>
        Click Here
      </Link>
    </span>
  </div>
);

const INITIAL_STATE = {
  email: "",
  username: "",
  titleinput: "",
  postcontent: "",
  postType: null,
  image: null,
  userPosts: null,
  loading: false
};

class ProfilePageBaseClass extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentWillMount() {
    this.props.firebase.user(this.props.UID.uid).on("value", snapshot => {
      const userInfo = snapshot.val();
      this.setState({
        email: userInfo.email,
        username: userInfo.username,
        friendList: userInfo.friends,
        loading: true
      });
    });
  }
  componentDidMount() {
    this.props.firebase
      .posts()
      .orderByChild("time")
      .on("value", snapshot => {
        const userInfo = snapshot.val();
        console.log("Somehow this is being called");
        setTimeout(() => {
          Object.keys(userInfo).forEach(key => {
            if (this.state.friendList) {
              if (
                this.state.friendList.includes(userInfo[key].author) ||
                this.props.UID.uid === userInfo[key].author
              ) {
              } else {
                delete userInfo[key];
              }
            } else {
              delete userInfo[key];
            }
          });
          this.setState({ userPosts: userInfo });
        }, 500);
      });
  }

  componentWillUnmount() {
    this.props.firebase.user(this.props.UID.uid).off();
  }

  onPostChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onPostSubmit = event => {
    event.preventDefault();
    const postEntry = this.state.image
      ? {
          postTitle: this.state.titleinput,
          username: this.state.username,
          email: this.state.email,
          author: this.props.UID.uid,
          time: F.database.ServerValue.TIMESTAMP,
          postType: this.state.postType,
          likes: 0,
          dislikes: 0,
          liked: [],
          disliked: [],
          access: []
        }
      : {
          postTitle: this.state.titleinput,
          postContent: this.state.postcontent,
          username: this.state.username,
          email: this.state.email,
          author: this.props.UID.uid,
          time: F.database.ServerValue.TIMESTAMP,
          likes: 0,
          dislikes: 0,
          liked: [],
          disliked: [],
          access: []
        };
    const key = this.props.firebase.posts().push().key;
    let userPosts = [];
    this.props.firebase.post(key).set(postEntry);
    if (this.state.image) {
      this.props.firebase.postImage(key).put(this.state.image);
    }
    this.props.firebase.user(this.props.UID.uid).on("value", snapshot => {
      const userInfo = snapshot.val();
      if (userInfo.POST) {
        userPosts = [...userInfo.POST];
      }
    });
    userPosts.push(key);
    this.props.firebase.user(this.props.UID.uid).update({ POST: userPosts });
    this.setState({
      titleinput: "",
      postcontent: "",
      image: null,
      postType: null
    });
  };

  onLikeBtn = event => {
    const key = event.target.name;
    let { userPosts } = this.state;

    if (userPosts[key].liked || userPosts[key].disliked) {
      if (userPosts[key].liked && !userPosts[key].disliked) {
        let index = userPosts[key].liked.indexOf(this.props.UID.uid);
        if (index > -1) {
        } else {
          userPosts[key].liked.push(this.props.UID.uid);
          this.props.firebase
            .post(key)
            .child("liked")
            .set(userPosts[key].liked);
          userPosts[key].likes = userPosts[key].likes + 1;
          this.props.firebase
            .post(key)
            .child("likes")
            .set(userPosts[key].likes);
        }
      } else if (!userPosts[key].liked && userPosts[key].disliked) {
        let index = userPosts[key].disliked.indexOf(this.props.UID.uid);
        if (index > -1) {
          userPosts[key].disliked.splice(index, 1);
          userPosts[key].dislikes = userPosts[key].dislikes - 1;
          userPosts[key]["liked"] = [this.props.UID.uid];
          this.props.firebase
            .post(key)
            .child("liked")
            .set(userPosts[key].liked);
          this.props.firebase
            .post(key)
            .child("disliked")
            .set(userPosts[key].disliked);
          userPosts[key].likes = userPosts[key].likes + 1;
          this.props.firebase
            .post(key)
            .child("likes")
            .set(userPosts[key].likes);
          this.props.firebase
            .post(key)
            .child("dislikes")
            .set(userPosts[key].dislikes);
        } else {
          userPosts[key]["liked"] = [this.props.UID.uid];
          this.props.firebase
            .post(key)
            .child("liked")
            .set(userPosts[key].liked);
          userPosts[key].likes = userPosts[key].likes + 1;
          this.props.firebase
            .post(key)
            .child("likes")
            .set(userPosts[key].likes);
        }
      }
      if (userPosts[key].liked && userPosts[key].disliked) {
        let likedindex = userPosts[key].liked.indexOf(this.props.UID.uid);
        if (likedindex > -1) {
        } else {
          let dislikeindex = userPosts[key].disliked.indexOf(
            this.props.UID.uid
          );
          if (dislikeindex > -1) {
            userPosts[key].disliked.splice(dislikeindex, 1);
            userPosts[key].dislikes = userPosts[key].dislikes - 1;
            userPosts[key].liked.push(this.props.UID.uid);
            this.props.firebase
              .post(key)
              .child("liked")
              .set(userPosts[key].liked);
            this.props.firebase
              .post(key)
              .child("disliked")
              .set(userPosts[key].disliked);
            userPosts[key].likes = userPosts[key].likes + 1;
            this.props.firebase
              .post(key)
              .child("likes")
              .set(userPosts[key].likes);
            this.props.firebase
              .post(key)
              .child("dislikes")
              .set(userPosts[key].dislikes);
          } else {
            userPosts[key].liked.push(this.props.UID.uid);
            this.props.firebase
              .post(key)
              .child("liked")
              .set(userPosts[key].liked);
            userPosts[key].likes = userPosts[key].likes + 1;
            this.props.firebase
              .post(key)
              .child("likes")
              .set(userPosts[key].likes);
          }
        }
      }
    } else {
      userPosts[key]["liked"] = [this.props.UID.uid];
      this.props.firebase
        .post(key)
        .child("liked")
        .set(userPosts[key].liked);
      userPosts[key].likes = userPosts[key].likes + 1;
      this.props.firebase
        .post(key)
        .child("likes")
        .set(userPosts[key].likes);
    }
    this.setState({ userPosts });
  };

  onDislikeBtn = event => {
    const key = event.target.name;
    let { userPosts } = this.state;

    if (userPosts[key].disliked || userPosts[key].liked) {
      if (userPosts[key].disliked && !userPosts[key].liked) {
        userPosts[key].disliked.push(this.props.UID.uid);
        this.props.firebase
          .post(key)
          .child("disliked")
          .set(userPosts[key].disliked);
        userPosts[key].dislikes = userPosts[key].dislikes + 1;
        this.props.firebase
          .post(key)
          .child("dislikes")
          .set(userPosts[key].dislikes);
      } else if (!userPosts[key].disliked && userPosts[key].liked) {
        let index = userPosts[key].liked.indexOf(this.props.UID.uid);
        if (index > -1) {
          userPosts[key].liked.splice(index, 1);
          userPosts[key].likes = userPosts[key].likes - 1;
          userPosts[key]["disliked"] = [this.props.UID.uid];
          this.props.firebase
            .post(key)
            .child("liked")
            .set(userPosts[key].liked);
          this.props.firebase
            .post(key)
            .child("disliked")
            .set(userPosts[key].disliked);
          userPosts[key].dislikes = userPosts[key].dislikes + 1;
          this.props.firebase
            .post(key)
            .child("likes")
            .set(userPosts[key].likes);
          this.props.firebase
            .post(key)
            .child("dislikes")
            .set(userPosts[key].dislikes);
        } else {
          userPosts[key]["disliked"] = [this.props.UID.uid];
          this.props.firebase
            .post(key)
            .child("disliked")
            .set(userPosts[key].disliked);
          userPosts[key].dislikes = userPosts[key].dislikes + 1;
          this.props.firebase
            .post(key)
            .child("dislikes")
            .set(userPosts[key].dislikes);
        }
      }
      if (userPosts[key].liked && userPosts[key].disliked) {
        let dislikedindex = userPosts[key].disliked.indexOf(this.props.UID.uid);
        if (dislikedindex > -1) {
        } else {
          let likeindex = userPosts[key].liked.indexOf(this.props.UID.uid);
          if (likeindex > -1) {
            userPosts[key].liked.splice(likeindex, 1);
            userPosts[key].likes = userPosts[key].likes - 1;
            userPosts[key].disliked.push(this.props.UID.uid);
            this.props.firebase
              .post(key)
              .child("liked")
              .set(userPosts[key].liked);
            this.props.firebase
              .post(key)
              .child("disliked")
              .set(userPosts[key].disliked);
            userPosts[key].dislikes = userPosts[key].dislikes + 1;
            this.props.firebase
              .post(key)
              .child("likes")
              .set(userPosts[key].likes);
            this.props.firebase
              .post(key)
              .child("dislikes")
              .set(userPosts[key].dislikes);
          } else {
            userPosts[key].disliked.push(this.props.UID.uid);
            this.props.firebase
              .post(key)
              .child("disliked")
              .set(userPosts[key].disliked);
            userPosts[key].dislikes = userPosts[key].dislikes + 1;
            this.props.firebase
              .post(key)
              .child("dislikes")
              .set(userPosts[key].dislikes);
          }
        }
      }
    } else {
      userPosts[key]["disliked"] = [this.props.UID.uid];
      this.props.firebase
        .post(key)
        .child("disliked")
        .set(userPosts[key].disliked);
      userPosts[key].dislikes = userPosts[key].dislikes + 1;
      this.props.firebase
        .post(key)
        .child("dislikes")
        .set(userPosts[key].dislikes);
    }
    this.setState({ userPosts });
  };

  onAddImage = event => {
    const image = event.target.files[0];
    if (image) {
      this.setState({ postType: "image", image });
    }
  };

  render() {
    const { titleinput, postcontent, image } = this.state;
    console.log(
      image
        ? titleinput === "" || postcontent === ""
        : !(titleinput === "" || postcontent === "")
    );
    let inValid = image
      ? titleinput === ""
      : titleinput === "" || postcontent === "";
    return (
      <div className={classes.pageContent}>
        <div className={classes.feeds}>
          <Link to={ROUTES.PERSONAL_PAGE} style={{ marginTop: "10px" }}>
            {this.state.username}
          </Link>
          <form
            onSubmit={this.onPostSubmit}
            className={classes.postBox}
            autoComplete="off"
          >
            <input
              className={classes.postTitleInput}
              type="text"
              name="titleinput"
              onChange={this.onPostChange}
              value={this.state.titleinput}
              placeholder="Title"
            />
            {!this.state.postType && (
              <textarea
                className={classes.postContentInput}
                type="text"
                name="postcontent"
                onChange={this.onPostChange}
                value={this.state.postcontent}
                placeholder="Post here"
                rows="2"
              />
            )}
            {this.state.postType && (
              <div className="image-added" style={{ marginTop: "5px" }}>
                Image Added!
              </div>
            )}
            <div className={classes.postSubmitBtnBox}>
              <div className="add-image-container">
                <label htmlFor="addImage" className={classes.addImageLabel}>
                  Add Image
                </label>
                <input
                  type="file"
                  id="addImage"
                  className={classes.addImageInput}
                  onChange={this.onAddImage}
                />
              </div>
              <button
                disabled={inValid}
                className={classes.postSubmitBtn}
                onSubmit={this.onPostSubmit}
                type="submit"
              >
                Post
              </button>
            </div>
          </form>
          <div className={classes.allPosts}>
            {this.state.userPosts && (
              <Feeders
                onDislikeBtn={this.onDislikeBtn}
                onLikeBtn={this.onLikeBtn}
                posts={this.state.userPosts}
                UID={this.props.UID.uid}
              />
            )}
          </div>
        </div>
        <div className={classes.friendListContent}>
          {this.state.friendList && (
            <FriendListSideBar
              {...this.props}
              friendList={this.state.friendList}
              UID={this.props.UID.uid}
            />
          )}
        </div>
      </div>
    );
  }
}

const Feeders = ({ onDislikeBtn, onLikeBtn, posts, UID }) => (
  <React.Fragment>
    {Object.keys(posts)
      .reverse()
      .map(key => (
        <PostCard
          key={key}
          postID={key}
          onDislikeBtn={onDislikeBtn}
          onLikeBtn={onLikeBtn}
          postTitle={posts[key].postTitle}
          postContent={posts[key].postContent}
          timestamp={posts[key].time}
          likes={posts[key].likes}
          dislikes={posts[key].dislikes}
          liked={posts[key].liked}
          disliked={posts[key].disliked}
          UID={UID}
          postType={posts[key].postType}
          postAuthor={posts[key].username}
        />
      ))}
  </React.Fragment>
);

const HeaderBar = () => (
  <div className={classes.navBar}>
    <h1 className={classes.navTitle}>
      <Link to={ROUTES.PROFILE_PAGE}>Chatify</Link>
    </h1>
    <SearchUser />
    <SignOut />
  </div>
);

const SearchUser = () => (
  <React.Fragment>
    <Link to={ROUTES.SEARCH_USER} className={classes.searchBtn}>
      Search
    </Link>
  </React.Fragment>
);

export default ProfilePage;
export { HeaderBar, NotLoggedIn };
