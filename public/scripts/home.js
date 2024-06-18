var params = {
    selector: "#svgChart",
    chartWidth: window.innerWidth,
    chartHeight: window.innerHeight + 40,
    data: null,
    funcs: {
        showMySelf: null,
        search: null,
        closeSearchBox: null,
        clearResult: null,
        findInTree: null,
        reflectResults: null,
        departmentClick: null,
        back: null,
        toggleFullScreen: null,
        locate: null,
        addSpouseBox: null,
        addChildBox: null,
        closeSpouseBox: null,
        closeChildBox: null,
        expandAll: null,
        collapseAll: null,
        fitToCenter: null,
        logOut: null
    },
}

function onWindowLoad() {
    var imgURL,myVar,locateId;
    auth.onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user.displayName;
            email = user.email;
            uid = user.uid;
        }
        else {
            uid = null;
            //redirect to login page
            window.location.replace("index.html");
        }
        document.getElementById("displayName").innerHTML = "Hello" + "  " + currentUser;
    })

        myVar = setTimeout(showPage, 3000);

    function showPage() {
        document.getElementById("loader").style.display = "none";
        document.getElementById("full-container").style.display = "block";
      }

    function logOut() {
        auth.signOut();
    }
    params.logOut = logOut;

    var dbRef = firebase.database().ref('users');
    var childData;

    dbRef.on("value", snap => {
        snap.forEach(childSnap => {
            childData = childSnap.val();

            drawOrganizationChart(params);

            function drawOrganizationChart() {

                listen();

                params.funcs.fitToCenter = fitToCenter;
                params.funcs.expandAll = expandAll;
                params.funcs.search = searchUsers;
                params.funcs.closeSearchBox = closeSearchBox;
                params.funcs.findInTree = findInTree;
                params.funcs.clearResult = clearResult;
                params.funcs.reflectResults = reflectResults;
                params.funcs.addSpouseBox = addSpouseBox;
                params.funcs.addChildBox = addChildBox;
                params.funcs.closeToolTip = closeToolTip;
                params.funcs.closeImage = closeImage;
                params.funcs.closeSpouseBox = closeSpouseBox;
                params.funcs.closeChildBox = closeChildBox;
                params.funcs.addSpouseName = addSpouseName;
                params.funcs.addChildName = addChildName;
                params.funcs.spouseRequestToAdmin = spouseRequestToAdmin;
                params.funcs.childRequestToAdmin = childRequestToAdmin;
                params.funcs.getDropDownSpouse = getDropDownSpouse;
                params.funcs.locate = locate;
                params.funcs.addImage = addImage;
                params.funcs.editMethod = editMethod;
                params.funcs.saveDetails = saveDetails;
                params.funcs.closeProfile = closeProfile;
                params.funcs.saveSpouseProfileDetails = saveSpouseProfileDetails;


                var attrs = {
                    EXPAND_SYMBOL: '\uf067',
                    COLLAPSE_SYMBOL: '\uf068',
                    selector: params.selector,
                    root: childData,
                    width: params.chartWidth,
                    height: params.chartHeight,
                    index: 0,
                    nodePadding: 9,
                    collapseCircleRadius: 10,
                    nodeHeight: 120,
                    nodeWidth: 380,
                    duration: 750,
                    rootNodeTopMargin: 20,
                    minMaxZoomProportions: [0.07, 8],
                    linkLineSize: 180,
                    collapsibleFontSize: '10px',
                    userIcon: '\uf007',
                    nodeStroke: "#ffffff",
                    nodeStrokeWidth: '2px'
                }
                var dynamic = {}
                dynamic.nodeImageWidth = attrs.nodeHeight * 100 / 140;
                dynamic.nodeImageHeight = attrs.nodeHeight - 2 * attrs.nodePadding;
                dynamic.nodeTextLeftMargin = attrs.nodePadding * 2 + dynamic.nodeImageWidth
                dynamic.rootNodeLeftMargin = attrs.width / 2;
                dynamic.nodePositionNameTopMargin = attrs.nodePadding + 8 + dynamic.nodeImageHeight / 4 * 1;
                dynamic.nodeChildCountTopMargin = attrs.nodePadding + 14 + dynamic.nodeImageHeight / 4 * 3;

                //********************  TREE LAYOUT  ***********************
                var treeLayout = d3.tree().nodeSize([attrs.nodeWidth + 40, attrs.nodeHeight]);

                // ******************* ZOOM BEHAVIORS **********************
                    var zoomBehaviours = d3.zoom()
                    .scaleExtent(attrs.minMaxZoomProportions)
                    .on("zoom", redraw);

                //********************  ADD SVG  ***********************
                var svg = d3.select(attrs.selector)
                    .append("svg")
                    .attr("width", attrs.width)
                    .attr("height", attrs.height)
                    .call(zoomBehaviours)
                    .append("g")
                    .attr("transform", "translate(" + (attrs.width - 350) / 2 + "," + 150 + ")");

                  
                //****************** ROOT NODE WORK USING HIERARCHY ************************
                var root = d3.hierarchy(attrs.root);

                //****************** TO GET UNIQUEIDENTIFIER VALUE ************************
                // adding unique values to each node recursively
                var uniq = 1;
                addPropertyRecursive('uniqueIdentifier', function (v) { return uniq++; }, root);

                root.x0 = 0;
                root.y0 = attrs.height / 2;

                //******************  EXPAND NODES ****************** 
                expand(attrs.root);

                //******************  COLLAPSE AFTER SECOND LEVEL  FUNCTION CALL ****************** 
                if (root.children) {
                    root.children.forEach(collapse);
                }

                //******************  CALLING UPDATE FUNCTION ****************** 
                update(root);

                
                //****************** APPENDING DIV FOR TOOLTOP ************************
                var tooltip = d3.select("body")
                    .append('div')
                    .attr('class', 'customTooltip-wrapper');

                //****************** APPENDING DIV FOR IMAGE EXPAND ************************
                var imageContent = d3.select("body")
                    .append('div')
                    .attr('class', 'divProfileImage')

                //****************** APPENDING ADD SPOUSE DIV FOR TOOLTOP ************************
                var divAddSpouseTooltip = d3.select("body")
                    .append('div')
                    .attr('class', 'add-spouse')

                //****************** APPENDING ADD CHILD DIV FOR TOOLTOP ************************
                var divAddChildTooltip = d3.select("body")
                    .append('div')
                    .attr('class', 'add-child')

                //****************** APPENDING EDIT PROFILE DIV  ************************
                var divContent = d3.select("body")
                    .append('div')
                    .attr('class', 'divProfile')
                    .attr('id',"profileId")

                //******************  UPDATE FUNCTION ****************** 
                function update(source, param) {
                    var treeData = treeLayout(root);
                    var nodes = treeData.descendants(),
                        links = treeData.descendants().slice(1);

                    nodes.forEach(function (d) { d.y = d.depth * attrs.linkLineSize; });

                    //******************  UPDATE THE NODES ****************** 
                    var node = svg.selectAll("g.node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++attrs.index);
                        });

                    var nodeEnter = node.enter()
                        .append("g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.x0 + "," + source.y0 + ")";
                        })

                    var nodeGroup = nodeEnter.append("g")
                        .attr("class", "node-group")

                    nodeGroup.append("rect")
                        .attr("width", attrs.nodeWidth)
                        .attr("height", attrs.nodeHeight)
                        .attr("class", function (d) {
                            var res = "";
                            if (d.data.isLoggedUser)
                                res += 'nodeRepresentsCurrentUser ';
                            res += d._children || d.children ? "nodeHasChildren" : "nodeDoesNotHaveChildren";
                            return res;
                        });

                    //******************  TEXT INSEDE RECTANGLE NODES ****************** 

                    //********* PERSON PHOTO ************ 

                    var svgImg = nodeGroup.append("svg:image")
                        .attr("xlink:href", function (d) {
                            if (d.data.imgURL)
                                return d.data.imgURL;
                            else
                                return "imgs/user-profile.png";
                        })
                        .attr("x", dynamic.nodeTextLeftMargin - 90)
                        .attr("y", attrs.nodePadding)
                        .attr("width", 50)
                        .attr("height", 50)
                        .attr('class', 'name')
                        .on("click", expandImage)
                        .attr("cursor", "pointer")
                        .on("mouseover", function (d) {
                            svgImg.append("svg:title")
                                .text("click To Expand")
                        });

                    //********* NAME ************ 

                    var rectName = nodeGroup.append("text")
                        .attr("x", dynamic.nodeTextLeftMargin - 30)
                        .attr("y", attrs.nodePadding + 10)
                        .attr('class', 'name')
                        .text(function (d) {
                            return d.data.name;
                        })
                        .on("click", tooltipHoverHandler)
                        .attr("cursor", "pointer")
                        .on("mouseover", function (d) {
                            rectName.append("svg:title")
                                .text("click details")
                        });

                    //********* SPOUSE NAME ************

                    nodeGroup
                    .append("text")
                    .attr("x", dynamic.nodeTextLeftMargin - 30)
                    .attr("y", dynamic.nodePositionNameTopMargin + 5)
                    .attr("class", "spouse-text")
                    .text(function (d) {
                        if (d.data.noOfSpouses > 0) {
                        return "Spouse : ";
                        }
                    });

                    //Spouse 1
                    nodeGroup
                    .append("text")
                    .attr("x", dynamic.nodeTextLeftMargin + 35)
                    .attr("y", dynamic.nodePositionNameTopMargin + 5)
                    .attr("class", "spouse-name")
                    .text(function (d) {
                        if (d.data.noOfSpouses == 0 && d.data.nevermarried)
                        return "Not Married";
                        else if (d.data.noOfSpouses == 0) return;
                        else if (d.data.noOfSpouses > 0) {
                        var counter = 0;
                        var spouseNameInBox;
                        spouseNameInBox = d.data.spouses[0].sname;
                        return spouseNameInBox;
                        } else if (d.data.nevermarried) return "Not Married";
                        else return;
                    })
                    .call(wrapForComa)
                    .on("click", function (d) {
                        var spouseId = d.data.spouses[0].suniqueid;
                        viewSpouseProfile(d, spouseId);
                    });

                    //Spouse 2
                    nodeGroup
                    .append("text")
                    .attr("x", dynamic.nodeTextLeftMargin + 35)
                    .attr("y", dynamic.nodePositionNameTopMargin + 20)
                    .attr("class", "spouse-name")
                    .text(function (d) {
                        var counter = 0;
                        var spouseNameInBox;

                        if (d.data.noOfSpouses > 1) {
                        spouseNameInBox = d.data.spouses[1].sname;
                        if (d.data.spouses.length != 0) {
                            return spouseNameInBox;
                        } else if (d.data.nevermarried) return "Not Married";
                        }
                    })
                    .call(wrapForComa)
                    .on("click", function (d) {
                        var spouseId = d.data.spouses[1].suniqueid;
                        viewSpouseProfile(d, spouseId);
                    });

                    //********* CHILD ICON ************ 

                    nodeGroup.append("text")
                        .attr("x", dynamic.nodeTextLeftMargin - 70)
                        .attr("y", dynamic.nodeChildCountTopMargin)
                        .attr('class', 'child-icon')
                        .style('font-family', 'FontAwesome')
                        .text(function (d) {
                            if (d.children || d._children) {
                                return "\uf1ae";
                            }
                        });

                    //********* CHILD COUNT ************ 

                    nodeGroup.append("text")
                        .attr("x", dynamic.nodeTextLeftMargin - 40)
                        .attr("y", dynamic.nodeChildCountTopMargin)
                        .attr('class', 'child-count')
                        .text(function (d) {
                            if (d.children) return d.children.length;
                            if (d._children) return d._children.length;
                            return;
                        })

                    //******************  CHILDREN HYPERLINK ****************** 
                    var childHyperLink = nodeEnter.append('g');

                    var childLinkButton = childHyperLink.append("text")
                        .attr("x", dynamic.nodeTextLeftMargin + 120)
                        .attr("y", dynamic.nodeChildCountTopMargin)
                        .style('font-family', '"Gill Sans", sans-serif')
                        .style('fill', 'white')
                        .attr('class', 'childHyperLink')
                        .text(function (d) {
                            var condition = "false";
                            if (d.data.noOfSpouses > 0) {
                                d.data.spouses.forEach(spouse => {
                                    if (spouse.sisrelative == true) {
                                        condition = "true";
                                        return;
                                    }
                                })
                            }
                            if (condition == "true")
                                return "Go To Kids";
                        })
                        .on("click", goToKids)
                        .attr("cursor", "pointer")


                    //****************** EDIT BUTTON ****************** 

                    var editBtnLink = nodeEnter.append('g');

                    editBtnLink.append("text")
                        .attr("x", dynamic.nodeTextLeftMargin + 10)
                        .attr("y", dynamic.nodeChildCountTopMargin)
                        .style('font-family', '"Gill Sans", sans-serif')
                        .style('fill', 'white')
                        .attr('class', 'person-detail')
                        .attr('id', 'eidtProfileBtn')
                        .text("View Profile")
                        .on("click", getPersonDetails)


                    //******************  COLLAPSE AFTER SECOND NODE ****************** 
                    var collapsiblesWrapper = nodeEnter.append('g')
                        .attr('data-id', function (v) {
                            return v.uniqueIdentifier;
                        });

                    var collapsibleRects = collapsiblesWrapper.append("rect")
                        .attr('class', 'node-collapse-right-rect')
                        .attr('height', attrs.collapseCircleRadius)
                        .attr('x', (attrs.nodeWidth - attrs.collapseCircleRadius))
                        .attr('y', attrs.nodeHeight - 11)
                        .attr('rx', 3)
                        .attr("cursor", "pointer")
                        .attr("width", function (d) {
                            if(d.uniqueIdentifier != 1)
                            {
                                if (d.children || d._children) return attrs.collapseCircleRadius;
                            }
                            return 0;
                        })
                        .classed("hide-rect", function (d) {
                            if (d.data.gender == "F")
                                return true;
                            else
                                return false;
                        });

                    var collapsibles = collapsiblesWrapper.append("circle")
                        .attr("cursor", "pointer")
                        .attr('class', 'node-collapse')
                        .attr('cx', function (d) {
                            if (d.data.gender == "F")
                                return attrs.nodeWidth - (attrs.collapseCircleRadius + 14);
                            else
                                return attrs.nodeWidth - attrs.collapseCircleRadius;
                        })
                        .attr('cy', function (d) {
                            return attrs.nodeHeight - 11;
                        })
                        .attr("", setCollapsibleSymbolProperty);

                    //******************  HIDE COLLAPSE RECT WHEN NODE DOES NOT HAVE CHILDREN ****************** 
                    collapsibles.attr("r", function (d) {
                        if(d.uniqueIdentifier != 1)
                        {
                            if (d.children || d._children)
                                return attrs.collapseCircleRadius;
                        }
                        return 0;
                    })
                        .attr("height", attrs.collapseCircleRadius)
                        .attr("cursor", "pointer")

                    collapsiblesWrapper.append("text")
                        .attr("cursor", "pointer")
                        .attr('class', 'text-collapse')
                        .attr('width', attrs.collapseCircleRadius)
                        .attr('height', attrs.collapseCircleRadius)
                        .style('font-size', attrs.collapsibleFontSize)
                        .attr("text-anchor", "middle")
                        .style('font-family', 'FontAwesome')
                        .text(function (d) {
                            if(d.uniqueIdentifier != 1)
                                return d.collapseText; 
                        })
                        .attr("x", function (d) {
                            if (d.data.gender == "F")
                                return attrs.nodeWidth - (attrs.collapseCircleRadius + 14);
                            else
                                return attrs.nodeWidth - attrs.collapseCircleRadius;
                        })
                        .attr('y', function (d) {
                            return attrs.nodeHeight - 7;
                        })
                    collapsiblesWrapper.on("click", click);


                    //******************  NODE UPDATE ****************** 
                    var nodeUpdate = nodeEnter.merge(node);

                    //******************  TRANSITION TO THE PROPER POSITION FOR THE NODE ****************** 
                    nodeUpdate.transition()
                        .duration(attrs.duration)
                        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

                    //******************  TODO REPLACE WITH attrs OBJECT ****************** 
                    nodeUpdate.select("rect")
                        .attr("width", attrs.nodeWidth)
                        .attr("height", attrs.nodeHeight)
                        .attr("rx", function (d) {
                            if (d.data.gender == "F") {
                                return 30;
                            }
                            else return 3;
                        })
                        .attr("stroke", function (d) {
                            var condition = "false";
                            var count = 0;

                            //Locate Stroke
                            if (param && d.uniqueIdentifier == param.locate)
                                return '#70c645';
                            else if (d.data.noOfSpouses > 0) {
                                d.data.spouses.forEach(spouse => {
                                    if (param && spouse.uniqueIdentifier == param.locate)
                                        condition = "true";
                                })
                                if (condition == "true")
                                    return "#70c645";
                            }

                            //Get Kids Stroke
                            if (d.data.noOfSpouses > 0) {
                                d.data.spouses.forEach(spouse => {
                                    if (param == spouse.suniqueid)
                                        count = 1;
                                })
                                if (count == 1)
                                    return "#70c645";
                            }

                            return "rgb(80,80,80)";
                        })
                        .attr('stroke-width', function (d) {
                            var condition = "false";
                            var count = 0;

                            //Locate Stroke Width
                            if (param && d.uniqueIdentifier == param.locate)
                                return 6;
                            else if (d.data.noOfSpouses > 0) {
                                d.data.spouses.forEach(spouse => {
                                    if (param && spouse.uniqueIdentifier == param.locate)
                                        condition = "true";
                                })
                                if (condition == "true")
                                    return 6;
                            }

                            //Get Kids Stroke Width
                            if (d.data.noOfSpouses > 0) {
                                d.data.spouses.forEach(spouse => {
                                    if (param == spouse.suniqueid)
                                        count = 1;
                                })
                                if (count == 1)
                                    return 6;
                            }

                            return attrs.nodeStrokeWidth
                        })

                    //******************  REMOVE ANY EXISTING NODES ****************** 
                    var nodeExit = node.exit().transition()
                        .duration(attrs.duration)
                        .attr("transform", function (d) {return "translate(" + source.x + "," + source.y + ")";})
                        .remove();
                    nodeExit.select("rect")
                        .attr("width", attrs.nodeWidth)
                        .attr("height", attrs.nodeHeight)

                    //******************  ON EXIT REDUCE TH EOPACITY OF TEXT LABELS ****************** 
                    nodeExit.select('text')
                        .style('fill-opacity', 1e-6);

                    // ****************** LINKS SECTION ***************************
                    // Update the links...
                    var link = svg.selectAll('path.link')
                        .data(links, function (d) { return d.id; });

                    // Enter any new links at the parent's previous position.
                    var linkEnter = link.enter().insert('path', "g")
                        .attr("class", "link")
                        .attr('d', function (d) {
                            var o = { x: source.x0, y: source.y0 }
                            return diagonal(o, o)
                        });
                    // UPDATE
                    var linkUpdate = linkEnter.merge(link);
                    // Transition back to the parent element position
                    linkUpdate.transition()
                        .duration(attrs.duration)
                        .attr('d', function (d) { return diagonal(d, d.parent) });
                    // Remove any exiting links
                    var linkExit = link.exit().transition()
                        .duration(attrs.duration)
                        .attr('d', function (d) {
                            var o = { x: source.x, y: source.y }
                            return diagonal(o, o)
                        })
                        .remove();
                    // Creates a curved (diagonal) path from parent to the child nodes
                    function diagonal(s, d) {
                        path = `M ${s.x + 180} ${s.y}
                             C ${s.x + 180} ${(s.y + d.y + 100) / 2},
                             ${d.x + 180} ${(s.y + d.y + 100) / 2},
                             ${d.x + 180} ${d.y + 120}`
                        return path
                    }
                    //Stash the old positions for transition.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });

                    if (param && param.locate) {
                        var x;
                        var y;

                        nodes.forEach(function (d) {
                            if (d.uniqueIdentifier == param.locate) {
                                x = d.x;
                                y = d.y;
                            }
                        });

                        // normalize for width/height
                        var new_x = (-x + (window.innerWidth / 2));
                        var new_y = (-y + (window.innerHeight / 2));

                        // move the main container g    
                        // svg.attr("transform", "translate(" + new_x + "," + new_y + ")")
                        d3.select("svg")
                        .call(zoomBehaviours.transform, d3.zoomIdentity.translate(-x,(-y + 130)))
                    }

                    if (param) {
                        var x;
                        var y;
            
                        nodes.forEach(function (d) {
                          if (d.data.noOfSpouses > 0) {
                            d.data.spouses.forEach((id) => {
                              if (id.suniqueid == param) {
                                x = d.x;
                                y = d.y;
                              }
                            });
                          }
                        });
            
                        // normalize for width/height
                        var new_x = -x + window.innerWidth / 2;
                        var new_y = -y + window.innerHeight / 2;
            
                        // move the main container g
                        // svg.attr("transform", "translate(" + new_x + "," + new_y + ")")
                        d3.select("svg").call(
                          zoomBehaviours.transform,
                          d3.zoomIdentity.translate(-x, -y + 130)
                        );
                      }

                    /*################  TOOLTIP  #############################*/
                    // nodeGroup.on('click', tooltipHoverHandler);

                    function tooltipHoverHandler(d) {
                        var content = tooltipContent(d);
                        tooltip.html(content);
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", "1")
                            .style('display', 'block');
                        d3.select(this).attr('cursor', 'pointer')
                            .attr("stroke-width", 50);

                        tooltip.style('top', 80 + 'px')
                            .style('left', 80 + 'px');
                    }

                    function tooltipContent(item) {
                        tooltipId = item.data.uniqueid;
                        var name = item.data.name;
                        var strVar = "";
                        strVar += "<div id=\"overlay\"></\div>"
                        strVar += "  <div class=\"customTooltip\" >";
                       
                        strVar += "    <div class=\"tooltip-desc\">";
                        strVar += "      <p class=\"close-btn\" onClick='params.funcs.closeToolTip()'><i class=\"fa fa-times\" aria-hidden=\"true\"></i><\p>"
                        if (item.data.imgURL)
                        strVar += "             <img class=\"toolTipImg\" id='img-id' src=" + item.data.imgURL + " alt=\"\" width=\"200\" height=\"200\">";
                        else
                        strVar += "             <img class=\"toolTipImg\" id='img-id' src=\"imgs/user-profile.png\" alt=\"\" width=\"200\" height=\"200\">";
                       strVar += "        <div class=\"details\">  "
                        strVar += "      <p class=\"name\">" + item.data.name + " <\/p>";
                        strVar += "      <p class=\"gender\">" + "Gender: " + item.data.gender;
                        if(item.data.uniqueid != "L")
                        {
                            strVar += "     <button id='btn-details-box' onClick='params.funcs.addSpouseBox(" + item.uniqueIdentifier + "," + '"' + name + '"' + ")'>Add spouse<\/button>";
                            strVar += "     <button id='btn-details-box' onClick='params.funcs.addChildBox(" + item.uniqueIdentifier + "," + '"' + name + '"' + ")'>Add Child<\/button>";
                        }
                        if (item.data.noOfSpouses > 0) {
                            strVar += "      <p class=\"spouse\">" + "Spouse: " + getSpouseName(item) + " <\/p>";
                            strVar += "      <p class=\"children\">" + "Children: " + getChildCount(item) + " <\/p>";
                            strVar += "      <p class=\"children-name\">" + getChildrenNames(item) + "<\p>";

                            if (item.data.spouses.length > 1) {
                                strVar += "      <p class=\"spouse\">" + "Spouse: " + getSecondSpouseName(item) + " <\/p>";
                                strVar += "      <p class=\"children\">" + "Children: " + getSecondSpouseChildCount(item) + " <\/p>";
                                strVar += "      <p class=\"children-name\">" + getSecondSpouseChildrenNames(item) + "<\p>";
                            }
                        }
                        strVar += "   <\/div>";

                        strVar += " ";
                        strVar += "   <\/div>";
                        strVar += "  <\/div>";
                        strVar += "";
                        return strVar;
                    }

                }//End of update()

                //******************  UNTILITY FUNCS ****************** 
                function equalToEventTarget() {
                    return this == d3.event.target;
                }

                function getPersonDetails(d) {
                    var personId = d.uniqueIdentifier;
                    // sessionStorage.setItem("personId", personId);
                    // window.open('personDetails.html', "_blank");
                    document.getElementById("profileLoader").style.display="block"
                    
                    myVar = setTimeout(showpageLoader,3000);
                    function showpageLoader(){
                        editProfile(personId);
                    }
                }

                function expandImage(d) {

                    d3.selectAll(".blur1")
                        .style("background-color", "rgba(0,0,0,0.7)")
                        .style("width", "100%")
                        .style("height", "100%")
                        .style("top", 0)
                        .style("bottom", 0)
                        .style("right", 0)
                        .style("left", 0)
                        .style("position", "fixed")
                        .style("display", "inline")
                    imageContent.transition()
                        .duration(200)
                        .style("opacity", "1")
                        .style('display', 'block');

                    d3.select(this).attr('cursor', 'pointer')
                        .attr("stroke-width", 50);
                    var strImg = "";
                    strImg += "      <p class=\"img-close-btn\"><i onClick='params.funcs.closeImage()' class=\"fa fa-times\" aria-hidden=\"true\"></i><\p>"

                    strImg += "     <div class=\"img-div img-result\">"
                    if (d.data.imgURL)
                        strImg += "             <img class=\"croppedImg\" id='imgid' src=" + d.data.imgURL + " alt=\"\" width=\"350\" height=\"350\">";
                    else
                        strImg += "             <img class=\"croppedImg\" id='imgid' src=\"imgs/user-profile.png\" alt=\"\" width=\"350\" height=\"350\">";
                    strImg += "      <\/div>"

                    imageContent.html(strImg);

                }

                function editProfile(id) {
                    document.getElementById("profileLoader").style.display = "none";
                    // document.getElementById("profileId").style.display = "block";
                    if (id == 1) {
                      getProfile(root, id);
                    }
                    if (!root.children) {
                      if (!root.uniqueIdentifier == id) {
                        root.children = attrs.root._children;
                      }
                    }
                    if (root.children) {
                      var returnValue = 0;
                      root.children.forEach(function (ch) {
                        // returnValue = getProfile(ch, id);
                        // if (returnValue)
                        //     return;
                        getProfile(ch, id);
                      });
                      return;
                    }
                  }

                  function getProfile(d, id) {
                    var condition;
                    d3.selectAll(".divProfile")
                      .transition()
                      .duration(200)
                      .style("opacity", "1")
                      .style("display", "block")
                      .style("top", 0 + "px")
                      .style("left", "auto");
          
                    if (d.uniqueIdentifier == id) {
                      document.getElementById("profileId").style.display = "block";
                      var strVar = "";
                      strVar += '<div id="overlay"></div>';
                      strVar += "<div id=profileBox>";
                      // strVar += '<div class="close-btn"><i onClick=params.funs.closeProfile() class="fa fa-times" "aria-hidden=true"></i></div>'
                      strVar +=
                        '      <p class="close-btn" onClick=\'params.funcs.closeProfile()\'><i class="fa fa-times" aria-hidden="true"></i><p>';
          
                      strVar += '<div class="img-div img-result" id=img-div-id>';
                      if (d.data.imgURL)
                        strVar +=
                          "<img class=cropped id=img-id src=" +
                          d.data.imgURL +
                          ' alt="" width=200 height=200>';
                      else
                        strVar +=
                          '<img class=cropped id=img-id src=imgs/image.png alt="" width=200 height=200>';
                      strVar += "<div class=img-btn-div>";
                      strVar +=
                        '<label class=custom-file-upload><input id=file-input type=file onClick="params.funcs.addImage(' +
                        d.uniqueIdentifier +
                        ')">Upload Photo</label>';
                      strVar += "</div>";
                      strVar += "</div>";
          
                      strVar += "<div class=profiletooltip-desc>";
          
                      //Name
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar += "<label>Name:  </label>";
                      strVar += "</div>";
                      strVar += "<div class=coln-75>";
                      strVar += "<p class=name>" + d.data.name + " </p>";
                      strVar += "</div>";
                      strVar += "</div>";
          
                      // //Gender
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar += "<label>Gender:  </label>";
                      strVar += "</div>";
                      strVar += "<div class=coln-75>";
                      strVar += "<p class=gender>" + d.data.gender + " </p>";
                      strVar += "</div>";
                      strVar += "</div>";
                      // // Gothram
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar +=
                        "<label>Gothram:  </label><p style=margin-top:0; font-size:11px></p>";
                      strVar += "</div> ";
                      strVar += "<div class=coln-75>";
          
                      if (d.data.gothram) {
                        strVar +="<p class=gothram id=p-gothram-id>" + d.data.gothram + "</p>";
                        strVar +="<input class=gothram-row id=gothram-id value=Gothram style=display:none>";
                      } else if (!d.data.gothram && d.data.bloodGroup) {
                        d.data.gothram = "Gothram";
                        strVar +="<p class=gothram id=p-gothram-id>" + d.data.gothram + "</p>";
                        strVar +="<input class=gothram-row id=gothram-id value=Gothram style=display:none>";
                      } else {
                        strVar += "<input class=gothram-row id=gothram-id value=Gothram>";
                      }
                      strVar += "</div>";
                      strVar += "</div>";
          
                      // DOB
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar +=
                        '<label>Date of Birth:  </label><p style="margin-top:0; font-size:11px">Date: DD/MM/YYYY</p>';
                      strVar += "</div> ";
                      strVar += "<div class=coln-75>";
                      if (d.data.dob) {
                        strVar += "<p class=dob id=p-dob-id>" + d.data.dob + "</p>";
                        strVar +="<input class=dob-row id=dob-id placeholder=DD/MM/YYYY value=01/01/2021 maxlength=10 style=display:none>";
                      } else if (!d.data.dob && d.data.bloodGroup) {
                          d.data.dob = "01/01/2021";
                          strVar += "<p class=dob id=p-dob-id>" + d.data.dob + "</p>";
                          strVar +="<input class=dob-row id=dob-id placeholder=DD/MM/YYYY value=01/01/2021 maxlength=10 style=display:none>";
                        }else {
                          strVar +=
                            "<input class=dob-row id=dob-id placeholder=DD/MM/YYYY maxlength=10 value=01/01/2021>";
                        }
                      strVar += "</div>";
                      strVar += "</div>";
          
                      // Blood Group
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar += "<label>Blood Group:  </label>";
                      strVar += "</div>";
                      strVar += "<div class=coln-75>";
                      if (d.data.bloodGroup) {
                        strVar +=
                          "<p class=bloodGrp id=p-bloodGrp-id>" +
                          d.data.bloodGroup +
                          "</p>";
          
                        strVar +=
                          '<select class=bloodGrp-row id=bloodGrp-id name=bloodGrp style="display:none;margin:0;padding:5px">';
                        strVar += "<option value=A+ selected>A+</option>";
                        strVar += "<option value=A->A-</option>";
                        strVar += "<option value=B+>B+</option>";
                        strVar += "<option value=B->B-</option>";
                        strVar += "<option value=O+>O+</option>";
                        strVar += "<option value=O->O-</option>";
                        strVar += "<option value=AB+>AB+</option>";
                        strVar += "<option value=AB->AB-</option>";
                        strVar += "</select>";
                      } else {
                        strVar +=
                          '<select class=bloodGrp-row id=bloodGrp-id name=bloodGrp style="margin:0;padding:5px">';
                        strVar += "<option value=A+ selected>A+</option>";
                        strVar += "<option value=A->A-</option>";
                        strVar += "<option value=B+>B+</option>";
                        strVar += "<option value=B->B-</option>";
                        strVar += "<option value=O+>O+</option>";
                        strVar += "<option value=O->O-</option>";
                        strVar += "<option value=AB+>AB+</option>";
                        strVar += "<option value=AB->AB-</option>";
                        strVar += "</select>";
                      }
                      strVar += "</div>";
                      strVar += "</div>";
          
                      // Phone
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar += "<label>Phone:  </label>";
                      strVar += "</div>";
                      strVar += "<div class=coln-75>";
                      if (d.data.phoneNo) {
                        strVar +=
                          "<p class=phone id=p-phoneNo-id>" + d.data.phoneNo + " </p>";
                        strVar +=
                          "<input class=phone-row type=tel id=phoneNo-id style=display:none name=phone maxlength=10 value=012-345-6789>";
                      } else if (!d.data.phoneNo && d.data.bloodGroup) {
                        d.data.phoneNo = "012-345-6789";
                        strVar +="<p class=phone id=p-phoneNo-id>" + d.data.phoneNo + " </p>";
                        strVar +="<input class=phone-row type=tel id=phoneNo-id style=display:none name=phone maxlength=10 value=012-345-6789>";
                      }else
                        strVar +=
                          "<input class=phone-row type=tel id=phoneNo-id name=phone maxlength=10 value=012-345-6789>";
                      strVar += "</div>";
                      strVar += "</div>";
          
                      // Email
                      strVar += "<div class=person-details-row>";
                      strVar += "<div class=coln-25>";
                      strVar += "<label>Email:  </label>";
                      strVar += "</div>";
                      strVar += "<div class=coln-75>";
                      if (d.data.email) {
                        strVar +="<p class=email id=p-email-id>" + d.data.email + " </p>";
                        strVar +="<input class=email-row type=email id=email-id style=display:none name=email value=youremail@gmail.com>";
                      } else if (!d.data.email && d.data.bloodGroup) {
                        d.data.email = "youremail@gmail.com";
                        strVar +="<p class=email id=p-email-id>" + d.data.email + " </p>";
                        strVar +="<input class=email-row type=email id=email-id style=display:none name=email value=youremail@gmail.com>";
                      }else
                        strVar +="<input class=email-row type=email id=email-id name=email value=youremail@gmail.com>";
                      strVar += "</div>";
                      strVar += "</div>";
          
                      // Family Details
                      if (d.data.noOfSpouses > 0) {
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Spouse:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        strVar += "<p class=spouse>" + getSpouseName(d) + " </p>";
                        strVar += "</div>";
                        strVar += "</div>";
          
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Children:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        strVar += "<p class=children>" + getChildCount(d) + "</p>";
                        strVar += "</div>";
                        strVar += "<div class=coln-55>";
                        strVar += "<p class=children-name>" + getChildrenNames(d) + "<p>";
                        strVar += "</div>";
                        strVar += "</div>";
          
                        if (d.data.spouses.length > 1) {
                          strVar += "<div class=person-details-row>";
                          strVar += "<div class=coln-25>";
                          strVar += "<label>Spouse:  </label>";
                          strVar += "</div>";
                          strVar += "<div class=coln-75>";
                          strVar += "<p class=spouse>" + getSecondSpouseName(d) + " </p>";
                          strVar += "</div>";
                          strVar += "</div>";
          
                          strVar += "<div class=person-details-row>";
                          strVar += "<div class=coln-25>";
                          strVar += "<label>Children:  </label>";
                          strVar += "</div>";
                          strVar += "<div class=coln-75>";
                          strVar +=
                            "<p class=children>" + getSecondSpouseChildCount(d) + "</p>";
                          strVar += "</div>";
                          strVar += "<div class=coln-55>";
                          strVar +=
                            "<p class=children-name>" +
                            getSecondSpouseChildrenNames(d) +
                            "<p>";
                          strVar += "</div>";
                          strVar += "</div>";
                        }
                      }
          
                      // Save and Edit buttons
                      strVar += "<div class=save-btn>";
                      if (d.data.dob) {
                        strVar +=
                          '<button id="editProfile-btn" onClick=\'params.funcs.editMethod(' +
                          '"' +
                          d.data.dob +
                          '"' +
                          "," +
                          '"' +
                          d.data.gothram +
                          '"' +
                          "," +
                          '"' +
                          d.data.phoneNo +
                          '"' +
                          "," +
                          '"' +
                          d.data.bloodGroup +
                          '"' +
                          "," +
                          '"' +
                          d.data.email +
                          '"' +
                          ")'>Edit Profile</button>";
                        strVar +=
                          '<button id="saveProfile-btn" onClick=\'params.funcs.saveDetails(' +
                          d.uniqueIdentifier +
                          "," +
                          '"' +
                          0 +
                          '"' +
                          ")'>Save Profile</button>";
                      } else {
                        strVar +=
                          '<button id="saveProfile-btn" onClick=\'params.funcs.saveDetails(' +
                          d.uniqueIdentifier +
                          "," +
                          '"' +
                          1 +
                          '"' +
                          ")'>Save Profile</button>";
                      }
                      strVar += "</div>";
                      strVar += " ";
          
                      strVar += "</div>";
                      strVar += "</div>";
          
                      divContent.html(strVar);
                    }
          
                    if (condition == "true") return;
          
                    if (d._children) {
                      d._children.forEach(function (ch) {
                        ch.parent = d;
                        getProfile(ch, id);
                      });
                    } else if (d.children) {
                      d.children.forEach(function (ch) {
                        ch.parent = d;
                        getProfile(ch, id);
                      });
                    } //End else if
                  }

                  function closeProfile() {
                    debugger;
                    document.getElementById("profileId").style.display = "none";
                    // divContent.style('display', 'none');
                    // divContent.style('opacity', '0').style('display', 'none');
          
                    // d3.selectAll(".blur1")
                    //     .style("display", "none")
                    //     .style("position", "relative")
                  }
          
                  function addImage(id) {
                    const MAX_WIDTH = 180;
                    const MAX_HEIGHT = 180;
                    const MIME_TYPE = "image/jpeg";
                    const QUALITY = 0.7;
                    // document.getElementById("img-id").style.display = "none";
                    const input = document.getElementById("file-input");
                    input.onchange = function (ev) {
                      const file = ev.target.files[0]; // get the file
                      const blobURL = URL.createObjectURL(file);
                      const img = new Image();
                      img.src = blobURL;
                      img.onerror = function () {
                        URL.revokeObjectURL(this.src);
                        // Handle the failure properly
                        console.log("Cannot load image");
                      };
                      img.onload = function () {
                        URL.revokeObjectURL(this.src);
                        const [newWidth, newHeight] = calculateSize(
                          img,
                          MAX_WIDTH,
                          MAX_HEIGHT
                        );
                        const canvas = document.createElement("canvas");
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                        canvas.toBlob(
                          (blob) => {
                            // Handle the compressed image. es. upload or save in local state
                            // displayInfo('Original file', file);
                            // displayInfo('Compressed file', blob);
                          },
                          MIME_TYPE,
                          QUALITY
                        );
                        debugger;
          
                        // document.getElementById("root").append(canvas);
                        // imgURL = canvas.toDataURL();
                        imgURL = canvas.toDataURL("image/png", 0.92);
                        document.getElementById("img-id").src = canvas.toDataURL();
                        // appendImageToDatabase(id,imgURL)
                      };
                    };
          
                    function calculateSize(img, maxWidth, maxHeight) {
                      let width = img.width;
                      let height = img.height;
          
                      // calculate the width and height, constraining the proportions
                      if (width > height) {
                        if (width > maxWidth) {
                          height = Math.round((height * maxWidth) / width);
                          width = maxWidth;
                        }
                      } else {
                        if (height > maxHeight) {
                          width = Math.round((width * maxHeight) / height);
                          height = maxHeight;
                        }
                      }
                      return [width, height];
                    }
          
                    // Utility functions for demo purpose
          
                    function displayInfo(label, file) {
                      const p = document.createElement("p");
                      p.innerText = `${label} - ${readableBytes(file.size)}`;
                      document.getElementById("img-div-id").append(p);
                    }
          
                    function readableBytes(bytes) {
                      const i = Math.floor(Math.log(bytes) / Math.log(1024)),
                        sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
          
                      return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
                    }
                  }
          
                  function editMethod(db, go, ph, bg, em) {
                    document.getElementById("p-dob-id").style.display = "none";
                    document.getElementById("p-gothram-id").style.display = "none";
                    document.getElementById("p-bloodGrp-id").style.display = "none";
                    document.getElementById("p-phoneNo-id").style.display = "none";
                    document.getElementById("p-email-id").style.display = "none";
          
                    document.getElementById("dob-id").style.display = "inline";
                    document.getElementById("gothram-id").style.display = "inline";
                    document.getElementById("bloodGrp-id").style.display = "inline";
                    document.getElementById("phoneNo-id").style.display = "inline";
                    document.getElementById("email-id").style.display = "inline";
          
                    document.getElementById("dob-id").value = db;
                    document.getElementById("gothram-id").value = go;
                    document.getElementById("bloodGrp-id").value = bg;
                    document.getElementById("phoneNo-id").value = ph;
                    document.getElementById("email-id").value = em;
                  }
          
                  function saveDetails(id) {
                    var dob, bloodGroup, phoneNo, gothram, email;
          
                    dob = document.getElementById("dob-id").value;
                    gothram = document.getElementById("gothram-id").value;
                    bloodGroup = document.getElementById("bloodGrp-id").value;
                    phoneNo = document.getElementById("phoneNo-id").value;
                    email = document.getElementById("email-id").value;
                    var details = {
                      dob: dob,
                      gothram: gothram,
                      bloodGrp: bloodGroup,
                      phoneNo: phoneNo,
                      email: email,
                    };
          
                    if (id == 1) {
                      insertDetails(root, id, details);
                    }
          
                    if (!root.children) {
                      if (!root.uniqueIdentifier == id) {
                        root.children = attrs.root._children;
                      }
                    }
                    if (root.children) {
                      root.children.forEach(function (ch) {
                        insertDetails(ch, id, details);
                      });
                    }
          
                    firebase
                      .database()
                      .ref("users/" + "0/")
                      .set(attrs.root);
                    alert("data updated successfully");
                    closeProfile();
                    window.location.reload();
                  }
          
                  function insertDetails(d, id, details) {
                    var condition, imageURL;
                    var dob = details.dob;
                    var gothram = details.gothram;
                    var bloodGroup = details.bloodGrp;
                    var phoneNo = details.phoneNo;
                    var email = details.email;
          
                    if (d.uniqueIdentifier == id) {
                      debugger;
                      var element = document.getElementsByTagName("p")[7];
                      var stil = window
                        .getComputedStyle(element)
                        .getPropertyValue("display");
                      console.log(stil);
          
                      if (stil === "block" && d.data.dob) {
                        dob = d.data.dob;
                        gothram = d.data.gothram;
                        bloodGroup = d.data.bloodGroup;
                        phoneNo = d.data.phoneNo;
                        email = d.data.email;
                      }
          
                      if (imgURL === undefined && d.data.imgURL === undefined) {
                        imageURL = "imgs/user-profile.png";
                      } else if (imgURL === undefined && d.data.imgURL) {
                        imageURL = d.data.imgURL;
                      } else if (imgURL) {
                        imageURL = imgURL;
                      }
          
                      if (d.data.imgURL) {
                        d.data["dob"] = dob;
                        d.data["gothram"] = gothram;
                        d.data["bloodGroup"] = bloodGroup;
                        d.data["phoneNo"] = phoneNo;
                        d.data["email"] = email;
                        d.data.imgURL = imageURL;
                      } else {
                        d.data["dob"] = dob;
                        d.data["gothram"] = gothram;
                        d.data["bloodGroup"] = bloodGroup;
                        d.data["phoneNo"] = phoneNo;
                        d.data["email"] = email;
                        d.data["imgURL"] = imageURL;
                      }
          
                      condition = true;
                    }
          
                    if (condition == true) return;
          
                    if (d._children) {
                      d._children.forEach(function (ch) {
                        ch.parent = d;
                        insertDetails(ch, id, details);
                      });
                    } else if (d.children) {
                      d.children.forEach(function (ch) {
                        ch.parent = d;
                        insertDetails(ch, id, details);
                      });
                    }
                  }
          
                  // ******************  VIEW SPOUSE PROFILE FUNCS ******************
          
                  function viewSpouseProfile(d, sId) {
                    var condition;
                    d3.selectAll(".divProfile")
                      .transition()
                      .duration(200)
                      .style("opacity", "1")
                      .style("display", "block")
                      .style("top", 0 + "px")
                      .style("left", "auto");
          
                    d.data.spouses.forEach((id) => {
                      if (id.suniqueid === sId) {
                        document.getElementById("profileId").style.display = "block";
          
                        var strVar = "";
                        strVar += '<div id="overlay"></div>';
                        strVar += "<div id=profileBox>";
                        strVar +=
                          '<p class="close-btn" onClick=\'params.funcs.closeProfile()\'><i class="fa fa-times" aria-hidden="true"></i><p>';
          
                        strVar += '<div class="img-div img-result" id=img-div-id>';
                        if (id.imgURL)
                          strVar +=
                            "<img class=cropped id=img-id src=" +
                            id.imgURL +
                            ' alt="" width=200 height=200>';
                        else
                          strVar +=
                            '<img class=cropped id=img-id src=imgs/image.png alt="" width=200 height=200>';
                        strVar += "<div class=img-btn-div>";
                        strVar +=
                          '<label class=custom-file-upload><input id=file-input type=file onClick="params.funcs.addImage(' +
                          d.uniqueIdentifier +
                          ')">Upload Photo</label>';
                        strVar += "</div>";
                        strVar += "</div>";
          
                        strVar += "<div class=profiletooltip-desc>";
          
                        //Name
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Name:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        strVar += "<p class=name>" + id.sname + " </p>";
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // //Gender
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Gender:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        strVar += "<p class=gender>" + id.sgender + " </p>";
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // Gothram
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar +=
                          "<label>Gothram:  </label><p style=margin-top:0; font-size:11px></p>";
                        strVar += "</div> ";
                        strVar += "<div class=coln-75>";
                        if (id.gothram) {
                          strVar +=
                            "<p class=gothram id=p-gothram-id>" + id.gothram + "</p>";
                          strVar +=
                            "<input class=gothram-row id=gothram-id value=Gothram style=display:none>";
                        } else if (!id.gothram && id.bloodGroup) {
                          id.gothram = "Gothram";
                          strVar +=
                            "<p class=gothram id=p-gothram-id>" + id.gothram + "</p>";
                          strVar +=
                            "<input class=gothram-row id=gothram-id value=Gothram style=display:none>";
                        }else {
                          strVar +=
                            "<input class=gothram-row id=gothram-id value=Gothram>";
                        }
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // DOB
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar +=
                          '<label>Date of Birth:  </label><p style="margin-top:0; font-size:11px">Date: DD/MM/YYYY</p>';
                        strVar += "</div> ";
                        strVar += "<div class=coln-75>";
                        if (id.dob) {
                          strVar += "<p class=dob id=p-dob-id>" + id.dob + "</p>";
                          strVar +="<input class=dob-row id=dob-id placeholder=DD/MM/YYYY value=01/01/2021 maxlength=10 style=display:none>";
                        } else if (!id.dob && id.bloodGroup) {
                            id.dob = "01/01/2021";
                            strVar += "<p class=dob id=p-dob-id>" + id.dob + "</p>";
                            strVar +="<input class=dob-row id=dob-id placeholder=DD/MM/YYYY value=01/01/2021 maxlength=10 style=display:none>";
                        }else {
                          strVar +=
                            "<input class=dob-row id=dob-id placeholder=DD/MM/YYYY maxlength=10 value=01/01/2021>";
                        }
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // Blood Group
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Blood Group:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        if (id.bloodGroup) {
                          strVar +=
                            "<p class=bloodGrp id=p-bloodGrp-id>" +
                            id.bloodGroup +
                            "</p>";
          
                          strVar +=
                            '<select class=bloodGrp-row id=bloodGrp-id name=bloodGrp style="display:none;margin:0;padding:5px">';
                          strVar += "<option value=A+ selected>A+</option>";
                          strVar += "<option value=A->A-</option>";
                          strVar += "<option value=B+>B+</option>";
                          strVar += "<option value=B->B-</option>";
                          strVar += "<option value=O+>O+</option>";
                          strVar += "<option value=O->O-</option>";
                          strVar += "<option value=AB+>AB+</option>";
                          strVar += "<option value=AB->AB-</option>";
                          strVar += "</select>";
                        } else {
                          strVar +=
                            '<select class=bloodGrp-row id=bloodGrp-id name=bloodGrp style="margin:0;padding:5px">';
                          strVar += "<option value=A+ selected>A+</option>";
                          strVar += "<option value=A->A-</option>";
                          strVar += "<option value=B+>B+</option>";
                          strVar += "<option value=B->B-</option>";
                          strVar += "<option value=O+>O+</option>";
                          strVar += "<option value=O->O-</option>";
                          strVar += "<option value=AB+>AB+</option>";
                          strVar += "<option value=AB->AB-</option>";
                          strVar += "</select>";
                        }
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // Phone
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Phone:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        if (id.phoneNo) {
                          strVar +="<p class=phone id=p-phoneNo-id>" + id.phoneNo + " </p>";
                          strVar +="<input class=phone-row type=tel id=phoneNo-id style=display:none name=phone maxlength=10 value=012-345-6789>";
                        } else if (!id.phoneNo && id.bloodGroup) {
                            id.phoneNo = "012-345-6789";
                            strVar +="<p class=phone id=p-phoneNo-id>" + id.phoneNo + " </p>";
                          strVar +="<input class=phone-row type=tel id=phoneNo-id style=display:none name=phone maxlength=10 value=012-345-6789>";
                        }else
                          strVar +="<input class=phone-row type=tel id=phoneNo-id name=phone maxlength=10 value=012-345-6789>";
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // Email
                        strVar += "<div class=person-details-row>";
                        strVar += "<div class=coln-25>";
                        strVar += "<label>Email:  </label>";
                        strVar += "</div>";
                        strVar += "<div class=coln-75>";
                        if (id.email) {
                          strVar += "<p class=email id=p-email-id>" + id.email + " </p>";
                          strVar +="<input class=email-row type=email id=email-id style=display:none name=email value=youremail@gmail.com>";
                        } else if (!id.email && id.bloodGroup) {
                          id.email = "youremail@gmail.com";
                          strVar += "<p class=email id=p-email-id>" + id.email + " </p>";
                          strVar +="<input class=email-row type=email id=email-id style=display:none name=email value=youremail@gmail.com>";
                        }else 
                          strVar +=
                            "<input class=email-row type=email id=email-id name=email value=youremail@gmail.com>";
                        strVar += "</div>";
                        strVar += "</div>";
          
                        // Family Details
                        if (d.data.noOfSpouses > 0) {
                          var lastChar = sId.charAt(sId.length - 1);
                          if (lastChar == 1) {
                            strVar += "<div class=person-details-row>";
                            strVar += "<div class=coln-25>";
                            strVar += "<label>Spouse:  </label>";
                            strVar += "</div>";
                            strVar += "<div class=coln-75>";
                            strVar += "<p class=spouse>" + d.data.name + " </p>";
                            strVar += "</div>";
                            strVar += "</div>";
          
                            strVar += "<div class=person-details-row>";
                            strVar += "<div class=coln-25>";
                            strVar += "<label>Children:  </label>";
                            strVar += "</div>";
                            strVar += "<div class=coln-75>";
                            strVar += "<p class=children>" + getChildCount(d) + "</p>";
                            strVar += "</div>";
                            strVar += "<div class=coln-55>";
                            strVar +=
                              "<p class=children-name>" + getChildrenNames(d) + "<p>";
                            strVar += "</div>";
                            strVar += "</div>";
                          } else {
                            strVar += "<div class=person-details-row>";
                            strVar += "<div class=coln-25>";
                            strVar += "<label>Spouse:  </label>";
                            strVar += "</div>";
                            strVar += "<div class=coln-75>";
                            strVar += "<p class=spouse>" + d.data.name + " </p>";
                            strVar += "</div>";
                            strVar += "</div>";
          
                            strVar += "<div class=person-details-row>";
                            strVar += "<div class=coln-25>";
                            strVar += "<label>Children:  </label>";
                            strVar += "</div>";
                            strVar += "<div class=coln-75>";
                            strVar +=
                              "<p class=children>" +
                              getSecondSpouseChildCount(d) +
                              "</p>";
                            strVar += "</div>";
                            strVar += "<div class=coln-55>";
                            strVar +=
                              "<p class=children-name>" +
                              getSecondSpouseChildrenNames(d) +
                              "<p>";
                            strVar += "</div>";
                            strVar += "</div>";
                          }
                        }
          
                        // Save and Edit buttons
                        strVar += '<div class="person-details-row save-btn">';
                        if (id.dob) {
                          strVar +=
                            '<button id="editProfile-btn" onClick=\'params.funcs.editMethod(' +
                            '"' +
                            id.dob +
                            '"' +
                            "," +
                            '"' +
                            id.gothram +
                            '"' +
                            "," +
                            '"' +
                            id.phoneNo +
                            '"' +
                            "," +
                            '"' +
                            id.bloodGroup +
                            '"' +
                            "," +
                            '"' +
                            id.email +
                            '"' +
                            ")'>Edit Profile</button>";
                          strVar +=
                            '<button id="saveProfile-btn" onClick=\'params.funcs.saveSpouseProfileDetails(' +
                            d.uniqueIdentifier +
                            "," +
                            '"' +
                            sId +
                            '"' +
                            "," +
                            '"' +
                            0 +
                            '"' +
                            ")'>Save Profile</button>";
                        } else {
                          strVar +=
                            '<button id="saveProfile-btn" onClick=\'params.funcs.saveSpouseProfileDetails(' +
                            d.uniqueIdentifier +
                            "," +
                            '"' +
                            sId +
                            '"' +
                            "," +
                            '"' +
                            1 +
                            '"' +
                            ")'>Save Profile</button>";
                        }
                        strVar += "</div>";
                        strVar += " ";
          
                        strVar += "</div>";
                        strVar += "</div>";
          
                        divContent.html(strVar);
                      }
                    });
                  }
          
                  function saveSpouseProfileDetails(id, sId, val) {
                    var dob, bloodGroup, phoneNo, email, gothram;
          
                    dob = document.getElementById("dob-id").value;
                    gothram = document.getElementById("gothram-id").value;
                    bloodGroup = document.getElementById("bloodGrp-id").value;
                    phoneNo = document.getElementById("phoneNo-id").value;
                    email = document.getElementById("email-id").value;
                    var details = {
                      dob: dob,
                      gothram: gothram,
                      bloodGrp: bloodGroup,
                      phoneNo: phoneNo,
                      email: email,
                    };
          
                    if (id == 1) {
                      insertSpouseDetails(root, id, sId, details);
                    }
          
                    if (!root.children) {
                      if (!root.uniqueIdentifier == personId) {
                        root.children = attrs.root._children;
                      }
                    }
                    if (root.children) {
                      root.children.forEach(function (ch) {
                        insertSpouseDetails(ch, id, sId, details);
                      });
                    }
          
                    firebase
                      .database()
                      .ref("users/" + "0/")
                      .set(attrs.root);
                    alert("data updated successfully");
                    closeProfile();
                    window.location.reload();
                  }
          
                  function insertSpouseDetails(d, id, sId, details) {
                    var condition, imageURL;
                    var dob = details.dob;
                    var gothram = details.gothram;
                    var bloodGroup = details.bloodGrp;
                    var phoneNo = details.phoneNo;
                    var email = details.email;
          
                    if (d.uniqueIdentifier == id) {
                      debugger;
                      d.data.spouses.forEach((spouseId) => {
                        if (spouseId.suniqueid == sId) {
                          var element = document.getElementsByTagName("p")[7];
                          var stil = window
                            .getComputedStyle(element)
                            .getPropertyValue("display");
          
                          if (stil === "block" && spouseId.dob) {
                            dob = spouseId.dob;
                            gothram = spouseId.gothram;
                            bloodGroup = spouseId.bloodGroup;
                            phoneNo = spouseId.phoneNo;
                            email = spouseId.email;
                          }
          
                          if (imgURL === undefined && spouseId.imgURL === undefined) {
                            imageURL = "imgs/user-profile.png";
                          } else if (imgURL === undefined && spouseId.imgURL) {
                            imageURL = spouseId.imgURL;
                          } else if (imgURL) {
                            imageURL = imgURL;
                          }
          
                          if (spouseId.imgURL) {
                            spouseId["dob"] = dob;
                            spouseId["gothram"] = gothram;
                            spouseId["bloodGroup"] = bloodGroup;
                            spouseId["phoneNo"] = phoneNo;
                            spouseId["email"] = email;
                            spouseId.imgURL = imageURL;
                          } else {
                            spouseId["dob"] = dob;
                            spouseId["gothram"] = gothram;
                            spouseId["bloodGroup"] = bloodGroup;
                            spouseId["phoneNo"] = phoneNo;
                            spouseId["email"] = email;
                            spouseId["imgURL"] = imageURL;
                          }
          
                          condition = true;
                        }
                      });
                    }
          
                    if (condition == true) return;
          
                    if (d._children) {
                      d._children.forEach(function (ch) {
                        ch.parent = d;
                        insertSpouseDetails(ch, id, sId, details);
                      });
                    } else if (d.children) {
                      d.children.forEach(function (ch) {
                        ch.parent = d;
                        insertSpouseDetails(ch, id, sId, details);
                      });
                    }
                  }

                //**************************************  ToolTip FUNCS ****************************************** 

                //****************** Details Box FUNCS ****************

                function closeToolTip() {
                    tooltip.style('opacity', '0').style('display', 'none');
                }

                function closeImage() {
                    imageContent.style('opacity', '0').style('display', 'none');

                    d3.selectAll(".blur1")
                        .style("display", "none")
                        .style("position", "relative")
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

                //****************** ADD SPOUSE AND CHILD FUNCS ****************

                function addSpouseBox(id, pname) {
                    var divContent = add(id);

                    d3.selectAll('.add-spouse')
                        .transition()
                        .duration(200)
                        .style("opacity", "1")
                        .style('display', 'block')
                        .style('width', '415px')
                        .style('height', '300px')

                   function add(id) {
                        var strVar = "";
                        strVar += "<div id=\"overlay\"></\div>"
                        strVar += "     <div id=\"sbox\">"
                        strVar += "    <div class=\"input-box\">";
                        strVar += "      <div class=\"close-button\"><i onClick='params.funcs.closeSpouseBox()' class=\"fa fa-times\" aria-hidden=\"true\"></i><\div>"
                        strVar += "         <div class=\"input-wrapper\">";
                        strVar += "         <form action=\"/action_page.php\">";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"fname\">Name</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <p class=\"personName\">" + pname + " <\/p>";
                        strVar += "                 </div>";
                        strVar += "             </div>";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"fname\">Spouse Name</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <input type=\"text\" id=\"s-name\" name=\"spouseName\" placeholder=\"spouse name\" required/><span class=\"required\">*</span>";
                        strVar += "                 </div>";
                        strVar += "             </div>";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"lname\">Gender</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <select id=\"s-gender\" name=\"gender\">";
                        strVar += "                         <option value=\"M\">M</option>";
                        strVar += "                         <option value=\"F\">F</option>";
                        strVar += "                      </select><span class=\"required\">*</span>";
                        strVar += "                 </div>";
                        strVar += "              </div>";
                        strVar += "           </form>";
                        if (uid == "4LgbaOaC5pYS2L7zeGDwBTZP4y63")
                            strVar += "           <button class='submit-btn' type='button' onClick='params.funcs.addSpouseName(" + id + ")'>Add Spouse<\/button>";
                        else
                            strVar += "           <button class='submit-btn' type='button' onClick='params.funcs.spouseRequestToAdmin()'>Send Request<\/button>";
                        strVar += "         </div>";
                        strVar += "        </div>";
                        strVar += "             </div>";


                        return strVar;
                    }
                    divAddSpouseTooltip.html(divContent);
                }

                function addChildBox(id, pname) {
                    var divContent = add(id);

                    d3.selectAll('.add-child')
                        .transition()
                        .duration(200)
                        .style("opacity", "1")
                        .style('display', 'block')
                        .style('width', '415px')
                        .style('height', '350px')

                   
                    function add(id) {
                        var strVar = "";
                        strVar += "<div id=\"overlay\"></\div>"
                        strVar += "     <div id=\"cbox\">"
                        strVar += "    <div class=\"input-box\">";
                        strVar += "      <div class=\"close-button\"><i onClick='params.funcs.closeChildBox()' class=\"fa fa-times\" aria-hidden=\"true\"></i><\div>"
                        strVar += "         <div class=\"input-wrapper\">";
                        strVar += "         <form action=\"/action_page.php\">";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"fname\">Name</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <p class=\"personName\">" + pname + " <\/p>";
                        strVar += "                 </div>";
                        strVar += "             </div>";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"fname\">Child Name</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <input type=\"text\" id=\"c-name\" name=\"childName\" placeholder=\"child name\"  required><span class=\"required\">*</span>";
                        strVar += "                 </div>";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"lname\">Gender</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <select id=\"c-gender\" name=\"gender\">";
                        strVar += "                         <option value=\"M\">M</option>";
                        strVar += "                         <option value=\"F\">F</option>";
                        strVar += "                      </select><span class=\"required\">*</span>";
                        strVar += "                 </div>";
                        strVar += "              </div>";
                        strVar += "             <div class=\"row\">";
                        strVar += "                 <div class=\"col-25\">";
                        strVar += "                     <label for=\"lname\">Child of</label>";
                        strVar += "                 </div>";
                        strVar += "                 <div class=\"col-75\">";
                        strVar += "                     <select class ='btn-childOf-box'id=\"getChildOf\" name=\"childOf\" onClick='params.funcs.getDropDownSpouse(" + id + ")'>";
                        strVar += "                      </select><span class=\"required\">*</span>";
                        strVar += "                 </div>";
                        strVar += "              </div>";
                        strVar += "           </form>";
                        if (uid == "4LgbaOaC5pYS2L7zeGDwBTZP4y63")
                            strVar += "           <button class='submit-btn' type='button' onClick='params.funcs.addChildName(" + id + ")'>Add Child<\/button>";
                        else
                            strVar += "           <button class='submit-btn' type='button' onClick='params.funcs.childRequestToAdmin()'>Send Request<\/button>";
                        strVar += "         </div>";
                        strVar += "        </div>";
                        strVar += "        </div>";
                        
                        return strVar;
                    }
                    divAddChildTooltip.html(divContent);
                }

                function addSpouseName(id) {
                    var sname = document.getElementById("s-name").value;
                    var gender = document.getElementById("s-gender").value;
                    if (!root.children) {
                        if (!root.uniqueIdentifier == id) {
                            root.children = attrs.root._children;
                        }
                    }
                    if (root.children) {
                        root.children.forEach(function (ch) {
                            appendSpouseName(sname, gender, ch, id);
                        });
                    }
                    firebase.database().ref('users/' + '0/').set(attrs.root);
                    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=?&su=(Add Spouse Request)Added Successfully&body=Spouse added successfully, Please check the family tree @seepareddy.in");
                    window.alert("Spouse added successfully!");
                    closeSpouseBox();
                    window.location.reload();
                }

                function appendSpouseName(sname, gender, d, id) {
                    var condition;
                    if (d.uniqueIdentifier == id) {
                        if (d.data.noOfSpouses > 0) {
                            var unqid;
                            unqid = d.data.uniqueid + "S2"
                            d.data.noOfSpouses = 2;
                            d.data.spouses.push({
                                "sname": sname,
                                "sgender": gender,
                                "suniqueid": unqid,
                                "sisrelative": false,
                                "sinternalid": "",
                                "nokids": false
                            });

                            condition = "true";
                        }
                        else if (d.data.noOfSpouses == 0) {
                            d.data.noOfSpouses = 1;
                            var unqid;
                            unqid = d.data.uniqueid + "S1";
                            d.data["spouses"] = [{
                                "nokids": false,
                                "sgender": gender,
                                "sinternalid": "",
                                "sisrelative": false,
                                "sname": sname,
                                "suniqueid": unqid
                            }];
                            condition = "true";
                        }
                        if (condition == "true")
                            return;
                    }

                    if (d._children) {
                        d._children.forEach(function (ch) {
                            ch.parent = d;
                            appendSpouseName(sname, gender, ch, id);
                        })
                    } else if (d.children) {
                        d.children.forEach(function (ch) {
                            ch.parent = d;
                            appendSpouseName(sname, gender, ch, id);
                        });
                    };
                };

                function getDropDownSpouse(id) {
                    var count = 0;
                    if (!root.children) {
                        if (!root.uniqueIdentifier == id) {
                            root.children = attrs.root._children;
                        }
                    }
                    if (root.children) {
                        root.children.forEach(function (ch) {
                            getChildOfSpouse(ch, id);
                        });
                    }
                    update(root);
                }

                function getChildOfSpouse(d, id) {
                    if (d.uniqueIdentifier == id) {
                        var select = document.getElementById("getChildOf");
                        d.data.spouses.forEach(spouse => {
                            var el = document.createElement("option");
                            if (select.options.length < 2) {
                                el.textContent = spouse.sname;
                                el.value = spouse.sname;
                                select.appendChild(el);
                            }
                        })
                    }
                    if (d._children) {
                        d._children.forEach(function (ch) {
                            ch.parent = d;
                            getChildOfSpouse(ch, id);
                        })
                    } else if (d.children) {
                        d.children.forEach(function (ch) {
                            ch.parent = d;
                            getChildOfSpouse(ch, id);
                        });
                    };
                }

                function addChildName(id) {
                    var cname = document.getElementById("c-name").value;
                    var cgender = document.getElementById("c-gender").value;
                    var kidOf = document.getElementById("getChildOf").value;

                    if (!root.children) {
                        if (!root.uniqueIdentifier == id) {
                            root.children = attrs.root._children;
                        }
                    }
                    if (root.children) {
                        root.children.forEach(function (ch) {
                            appendChildName(cname, cgender, ch, kidOf, id);
                        });
                    }
                    firebase.database().ref('users/' + '0/').set(attrs.root);
                    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=?&su=(Add Child Request)Added Successfully&body=Child added successfully, Please check the family tree @seepareddy.in");
                    alert("Child added successfully!");
                    closeChildBox();
                    // closeToolTip();
                    window.location.reload();
                }

                function appendChildName(cname, cgender, d, kidOf, id) {
                    var condition;

                    var momuid, unqid, str, strlen, childNum;

                    if (d.uniqueIdentifier == id) {

                        if (d.data.noOfKids > 0) {

                            if (!d.data.children) {
                                unqid = d.data.uniqueid;
                                strlen = unqid.length;
                                str = unqid + "1";
                                unqid = str;
                            }
                            else {
                                var r = (d.data.children.length) + 1;
                                unqid = d.data.uniqueid;
                                strlen = unqid.length;
                                unqid = unqid + r;
                            }

                            d.data.spouses.forEach(spouse => {
                                momuid = spouse.suniqueid;
                            })

                            d.data.noOfKids = d.data.noOfKids + 1;

                            d.data.spouses.forEach(spouse => {
                                if (spouse.sname == kidOf) {
                                    childNum = spouse.suniqueid.slice(-1);
                                }
                                // kidOf = spouse.suniqueid.slice(-1);
                            })


                            d.data.children.push({
                                "childOf": childNum,
                                "collapseText": "",
                                "died": false,
                                "gender": cgender,
                                "momuid": momuid,
                                "name": cname,
                                "nevermarried": false,
                                "noOfKids": 0,
                                "noOfSpouses": 0,
                                "noinfo": false,
                                "uniqueid": unqid
                            });

                            condition = "true";
                        }
                        else if (d.data.noOfKids == 0) {

                            if (!d.data.children) {
                                unqid = d.data.uniqueid;
                                strlen = unqid.length;
                                str = unqid + "1";
                                unqid = str;
                            }
                            else {
                                var r = (d.data.children.length) + 1;
                                unqid = d.data.uniqueid;
                                strlen = unqid.length;
                                unqid = unqid + r;
                            }

                            d.data.spouses.forEach(spouse => {
                                momuid = spouse.suniqueid;
                            })

                            d.data.noOfKids = d.data.noOfKids + 1;

                            d.data.spouses.forEach(spouse => {
                                if (spouse.sname == kidOf) {
                                    childNum = spouse.suniqueid.slice(-1);
                                }
                                // kidOf = spouse.suniqueid.slice(-1);
                            })

                            d.data["children"] = [{
                                "childOf": childNum,
                                "collapseText": "",
                                "died": false,
                                "gender": cgender,
                                "momuid": momuid,
                                "name": cname,
                                "nevermarried": false,
                                "noOfKids": 0,
                                "noOfSpouses": 0,
                                "noinfo": false,
                                "uniqueid": unqid
                            }];
                            condition = "true";
                        }
                        if (condition == "true")
                            return;
                    }

                    if (d._children) {
                        d._children.forEach(function (ch) {
                            ch.parent = d;
                            appendChildName(cname, cgender, ch, kidOf, id);
                        })
                    } else if (d.children) {
                        d.children.forEach(function (ch) {
                            ch.parent = d;
                            appendChildName(cname, cgender, ch, kidOf, id);
                        });
                    };
                }

                function popupFunction(){
                    var popup = document.getElementById("myPopup");
                    popup.classList.toggle("show");
                }

                function spouseRequestToAdmin() {

                    if(!document.getElementById("s-name").value)
                        {
                            document.getElementById("popupId1").style.display = "block";

                           popupFunction()
                        }
                    else{
                        Email.send({
                            Host: "smtp.gmail.com",
                            Username : "seepareddy.in@gmail.com",
                            Password : "qvlzwivahomhsghm",
                            To : 'seepareddy.in@gmail.com',
                            From : "seepareddy.in@gmail.com",
                            Subject : "Request to add 'Spouse' in seepareddy family tree",
                            Body : " From: "+email+",  <br /><br /> Member Id: " + tooltipId + ", <br /><br /> Spouse Name: " + document.getElementById("s-name").value + ", <br /><br />  Spouse Gender: " + document.getElementById("s-gender").value + "",
                            }).then(
                                message => alert("Request sent successfully")
                            );
                        
                    closeSpouseBox();
                    }
                    
                    // closeToolTip();
                    // window.location.reload();
                }

                function childRequestToAdmin() {

                    if(!document.getElementById("c-name").value)
                    {
                        document.getElementById("popupId2").style.display = "block";

                       popupFunction()
                    }
                    else
                    {
                        Email.send({
                            Host: "smtp.gmail.com",
                            Username : "seepareddy.in@gmail.com",
                            Password : "qvlzwivahomhsghm",
                            To : 'seepareddy.in@gmail.com',
                            From : "seepareddy.in@gmail.com",
                            Subject : "Request to add 'Child' in seepareddy family tree",
                            Body : " From: "+email+",  <br /><br /> Member Id: " + tooltipId + ", <br /><br />  Child Name: " + document.getElementById("c-name").value + ",  <br /><br /> Child gender: " + document.getElementById("c-gender").value + ", \
                                    <br /><br /> Child of: " + document.getElementById("getChildOf").value + "",
                            }).then(
                                message => alert("Request sent successfully")
                            );
                    closeChildBox();
                    }
                    
                }

                function closeSpouseBox() {
                    d3.selectAll('.add-spouse')
                        .transition()
                        .duration(250)
                        .style('display', 'none')

                        document.getElementById("popupId1").style.display = "none";
                }

                function closeChildBox() {
                    d3.selectAll('.add-child')
                        .transition()
                        .duration(250)
                        .style('display', 'none')

                        document.getElementById("popupId2").style.display = "none";
                }

                //******** END OF TOOLTIP FUNCS ***********

                function wrapForComa(text, width) {
                    text.each(function () {
                        var text = d3.select(this),
                            words = text.text().split(",").reverse(),
                            word,
                            line = [],
                            lineNumber = 0,
                            lineHeight = 1.1, // ems
                            x = text.attr("x"),
                            y = text.attr("y"),
                            dy = 0, //parseFloat(text.attr("dy")),
                            tspan = text.text(null)
                                .append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", dy + "em");
                        while (word = words.pop()) {
                            line.push(word);
                            tspan.text(line.join(" "));
                            // if (tspan.node().getComputedTextLength() > width) {
                            if (line.length > 1) {
                                line.pop();
                                tspan.text(line.join(" "));
                                line = [word];
                                tspan = text.append("tspan")
                                    .attr("x", x)
                                    .attr("y", y)
                                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                    .text(word);
                            }
                        }
                    });
                }

                //******************  redraw FUNC ****************** 
                function redraw() {
                    svg.attr("transform", d3.event.transform.translate((attrs.width - 350) / 2, 150));
                }

               //******************  Fit to cenetr FUNC ****************** 
                function fitToCenter() {
                    collapseToSecondLevel(root);
                    update(root);

                    // * WORK
                    d3.select("svg")
                        .transition()
                        .duration(350)
                        .call(zoomBehaviours.transform, d3.zoomIdentity);

                    document.getElementById("collapse-button").style.display = "none";
                    document.getElementById("expand-button").style.display = "block"
                }

                //******************  Expand FUNCs ****************** 
                function expandAll() {
                    expand(root);
                    update(root);
                    document.getElementById("expand-button").style.display = "none";
                    document.getElementById("collapse-button").style.display = "block"
                }

                function expand(d) {
                    if (d.children) {
                        d.children.forEach(expand);
                    }
                    if (d._children) {
                        d.children = d._children;
                        d.children.forEach(expand);
                        d._children = null;
                    }
                    if (d.children) {
                        if(d.uniqueIdentifier != 1)
                        // if node has children and it's expanded, then  display -
                            setToggleSymbol(d, attrs.COLLAPSE_SYMBOL);
                    }
                }

                function expandParents(d) {

                    while (d.parent) {
                        d = d.parent;
                        if (!d.children) {
                            d.children = d._children;
                            d._children = null;
                            setToggleSymbol(d, attrs.COLLAPSE_SYMBOL);
                        }
                    }
                }

                //******************  Collapse FUNCS ****************** 
                function collapseAll() {
                    collapse(root);
                    update(root);
                }

                function collapse(d) {
                    if (d.children) {
                        d._children = d.children;
                        d._children.forEach(collapse);
                        d.children = null;
                    }
                    if (d._children) {
                        // if node has children and it's collapsed, then  display +
                        setToggleSymbol(d, attrs.EXPAND_SYMBOL);
                    }
                }

                function collapseToSecondLevel(d) {
                    if (d.children) {
                        d.children.forEach(collapse);
                    }
                    if (d._children) {
                        d.children = d._children;
                        d._children.forEach(collapse);
                    }
                    if (d._children) {
                        // if node has children and it's collapsed, then  display +
                        setToggleSymbol(d, attrs.COLLAPSE_SYMBOL);
                    }
                }

                function setCollapsibleSymbolProperty(d) {
                    if (d._children) {
                        if(d.uniqueid != "L")
                            d.collapseText = attrs.EXPAND_SYMBOL;
                    } else if (d.children) {
                        if(d.uniqueid != "L")
                            d.collapseText = attrs.COLLAPSE_SYMBOL;
                    }
                }

                function setToggleSymbol(d, symbol) {
                        d.collapseText = symbol;
                        d3.select("*[data-id='" + d.uniqueIdentifier + "']").select('text').text(symbol);
                }

                //******************  AddPropertyRecursive FUNC ****************** 
                function addPropertyRecursive(propertyName, propertyValueFunction, element) {
                    // if (element[propertyName]) {
                    //     element[propertyName] = element[propertyName] + ' ' + propertyValueFunction(element);
                    // }
                    // else {
                    element[propertyName] = propertyValueFunction(element);
                    // }

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
                }

                //******************  Toggles children on click ****************** 
                function click(d) {
                    d3.select(this).select("text").text(function (dv) {
                        if (dv.collapseText == attrs.EXPAND_SYMBOL) {
                            dv.collapseText = attrs.COLLAPSE_SYMBOL
                        }
                        else {
                            if (dv.children) {
                                dv.collapseText = attrs.EXPAND_SYMBOL
                            }
                        }
                        return dv.collapseText;
                    })
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    }
                    else {
                        d.children = d._children;
                        d._children = null;
                    }
                    update(d);
                }

                //******************  ON CLICK GO TO KIDS ****************** 
                function goToKids(presentNode) {

                    var internalId;

                    presentNode.data.spouses.forEach(pnSpouse => {
                        internalId = pnSpouse.sinternalid;
                    })

                    if (root.children) {
                        root.children.forEach(collapse);
                        root.children.forEach(ch => {
                            getPresentNodeKids(ch, presentNode);
                        })
                    }
                    update(root, internalId);
                }

                function getPresentNodeKids(d, presentNode) {
                    var condition = "false";
                    var internalId;

                    presentNode.data.spouses.forEach(pnSpouse => {
                        internalId = pnSpouse.sinternalid;
                    })

                    if (d.data.noOfSpouses > 0) {
                        d.data.spouses.forEach(spouse => {
                            if (spouse.suniqueid == internalId) {
                                expandParents(d);
                                condition = "true";
                            }
                            if (condition == "true")
                                return;
                        })
                    }

                    if (d._children) {
                        d._children.forEach(ch => {
                            ch.parent = d;
                            getPresentNodeKids(ch, presentNode);
                        })
                    } else if (d.children) {
                        d.children.forEach(ch => {
                            ch.parent = d;
                            getPresentNodeKids(ch, presentNode);
                        })
                    }
                }

                //******************  User Search Box ****************** 
                function reflectResults(results, searchText) {
                    var regexSearchWord = new RegExp(searchText, "i");
                    var htmlStringArray = results.map(function (result) {
                        var strVar = "";
                        strVar += "         <div class=\"list-item\">";
                        strVar += "            <div class=\"description\">";

                        if (!result.data) {
                            result.forEach(spouse => {
                                if ((spouse.sname.match(regexSearchWord)) || (spouse.suniqueid.match(regexSearchWord))) {
                                    strVar += "              <p class=\"name\">" + "Name : " + spouse.sname + "<\/p>";
                                    strVar += "               <p class=\"gender\">" + "Gender : " + spouse.sgender + "<\/p>";
                                    strVar += "            <\/div>";
                                    strVar += "            <div class=\"buttons\">";
                                    strVar += "              <button class='btn-search-box btn-action btn-locate' onclick='params.funcs.locate(" + spouse.uniqueIdentifier + ")'>Locate <\/button>";
                                    strVar += "            <\/div>";
                                    strVar += "        <\/div>";
                                }
                            });
                        }
                        else {
                            strVar += "              <p class=\"name\">" + "Name : " + result.data.name + "<\/p>";
                            strVar += "               <p class=\"gender\">" + "Gender : " + result.data.gender + "<\/p>";
                            strVar += "            <\/div>";
                            strVar += "            <div class=\"buttons\">";
                            strVar += "              <button class='btn-search-box btn-action btn-locate' onclick='params.funcs.locate(" + result.uniqueIdentifier + ")'>Locate <\/button>";
                            strVar += "            <\/div>";
                            strVar += "        <\/div>";
                        }

                        return strVar;
                    })
                    var htmlString = htmlStringArray.join('');
                    params.funcs.clearResult();
                    var parentElement = get('.result-list');
                    var old = parentElement.innerHTML;
                    var newElement = htmlString + old;
                    parentElement.innerHTML = newElement;
                    set('.user-search-box .result-header', "RESULT - " + htmlStringArray.length);
                    if (htmlStringArray.length == 0) {
                        var str = "No results found";
                        set('.user-search-box .result-list', str.bold().fontsize(5).fontcolor("gray"));
                    }
                }

                function clearResult() {
                    set('.result-list', '<div class="buffer" ></div>');
                    set('.user-search-box .result-header', "RESULT");
                }

                function searchUsers() {
                    d3.selectAll('.user-search-box')
                        .transition()
                        .duration(250)
                        .style('width', '300px')
                }

                function closeSearchBox() {
                    clearResult()
                    clear('.search-input');

                    d3.selectAll('.user-search-box')
                        .transition()
                        .duration(250)
                        .style('width', '0px')
                }

                function findInTree(rootElement, searchText) {
                    var condition;
                    var result = [];
                    // use regex to achieve case insensitive search and avoid string creation using toLowerCase method
                    var regexSearchWord = new RegExp(searchText, "i");
                    recursivelyFindIn(rootElement, searchText);
                    return result;
                    function recursivelyFindIn(user) {
                        if ((user.data.name.match(regexSearchWord))) {
                            result.push(user)
                        }
                        else {
                            if (user.data.noOfSpouses > 0) {
                                user.data.spouses.forEach(spouse => {
                                    if ((spouse.sname.match(regexSearchWord))) {
                                        result.push(user.data.spouses);
                                    }
                                });
                            }
                        }

                        if ((user.data.uniqueid.match(regexSearchWord))) {
                            result.push(user)
                            return;
                        }
                        else {
                            if (user.data.noOfSpouses > 0) {
                                user.data.spouses.forEach(spouse => {
                                    if ((spouse.suniqueid.match(regexSearchWord))) {
                                        result.push(user.data.spouses);
                                        condition = true;
                                    }
                                    if (condition == true)
                                        return;
                                });
                            }
                        }
                        var childUsers = user.children ? user.children : user._children;
                        if (childUsers) {
                            childUsers.forEach(function (childUser) {
                                recursivelyFindIn(childUser, searchText)
                            })
                        }
                    };
                }

                //******************  Locate Func ****************** 
                function locate(id) {
                    closeSearchBox();
                    /* collapse all and expand logged user nodes */
                    if (!root.children) {
                        if (!root.uniqueIdentifier == id) {
                            root.children = attrs.root._children;
                        }
                    }
                    
                    if (root.children) {
                        root.children.forEach(collapse);
                        root.children.forEach(function (ch) {

                            locateRecursive(ch, id)
                        });
                    }

                    update(root, { locate: locateId });
                }
                
                function locateRecursive(d, id) {

                    var condition = "false";

                    if (d.uniqueIdentifier == id) {
                        locateId = d.uniqueIdentifier;
                        expandParents(d);

                    } else if (d.data.noOfSpouses > 0) {
                        d.data.spouses.forEach(spouse => {
                            if (spouse.uniqueIdentifier == id) {
                                expandParents(d);
                            locateId = d.uniqueIdentifier;
                                condition = "true";
                            }
                        });
                        if (condition == "true"){
                            return ;
                        }
                        
                    }
                    if (d._children) {
                        d._children.forEach(function (ch) {
                            ch.parent = d;
                            locateRecursive(ch, id);
                        })
                    } else if (d.children) {
                        d.children.forEach(function (ch) {
                            ch.parent = d;
                            locateRecursive(ch, id);
                        });
                    };
                }

                //******************  listen() ****************** 
                function listen() {
                    var input = get('.user-search-box .search-input');
                    input.addEventListener('input', function () {
                        var value = input.value ? input.value.trim() : '';
                        if (value.length < 1) {
                            params.funcs.clearResult();
                        } else {
                            var searchResult = params.funcs.findInTree(root, value);
                            params.funcs.reflectResults(searchResult, value);
                        }
                    });
                }

                //******************  get, set, clear, getAll Functions ****************** 
                function set(selector, value) {
                    var elements = getAll(selector);
                    elements.forEach(function (element) {
                        element.innerHTML = value;
                        element.value = value;
                    })
                }

                function clear(selector) {
                    set(selector, '');
                }

                function get(selector) {
                    return document.querySelector(selector);
                }

                function getAll(selector) {
                    return document.querySelectorAll(selector);
                }
            }//drawOrganizationChart()
        })//childSnap()
    })//snap()
}