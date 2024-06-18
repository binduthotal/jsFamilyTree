var attrs = {
    root: null,
    funcs: {
        addDob: null,
        addBloodGrp: null,
        addMobileNo: null,
        saveDetails: null,
        editMethod: null,
        addImage: null
    },
}
const id = sessionStorage.getItem('personId');
var childData, dbRef, condition;

function onWindowLoad(){
    dbRef = firebase.database().ref('users');
    dbRef.once("value", snap => {
        snap.forEach(childSnap => {
            childData = childSnap.val();
    
            attrs.root = childData;
            attrs.funcs.saveDetails = saveDetails;
            attrs.funcs.editMethod = editMethod;
            attrs.funcs.addImage = addImage;
    
            var root = d3.hierarchy(attrs.root);
            console.log("root: ", root)
    
                var uniq = 1;
                addPropertyRecursive('uniqueIdentifier', function (v) { return uniq++; }, root);
        
                function addPropertyRecursive(propertyName, propertyValueFunction, element) {
                   
                        element[propertyName] = propertyValueFunction(element);
        
                    if (element.children) {
                        element.children.forEach(function (v) {
                            addPropertyRecursive(propertyName, propertyValueFunction, v)
                        })
                    }
                    if (element._children) {
                        element._children.forEach(function (v) {
                            addPropertyRecursive(propertyName, propertyValueFunction, v)
                        })
                    }
        
                    if (element.data) {
                        if (element.data.noOfSpouses > 0) {
                            element.data.spouses.forEach(function (v) {
                                addPropertyRecursive(propertyName, propertyValueFunction, v);
                            })
                        }
                    }
                }//addPropertyRecursive()
        
                var divContent = d3.select("body")
                    .append('div')
                    .attr('class', 'divProfile')
        
                editProfile();
           
    
            function editProfile() {
                if(id == 1)
                {
                    getProfile(root,id)
                }
                if (!root.children) {
                    if (!root.uniqueIdentifier == id) {
                        root.children = attrs.root._children;
                    }
                }
                if (root.children) {
                    var returnValue = 0;
                    root.children.forEach(function (ch) {
                        returnValue = getProfile(ch, id);
                        if (returnValue)
                            return;
                    });
                    return
                }
            }
    
            function getProfile(d, id) {
    
                if (d.uniqueIdentifier == id) {
                    var strVar = "";
                    // strVar +="      <main class=\"page\">"
                    // //input file -->
                    // strVar +="       <div class=\"box\">"
                    // strVar +="          <input type=\"file\" id=\"file-input\" onchange='attrs.funcs.addImage(" + d.uniqueIdentifier + ")'>"
                    // strVar += "       <\/div>"
                    // //<!-- leftbox -->
                    // strVar +="       <div class=\"box-2\">"
                    // strVar +="          <div class=\"result\"></div>"
                    // strVar += "       <\/div>"
                    // strVar +="       <div class=\"box-3 img-result\">"
                    // strVar +="          <img id=\"img-id\" class=\"cropped\" src=\"\" alt=\"\">"
                    // strVar += "       <\/div>"
                    // // //<!-- input file -->
                    // strVar +="      <div class=\"box\">"
                    // strVar +="          <div class=\"options hide\">"
                    // // strVar  +="             <label>Width</label>"
                    // strVar +="               <input type=\"number\" class=\"img-w hide\" value=\"300\" min=\"100\" max=\"1200\">"
                    // strVar +="          </\div>"
                    // // // //<!-- save btn -->
                    // strVar +="           <button class=\"btn save hide\">save</button>"
                    // // strVar +="              <a href=\"\" class=\"btn download hide\">Download</a>"
                    // strVar +="          </\div>"
                    // strVar += "      <\/main>"
                    if(d.data.imgURL)
                    {
    
                    }
                    strVar += "     "
                    strVar += "     <div class=\"img-div img-result\">"
                    if(d.data.imgURL)
                        strVar += "             <img class=\"cropped\" id='img-id' src="+d.data.imgURL+" alt=\"\" width=\"180\" height=\"200\">";
                    else
                        strVar += "             <img class=\"cropped\" id='img-id' src=\"imgs/image.png\" alt=\"\" width=\"180\" height=\"200\">";
                    strVar += "         <div class=\"img-btn-div\">"
                    strVar += "             <label class=\"custom-file-upload\"><input id='file-input' type=\"file\" onchange='attrs.funcs.addImage(" + d.uniqueIdentifier + ")'>Upload Photo<\/label>"
                    // strVar += "             <button id='btn-upload-img' onClick='attrs.funcs.addImage(" + d.uniqueIdentifier + ")'>Upload Photo<\/button>";
                    // strVar += "             <input id='file-input' type=\"file\" onchange='attrs.funcs.addImage(" + d.uniqueIdentifier + ")'>";
                    strVar += "         <\/div>"
                    strVar += "     <\/div>"
                    strVar += "    <div class=\"tooltip-desc\">";
                    strVar += "       <div class=\"person-details-row\">"
                    strVar += "         <div class=\"col-25\">";
                    strVar += "             <label>Name:  </label>";
                    strVar += "         </\div> "
                    strVar += "         <div class=\"col-75\"> "
                    strVar += "             <p class=\"name\">" + d.data.name + " <\/p>";
                    strVar += "         </\div>"
                    strVar += "       </\div>"
                    strVar += "       <div class=\"person-details-row\">"
                    strVar += "         <div class=\"col-25\">";
                    strVar += "             <label>Gender:  </label>";
                    strVar += "         </\div> "
                    strVar += "         <div class=\"col-75\"> "
                    strVar += "             <p class=\"gender\">" + d.data.gender + " <\/p>"
                    strVar += "         </\div>"
                    strVar += "       </\div>"
                    strVar += "       <div class=\"person-details-row\">"
                    strVar += "         <div class=\"col-25\">";
                    strVar += "             <label>Date of Birth:  </label>";
                    strVar += "         </\div> "
                    strVar += "         <div class=\"col-75\" > "
                    if(d.data.dob){
                        strVar += "             <p class=\"dob\" id=\"p-dob-id\">" + d.data.dob +"<\/p>";
                        strVar += "             <input class=\"dob-row\" type=\"date\" id=\"dob-id\" name=\"dob\"  value=\"2021-01-01\" style=\"display:none\">";
                    }
                    else{
                        strVar += "             <input class=\"dob-row\" type=\"date\" id=\"dob-id\" name=\"dob\" value=\"2021-01-01\">";
                    }
                    strVar += "         </\div>"
                    strVar += "       </\div>"
                    strVar += "       <div class=\"person-details-row\">"
                    strVar += "         <div class=\"col-25\">";
                    strVar += "             <label>Blood Group:  </label>";
                    strVar += "         </\div> "
                    strVar += "         <div class=\"col-75\"> "
                    if(d.data.bloodGroup){
                        strVar += "             <p class=\"bloodGrp\" id=\"p-bloodGrp-id\">" + d.data.bloodGroup +"<\/p>";
    
                        strVar += "            <select class=\"bloodGrp-row\" id=\"bloodGrp-id\" name=\"bloodGrp\" style=\"display:none\">";
                        strVar += "              <option value=\"A+\" selected>A+</option>";
                        strVar += "              <option value=\"A-\">A-</option>";
                        strVar += "              <option value=\"B+\">B+</option>";
                        strVar += "              <option value=\"B-\">B-</option>";
                        strVar += "              <option value=\"O+\">O+</option>";
                        strVar += "              <option value=\"O-\">O-</option>";
                        strVar += "              <option value=\"AB+\">AB+</option>";
                        strVar += "              <option value=\"AB-\">AB-</option>";
                        strVar += "            </select>";
                    }
                    else{
                        strVar += "            <select class=\"bloodGrp-row\" id=\"bloodGrp-id\" name=\"bloodGrp\">";
                        strVar += "              <option value=\"A+\" selected>A+</option>";
                        strVar += "              <option value=\"A-\">A-</option>";
                        strVar += "              <option value=\"B+\">B+</option>";
                        strVar += "              <option value=\"B-\">B-</option>";
                        strVar += "              <option value=\"O+\">O+</option>";
                        strVar += "              <option value=\"O-\">O-</option>";
                        strVar += "              <option value=\"AB+\">AB+</option>";
                        strVar += "              <option value=\"AB-\">AB-</option>";
                        strVar += "            </select>";
                    }
                    strVar += "         </\div>"
                    strVar += "       </\div>"
                    strVar += "       <div class=\"person-details-row\">"
                    strVar += "         <div class=\"col-25\">";
                    strVar += "             <label>Phone:  </label>";
                    strVar += "         </\div> "
                    strVar += "         <div class=\"col-75\"> "
                    if(d.data.phoneNo)
                    {
                        strVar += "             <p class=\"phone\" id=\"p-phoneNo-id\">" + d.data.phoneNo +" <\/p>";
                        strVar += "             <input class=\"phone-row\" type=\"tel\" id=\"phoneNo-id\" style=\"display:none\" name=\"phone\" value=\"012-345-6789\">";
                    }
                        else
                        strVar += "             <input class=\"phone-row\" type=\"tel\" id=\"phoneNo-id\" name=\"phone\" value=\"012-345-6789\">";
                    strVar += "         </\div>"
                    strVar += "       </\div>"
    
                    if (d.data.noOfSpouses > 0) {
                        strVar += "       <div class=\"person-details-row\">"
                        strVar += "         <div class=\"col-25\">";
                        strVar += "             <label>Spouse:  </label>";
                        strVar += "         </\div> "
                        strVar += "         <div class=\"col-75\"> "
                        strVar += "             <p class=\"spouse\">" + getSpouseName(d) + " <\/p>";
                        strVar += "         </\div>"
                        strVar += "       </\div>"
                        strVar += "       <div class=\"person-details-row\">"
                        strVar += "         <div class=\"col-25\">";
                        strVar += "             <label>Children:  </label>";
                        strVar += "         </\div> "
                        strVar += "         <div class=\"col-75\"> "
                        strVar += "             <p class=\"children\">" + getChildCount(d) + " <\/p>";
                        strVar += "         </\div>"
                        strVar += "         <div class=\"col-55\">";
                        strVar += "             <p class=\"children-name\">" + getChildrenNames(d) + "<\p>";
                        strVar += "         </\div> "
                        strVar += "       </\div>"
    
                        if (d.data.spouses.length > 1) {
                            strVar += "       <div class=\"person-details-row\">"
                            strVar += "         <div class=\"col-25\">";
                            strVar += "             <label>Spouse:  </label>";
                            strVar += "         </\div> "
                            strVar += "         <div class=\"col-75\"> "
                            strVar += "             <p class=\"spouse\">" + getSecondSpouseName(d) + " <\/p>";
                            strVar += "         </\div>"
                            strVar += "       </\div>"
                            strVar += "       <div class=\"person-details-row\">"
                            strVar += "         <div class=\"col-25\">";
                            strVar += "             <label>Children:  </label>";
                            strVar += "         </\div> "
                            strVar += "         <div class=\"col-75s\"> "
                            strVar += "             <p class=\"children\">" + getSecondSpouseChildCount(d) + " <\/p>";
                            strVar += "         </\div>"
                            strVar += "         <div class=\"col-55\">";
                            strVar += "             <p class=\"children-name\">" + getSecondSpouseChildrenNames(d) + "<\p>";
                            strVar += "         </\div> "
                            strVar += "       </\div>"
                        }
                    }
                    strVar += "<\/div>";
                    strVar += "<div class=\"save-btn\">";
                        strVar += "     <button id=\"editProfile-btn\" onClick='attrs.funcs.editMethod("+d.uniqueIdentifier+")'>Edit Profile</button>";
                        strVar += "     <button id=\"saveProfile-btn\" onClick='attrs.funcs.saveDetails("+d.uniqueIdentifier+")'>Save Profile</button>";
                    strVar += "<\/div>";
                    strVar += "";
    
                    // var content = strVar;
                    divContent.html(strVar);
    
                    condition = "true";
                }
    
                if (condition == "true")
                    return 1;
    
                if (d._children) {
                    d._children.forEach(function (ch) {
                        ch.parent = d;
                        getProfile(ch, id);
                    })
                } else if (d.children) {
                    d.children.forEach(function (ch) {
                        ch.parent = d;
                        getProfile(ch, id);
                    });
                };//End else if 
            }
    
            function addImage(id) {
           
                var fileInp = document.querySelector('[type="file"]');
    
                var filterType = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
                var imgURL;
                // Check if any file is selected.
                var selectedFile = event.target.files[0];
                var reader = new FileReader();
                var fsize = event.target.files[0].size;
                var file = Math.round((fsize / 1024));
                reader.onload = function (event) {
    
                    var image = new Image();
                    image.onload = function () {
                        var canvas = document.createElement("canvas");
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(image, 0, 0);
    
                        // var MAX_WIDTH = 400;
                        // var MAX_HEIGHT = 100;
                        // var width = image.width;
                        // var height = image.height;
    
                        // if (width > height) {
                        //   if (width > MAX_WIDTH) {
                        //     height *= MAX_WIDTH / width;
                        //     width = MAX_WIDTH;
                        //   }
                        // } else {
                        //   if (height > MAX_HEIGHT) {
                        //     width *= MAX_HEIGHT / height;
                        //     height = MAX_HEIGHT;
                        //   }
                        // }
                        var width = 180;
                        var height = 180;
                        canvas.width = width;
                        canvas.height = height;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(image, 0, 0, width, height);
    
                        document.getElementById("img-id").src = canvas.toDataURL();
                    }
                    image.src = event.target.result;
                    imgURL = event.target.result;
    
                appendImageToDatabase(id, imgURL)
                }
                reader.readAsDataURL(selectedFile);
                
            }
    
            function appendImageToDatabase(id,URL){
                if(id == 1){
                    insertImg(root, id, URL)
                }
                if (!root.children) {
                    if (!root.uniqueIdentifier == id) {
                        root.children = attrs.root._children;
                    }
                }
                if (root.children) {
                    root.children.forEach(function (ch) {
                        var d = ch;
                        insertImg(ch, id, URL);
                    });
                }
    
                firebase.database().ref('users/' + 0).update(attrs.root);
    
                function insertImg(d, id, URL){
                    if (d.uniqueIdentifier == id) {
                        d.data["imgURL"] = URL;
                        
                        condition = true;
                    }
        
                    if(condition ==  true)
                        return
        
                    if (d._children) {
                        d._children.forEach(function (ch) {
                            ch.parent = d;
                            insertImg(ch, id, URL);
                        })
                    } else if (d.children) {
                        d.children.forEach(function (ch) {
                            ch.parent = d;
                            insertImg(ch, id, URL);
                        });
                    };
                }
            }
         
            function getSpouseName(d) {
                var spouseName = [];
                var counter = 0;
                d.data.spouses.forEach(name => {
                    if (counter == 0) {
                        spouseName = name.sname;
                    }
                    counter++;
                });
                return spouseName;
            }
    
            function getChildCount(d) {
                var childCount = 0;
                if (d.data.noOfKids == 0) {
                    return "No Children";
                }
                else {
                    if (d.data.spouses.length == 1)
                        return d.data.noOfKids;
                    else
                        d.data.children.forEach(child => {
                            d.data.spouses.forEach(spouse => {
                                var str, strlen;
                                strlen = spouse.suniqueid.length;
                                str = spouse.suniqueid.substring(strlen - 1)
                                if (str == 1 && child.childOf == 1) {
                                    childCount++;
                                }
                            })
    
                        })
                    if (childCount == 0)
                        return "No Children";
                    else
                        return childCount;
                }
            }
    
            function getChildrenNames(d) {
                var namesList = [];
                var counter = 0;
                if (!d.data.children)
                    return " ";
    
                d.data.children.forEach(child => {
                    d.data.spouses.forEach(spouse => {
                        var str, strlen;
                        strlen = spouse.suniqueid.length;
                        str = spouse.suniqueid.substring(strlen - 1)
                        if (str == 1 && child.childOf == 1) {
                            namesList.push(child.name);
                        }
                    })
    
                })
    
                if (namesList.length == 0)
                    return " ";
                else
                    return '<ul><li>' + namesList.join("</li><li>") + '</li></ul>';
            }
    
            function getSecondSpouseName(d) {
                var spouseName = [];
                var counter = 0;
                d.data.spouses.forEach(name => {
                    if (counter > 0)
                        spouseName = name.sname;
                    counter++;
                });
                return spouseName;
            }
    
            function getSecondSpouseChildCount(d) {
                var childCount = 0;
    
                if (d.data.noOfKids == 0) {
                    return " ";
                }
                else {
                    d.data.children.forEach(child => {
                        d.data.spouses.forEach(spouse => {
                            var str, strlen;
                            strlen = spouse.suniqueid.length;
                            str = spouse.suniqueid.substring(strlen - 1)
                            if (str == 2 && child.childOf == 2) {
                                childCount++;
                            }
                        })
    
                    })
                    if (childCount == 0)
                        return "No Children";
                    else
                        return childCount;
                }
            }
    
            function getSecondSpouseChildrenNames(d) {
                var namesList = [];
                var counter = 0;
    
                if (!d.data.children)
                    return " ";
    
                d.data.children.forEach(child => {
                    d.data.spouses.forEach(spouse => {
                        var str, strlen;
                        strlen = spouse.suniqueid.length;
                        str = spouse.suniqueid.substring(strlen - 1)
                        if (str == 2 && child.childOf == 2) {
                            namesList.push(child.name);
                        }
                    })
                });
                if (namesList.length == 0)
                    return " ";
                else
                    return '<ul><li>' + namesList.join("</li><li>") + '</li></ul>';
            }
    
            function editMethod(){
                document.getElementById("p-dob-id").style.display = "none";
                document.getElementById("p-bloodGrp-id").style.display = "none";
                document.getElementById("p-phoneNo-id").style.display = "none";
    
    
                document.getElementById("dob-id").style.display = "inline";
                document.getElementById("bloodGrp-id").style.display = "inline";
                document.getElementById("phoneNo-id").style.display = "inline";
                
            }
    
            function saveDetails(personId){
                var dob,bloodGroup,phoneNo;
    
                dob = document.getElementById("dob-id").value;
                bloodGroup = document.getElementById("bloodGrp-id").value;
                phoneNo = document.getElementById("phoneNo-id").value;
                var details = {
                    "dob": dob,
                    "bloodGrp": bloodGroup,
                    "phoneNo": phoneNo
                }
    
                if(id == 1)
                {
                    insertDetails(root,id, details)
                }
                          
                if (!root.children) {
                    if (!root.uniqueIdentifier == id) {
                        root.children = attrs.root._children;
                    }
                }
                if (root.children) {
                    root.children.forEach(function (ch) {
                        var d = ch;
                        insertDetails(ch, id, details);
                    });
                }

                firebase.database().ref('users/' + 0).set(attrs.root);
    
                editProfile();
            
            }
    
            function insertDetails(d, id, details){
                var dob = details.dob;
                var bloodGroup = details.bloodGrp;
                var phoneNo = details.phoneNo;
    
                         
                if (d.uniqueIdentifier == id) {
                  
                    d.data["dob"] = dob;
                    d.data["bloodGroup"] = bloodGroup;
                    d.data["phoneNo"] = phoneNo;
    
                    condition = true;
                }
    
                if(condition ==  true)
                    return
    
                if (d._children) {
                    d._children.forEach(function (ch) {
                        ch.parent = d;
                        insertDetails(ch, id, details);
                    })
                } else if (d.children) {
                    d.children.forEach(function (ch) {
                        ch.parent = d;
                        insertDetails(ch, id, details);
                    });
                };
            }
    
        })
    })
}

