import React, { Component } from "react";
import F from "firebase";
import "./friend_list_sidebar.css";

const classes = {
  sidePanel: "side-panel",
  chatFriendBtn: "chat-friend-btn",
  chatBox: "chat-box",
  chatTitle: "chat-title",
  chatTitleName: "chat-title-name",
  chatBody: "chat-body",
  chatCloseBtn: "chat-close-btn",
  chatForm: "chat-form",
  chatInput: "chat-input",
  chatSendBtn: "chat-send-btn",
  chatTextBubble: "chat-text-bubble",
  myText: "my-text",
  friendText: "friend-text",
  myTextContent: "my-text-content",
  friendTextContent: "friend-text-content"
};

class FriendListSideBar extends Component {
  state = {
    friendList: {},
    currChatFriend: null,
    currChatBox: false,
    chattext: "",
    fromMeChats: {},
    toMeChats: {},
    singleChatThread: null
  };

  componentDidMount() {
    this.fetchFriends();
    // if (this.state.currChatFriend) {
    //   this.fetchChats();
    // }
    this.props.firebase
      .chat(this.props.UID)
      .orderByChild("time")
      .limitToLast(50)
      .on("value", snapshot => {
        let save = snapshot.val();
        if (this.state.currChatFriend) {
          if (save[this.state.currChatFriend]) {
            console.log(save[this.state.currChatFriend]);
          }
          if (!save) {
            save = {};
          }
          this.setState({ toMeChats: save[this.state.currChatFriend] });
        }
        setTimeout(() => {
          let { singleChatThread, fromMeChats, toMeChats } = this.state;
          singleChatThread = { ...fromMeChats, ...toMeChats };
          let sortedSingleChatThread = Object.keys(singleChatThread).sort(
            function(a, b) {
              return (
                new Date(singleChatThread[a].time) -
                new Date(singleChatThread[b].time)
              );
            }
          );
          this.setState({ singleChatThread: sortedSingleChatThread });
          console.log(this.state.singleChatThread);
          console.log(this.state.fromMeChats);
          console.log(this.state.toMeChats);
        }, 500);
      });
    console.log(" > ADDED");
  }

  onChat = event => {
    // if (this.state.currChatBox) {
    //   this.setState({ currChatBox: false, fromMeChats: [], toMeChats: [] });
    // }
    this.setState({ currChatBox: true, currChatFriend: event.target.name });
    this.fetchChats();
  };

  onChatClose = event => {
    this.setState({
      currChatBox: false,
      fromMeChats: {},
      toMeChats: {},
      singleChatThread: null
    });
  };

  fetchChats() {
    setTimeout(() => {
      this.props.firebase
        .chat(this.props.UID)
        .child(this.state.currChatFriend)
        .orderByChild("time")
        .limitToLast(50)
        .on("value", snapshot => {
          let save = snapshot.val();
          if (!save) {
            save = {};
          }
          this.setState({ toMeChats: save });
        });
    }, 100);
    setTimeout(() => {
      this.props.firebase
        .chat(this.state.currChatFriend)
        .child(this.props.UID)
        .orderByChild("time")
        .limitToLast(50)
        .on("value", snapshot => {
          let save = snapshot.val();
          if (!save) {
            save = {};
          }
          this.setState({ fromMeChats: save });
        });
    }, 100);
    setTimeout(() => {
      let { singleChatThread, fromMeChats, toMeChats } = this.state;
      singleChatThread = { ...fromMeChats, ...toMeChats };
      let sortedSingleChatThread = Object.keys(singleChatThread).sort(function(
        a,
        b
      ) {
        return (
          new Date(singleChatThread[a].time) -
          new Date(singleChatThread[b].time)
        );
      });
      this.setState({ singleChatThread: sortedSingleChatThread });
      console.log(this.state.singleChatThread);
      console.log(this.state.fromMeChats);
      console.log(this.state.toMeChats);
    }, 500);
  }

  fetchFriends() {
    let { friendList } = this.state;
    this.props.friendList.map(friendKey => {
      this.props.firebase.user(friendKey).on("value", snapshot => {
        const userInformation = snapshot.val();
        friendList[friendKey] = userInformation.username;
        this.setState({ friendList });
      });
    });
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSend = event => {
    event.preventDefault();
    // console.log(
    //   this.props.UID,
    //   " is sending message ",
    //   this.state.chattext,
    //   " to ",
    //   this.state.currChatFriend
    // );
    let chatEntry = {
      text: this.state.chattext,
      time: F.database.ServerValue.TIMESTAMP
    };
    this.props.firebase
      .chat(this.state.currChatFriend)
      .child(this.props.UID)
      .push(chatEntry);
    this.setState({ chattext: "" });
    setTimeout(() => {
      this.fetchChats();
    }, 100);
  };

  render() {
    return (
      <div className={classes.sidePanel}>
        {Object.keys(this.state.friendList).map(key => (
          <button
            className={classes.chatFriendBtn}
            key={key}
            name={key}
            username={this.state.friendList[key]}
            onClick={this.onChat}
          >
            {this.state.friendList[key]}
          </button>
        ))}

        {this.state.currChatBox && (
          <div className={classes.chatBox}>
            <div className={classes.chatTitle}>
              <span className={classes.chatTitleName}>
                {this.state.friendList[this.state.currChatFriend]}
              </span>
              <button
                className={classes.chatCloseBtn}
                onClick={this.onChatClose}
              >
                X
              </button>
            </div>
            <div className={classes.chatBody}>
              {this.state.singleChatThread && (
                <DisplayChats
                  fromMeChats={this.state.fromMeChats}
                  toMeChats={this.state.toMeChats}
                  singleChatThread={this.state.singleChatThread}
                />
              )}
            </div>
            <form
              className={classes.chatForm}
              onSubmit={this.onSend}
              autoComplete="off"
            >
              <input
                className={classes.chatInput}
                type="text"
                placeholder="Enter Text..."
                name="chattext"
                onChange={this.onChange}
                value={this.state.chattext}
              />
              <button
                className={classes.chatSendBtn}
                type="submit"
                onSubmit={this.onSend}
              >
                >
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }
}

const DisplayChats = ({ fromMeChats, toMeChats, singleChatThread }) => (
  <React.Fragment>
    {console.log("fromMeChats: ", fromMeChats)}
    {console.log("toMeChats: ", toMeChats)}
    {console.log("singleChatThread: ", singleChatThread)}
    {singleChatThread.map(key => (
      <div className={classes.chatTextBubble} key={key}>
        {Object.keys(fromMeChats).includes(key) ? (
          <div className={classes.myText} key={key}>
            <span className={classes.myTextContent}>
              {fromMeChats[key].text}
            </span>
          </div>
        ) : (
          <div className={classes.friendText} key={key}>
            <span className={classes.friendTextContent}>
              {toMeChats[key].text}
            </span>
          </div>
        )}
      </div>
    ))}
    {/* {console.log("hmm", singleChatThread)}
    {singleChatThread.map(key => (
      <div>
        {Object.keys(fromMeChats).includes(key)} ?
        {console.log(">", fromMeChats[key].text)}
        <div>{fromMeChats[key].text}</div> :
        {console.log(">>", toMeChats[key].text)}
        <div style={{ background: "red" }}>{toMeChats[key].text}</div>
      </div>
    ))} */}
  </React.Fragment>
);

export default FriendListSideBar;
