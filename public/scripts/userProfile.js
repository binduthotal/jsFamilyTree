var strVar = "";
var divContent;
var divAddProfile, divEditProfile;
var uid = null;
var uName, email, mobile, photo;

// function onWindowLoad() {
var firebase = app_fireBase;

firebase.auth().onAuthStateChanged(function (user) {
    // const userI = firebase.auth().currentUser;
    if (user != null) {
        uName = user.displayName;
        photo = user.photoURL,
            email = user.email;
        mobile = user.phoneNumber;
        uid = user.uid;
    }
    else {
        uid = null;
        //redirect to login page
        window.location.replace("index.html");
    }

    document.getElementById("displayName").innerHTML = "Hello  " + uName;
    divContent = addProfile();

    function addProfile() {
        strVar += "      <div id=\"profile-card\">"
        strVar += "         <div class=\"profile-infoLabel\">Profile Details</div>";
        strVar += "         <table class=\"profile-infoTable\" id=\"profile-tableId\">";
        strVar += "                 <tr><td>Full Name</td><td>" + uName + "</td></tr>";
        strVar += "                 <tr><td>Email ID</td><td>" + email + "</td></tr>";
        strVar += "                </tbody>";
        strVar += "             </table>";
        strVar += "             <div class=\"profile-editButton\" onClick='editProfile()'>EDIT</div>";
        strVar += "          </div>";

        return strVar;
    }

    divAddProfile = d3.select("body")
        .append('div')
        .attr("class", "div-user-profile")

    divAddProfile.html(divContent);

});

function editProfile() {
    strVar = "";
    var iTable = document.getElementById("profile-card");
    iTable.style.display = "none";
    var divContent2 = edit();

    function edit() {
        var user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: user.displayName,
            photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(function () {
            // Update successful.
        }).catch(function (error) {
            // An error happened.
        });

        strVar += "      <div id=\"profile-card\">"
        strVar += "         <div class=\"profile-infoLabel\">Profile Details</div>";
        strVar += "         <table class=\"profile-infoTable\">";
        strVar += "             <tbody>";
        strVar += "                 <tr><td><label>Full Name</label</td><td><input id=\"changeUserName\" type=\"text\" maxlength=\"15\"  Value= \"" + user.displayName + "\"></td></tr>"
        strVar += "                     <tr><td>Email ID</td><td>" + email + "</td></tr>";
        strVar += "                </tbody>";
        strVar += "             </table>";
        strVar += "             <div class=\"profile-saveButton\" onClick='saveProfile()'>SAVE CHANGES</div>";
        strVar += "          </div>";

        return strVar;
    }

    divEditProfile = d3.select("body")
        .append('div')
        .attr("class", "div-edit-user-profile")

    divEditProfile.html(divContent2);
}


function saveProfile() {
    var updateName, updatemail;
    updateName = document.getElementById("changeUserName").value;

    var user = firebase.auth().currentUser;

    if ((updateName == null) || (!updateName)) {
        updateName = user.displayName;
    }

    //Update displayName And PhotoUrl
    user.updateProfile({

        displayName: updateName,
        photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function () {
        // Update successful.
    }).catch(function (error) {
        // An error happened.
    });

    window.location.reload();
}

// logOut
function logOut() {
    firebase.auth().signOut();
}