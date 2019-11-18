import React, { useState, useEffect } from "react";
import { HeaderBar, NotLoggedIn } from "../profile_page/";
import { Header } from "../log_in_page/";
import { withFirebase } from "../firebase/";
import "./personal_page.css";

const classes = {
  profContainer: "prof-container",
  profPic: "prof-pic",
  profName: "prof-name",
  profPage: "prof-page",
  profInfos: "prof-infos",
  profLabel: "prof-labels",
  profData: "prof-data",
  profBelowHead: "prof-below-head",
  profPostContainer: "prof-post-container"
};

const PersonalPage = props => (
  <React.Fragment>
    {props.UID ? <HeaderBar /> : <Header />}
    {props.UID ? withFirebase(PersonalPageBase)(props) : <NotLoggedIn />}
  </React.Fragment>
);

const PersonalPageBase = props => {
  const [profilePic, setProfilePic] = useState("");
  const [profInfo, setProfInfo] = useState(null);
  const [friendList, setFriendList] = useState([]);

  useEffect(() => {
    props.firebase
      .getProfileImage("profilepic.jpg")
      .getDownloadURL()
      .then(url => {
        setProfilePic(url);
      });

    props.firebase.user(props.UID.uid).on("value", snapshot => {
      setProfInfo(snapshot.val());
      console.log("GOT THE INFO: ", snapshot.val());
    });
  }, []);

  useEffect(() => {
    if (profInfo) {
      let myfriendList = [];
      profInfo.friends.map(key => {
        props.firebase.user(key).on("value", snapshot => {
          myfriendList.push(snapshot.val().username);
          setFriendList(myfriendList);
        });
      });
    }
  }, [profInfo]);

  let content = (
    <div className={classes.profPage}>
      {profInfo && (
        <ProfContainer profInfo={profInfo} profilePic={profilePic} />
      )}
      {profInfo && (
        <div className={classes.profBelowHead}>
          <ProfInfos profInfo={profInfo} friendList={friendList} {...props} />
        </div>
      )}
    </div>
  );
  return content;
};

const ProfContainer = ({ profInfo, profilePic }) => (
  <div className={classes.profContainer}>
    <img src={profilePic} className={classes.profPic} />
    <label for="profilePicUpload" className="profilePicUploadLabel">
      Upload Image
    </label>
    <input id="profilePicUpload" className="imageInput" type="file" />
    <span className={classes.profName}>{profInfo.username}</span>
  </div>
);

const ProfInfos = props => (
  <div className={classes.profInfos}>
    <div className={classes.profLabel}>E-Mail: </div>
    <div className={classes.profData}>{props.profInfo.email}</div>
    <div className={classes.profLabel}>Friend(s): </div>
    {console.log(props.friendList)}
    {props.friendList.map(key => (
      <div key={key}>{key}</div>
    ))}
  </div>
);

export default PersonalPage;
