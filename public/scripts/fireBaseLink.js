var app_fireBase = {};
// Your web app's Firebase configuration
(function () {
    var firebaseConfig = {
        apiKey: "AIzaSyDfTX3QsFADFHJHC-3Sj0sepFgLhU_l2Yc",
        authDomain: "jsfamilytree.firebaseapp.com",
        databaseURL: "https://jsfamilytree-default-rtdb.firebaseio.com/",
        projectId: "jsfamilytree",
        storageBucket: "jsfamilytree.appspot.com",
        messagingSenderId: "457390240640",
        appId: "1:457390240640:web:0c1f7be62dd65f54784765",
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    app_fireBase = firebase
})()

const auth = firebase.auth();