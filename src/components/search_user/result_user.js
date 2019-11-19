import React, { Component } from "react";
import "./resultUser.css";

const classes = {
  userDataContainer: "user-data-container",
  resultPanel: "result-panel",
  addFriendContainer: "add-friend-container",
  addFriendBtn: "add-friend-btn",
  userEmail: "user-email",
  userName: "user-name",
  emptyDiv: "empty-div"
};

class ResultUser extends Component {
  state = {};

  render() {
    let showButton = this.props.myID === this.props.userID ? false : true;
    console.log(">", this.props.friends);
    let addFriendText = "Add Friend";
    let friendDisable = false;
    if (this.props.friends) {
      console.log(this.props.friends.includes(this.props.userID));
      if (this.props.friends.includes(this.props.userID)) {
        addFriendText = "Friends!";
        friendDisable = true;
      }
    }
    return (
      <div className={classes.resultPanel}>
        <div className={classes.userDataContainer}>
          <p className={classes.userName}>{this.props.username}</p>
          <p className={classes.userEmail}>{this.props.email}</p>
        </div>
        <div className={classes.addFriendContainer}>
          {showButton && (
            <button
              className={classes.addFriendBtn}
              disabled={friendDisable}
              onClick={this.props.onAddFriend}
              name={this.props.userID}
            >
              {addFriendText}
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default ResultUser;
