// ==UserScript==
// @name         Anthonys Master Addon
// @version      0.1
// @include      *cxunity*
// @include      *responsys*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @grant        GM_addStyle
// @downloadURL  downloadurlhere
// @updateURL    updateURLhere
// ==/UserScript==

//-- STYLING

GM_addStyle
( `
    #gmRightSideBar {
        position:               fixed;
        top:                    0;
        right:                  0;
        bottom:                 0;
        margin:                 1ex;
        padding:                1em;
        background:             #eee;
        border-style:           solid;
        border-radius:          6px;
        width:                  300px;
        z-index:                6666;
        opacity:                0.9;
    }
    #gmRightSideBar p {
        font-size:              80%;
    }
    #gmRightSideBar ul {
        margin:                 0ex;
        list-style-type:        circle;
    }
    #gmRightSideBar a {
        color:                  blue;
    }
    #gmRightSideBar li {
        font-size:              14px;
    }
`
);

//-- Unity Navigation URLs
expertConfigURL = "/data/?root=expertConfig";
homeURL = "/analytics/?root=dashboard";
oneTimeCampaignsURL = "/analytics/?root=campaignsAnalytics";
recurringCampaignssURL = "/analytics/?root=recurringCampaigns";
dataModelURL = "/data/?root=customerData";
dataViewerURL = "/data/?root=dataViewer";
masterEntitiessURL = "/data/?root=deduplication";
intelligentAttributesURL = "/data/?root=intelligentAttribute";
eventsURL = "/data/?root=events";
intelligentWorkbenchsURL = "/datascience/?root=dataScienceModels";
sourcessURL = "/integration/?root=sources";
destinationssURL = "/integration/?root=destination";
dataFeedssURL = "/data/?root=jobs";
jobssURL = "/data/?root=jobsDashboard";
segmentssURL = "/segmentation/?root=manageSegments";
campaignssURL = "/integration/?root=campaigns";
profileExplorersURL = "/data/?root=profileExplorer";
adminURL = "/framework/?root=userRoles";
settingsURL = "/?root=settings";

//-- Sidebar HTML
var unitySidebarContent = `
<div id="gmRightSideBar" style="display: none;">
    <div>
    <details open="true">
        <summary>
        <span>Navigation</span>
        </summary>
        <ul>
            <li onclick="urlNavigation(expertConfigURL)">Expert Config</li>
            <li onclick="urlNavigation(dataModelURL)">Data Model</li>
            <li onclick="urlNavigation(dataViewerURL)">Data Viewer</li>
            <li onclick="urlNavigation(jobssURL)">Jobs</li>
            <li onclick="urlNavigation(dataFeedssURL)">Data Feeds</li>
            <li onclick="urlNavigation(segmentssURL)">Segments</li>
            <li onclick="urlNavigation(intelligentWorkbenchsURL)">Intelligent Workbench</li>
            <li onclick="urlNavigation(intelligentAttributesURL)">Intelligent Attribute</li>
        </ul>
    </div>
    <br>
    </details>
    <div id="expertconfig" style="display: none;">
        <details open="true">
        <summary>
        <span>MCPS</span>
        </summary>
            <ul>
                <li onclick="setexpertconfigfields('GET','/metadata/','mcpsqueries')">Get all MCPS queries</li>
                <li onclick="setexpertconfigfields('GET','/metadata/','mcpsqueries','','getspecific')">Get specific MCPS query</li>
                <li onclick="setexpertconfigfields('POST','/data/','query/count')">Count Query</li>
                <li onclick="setexpertconfigfields('POST','/data/','query/generate')">Generate SQL</li>
                <li onclick="sqlapi()">Format SQL</li>
                <li onclick="setexpertconfigfields('POST','/data/','query/execute')">Execute query</li>
                <li onclick="setexpertconfigfields('GET','cxunity','','segments')">Segments</li>
            </ul>
        </details>
        <br>
        <details open="true">
        <summary>
        <span>Job Logs</span>
        </summary>
        <label>Job Type: </label>
            <select name="jobType" id="jobType">
                <option value="INGEST">Ingest</option>
                <option value="EXPORT">Export</option>
                <option value="QUERYEXPORT">Query Export</option>
                <option value="CAMPAIGN">Campaign</option>
            </select><br>
            <label>JobID: </label><input type="text" id="jobID" name="jobID" value="" size="30"><br>
            <label>RunID: </label><input type="text" id="runID" name="runID" value="" size="30"><br>
            <label>VesionTS: </label><input type="text" id="versionTS" name="versionTS" value="" size="30"><br>
            <button onclick="setexpertconfigfields('GET','/admin/','job','','getruns')">Get Runs</button>
            <button onclick="setexpertconfigfields('GET','/admin/','job','','getspecificrun')">Get Specific Run</button>
        </details>
        <br>
        <details open="true">
        <summary>
        <span>Models/DCS/Attributes</span>
        </summary>
            <ul>
                <li onclick="setexpertconfigfields('GET','/metadata/','models')">Get models</li>
                <li onclick="setexpertconfigfields('GET','/metadata/','datasourceviews')">Get DSVs</li>      
                <li onclick="setexpertconfigfields('GET','/metadata/','aggregatedtables/MasterCustomer/aggregatedattributes')">Get aggregated attributes</li>
        </details>
        <br> 
    </div>
</div>
`

var responsysSidebarContent = `
<div id="gmRightSideBar" style="display: none;">
    <h3>Responsys Navigation</h3>
        <ul>
             <li onclick="EmailCampaignbyID()">Open Email Campaign by ID</li>
             <li onclick="PushCampaignbyID()">Open Push Campaign by ID</li>
             <li onclick="ProgrambyID()">Open Program by ID</li>
             <li onclick="currentProgramDebug()">Open current Program in Debug</li>
        </ul>
    </div>
`

//-- Build Sidebar
if (location.origin.indexOf("cxunity")>=0) {
    $("body").append (unitySidebarContent);
    if (location.search == "?root=expertConfig") {
        $("#expertconfig").show();
    }
}
else if (location.origin.indexOf("responsys")>=0) {
    $("body").append (responsysSidebarContent);
}

//-- Keyboard shortcut to show/hide the sidebar
var kbShortcutFired = false;
var rightSideBar = $('#gmRightSideBar');
$(window).keydown (keyboardShortcutHandler);
    function keyboardShortcutHandler (zEvent) {
        //--- On §, Toggle our panel's visibility
        if (zEvent.which == 192) {  // §
            kbShortcutFired = true;

            if (rightSideBar.is (":visible") ) {
                rightSideBar.stop (true, false).hide ();
            }
            else {
                //-- Reappear opaque to start
                rightSideBar.stop (true, false).show ();
                //rightSideBar.fadeTo (0, 1);
                //rightSideBar.fadeTo (2900, 0.1);
            }

            zEvent.preventDefault ();
            zEvent.stopPropagation ();
            return false;
        }
    }

//-- UNITY FUNCTIONS
    //-- Navigation URL builder
    urlNavigation = function (newDestination) {
        var newURL=window.open(location.origin+newDestination,"_self","");
        newURL.focus();
    }

    //-- ExpertConfig: Click run button
    runexpertconfig = function() {
        $(".oj-button-button").click();
    }

    //-- ExpertConfig: Get all MCPS Queries
    setexpertconfigfields = function(oj1,oj2,ep,oj3,info) {
        //-- popup to set limit for execute
        if (ep == "query/execute") {
            var limit = prompt("how many records do you want?","");
            if (limit!=null) {
                var ep = ep+"?limit="+limit
            }
        }
        if (info == "getspecific") {
            var mcpsquery = prompt("Which MCPS query do you want to fetch?","");
            if (mcpsquery!=null) {
                var ep = ep+"/"+mcpsquery
            }
        }
        if (info == "getruns") {
            var ep = "job/"+$('#jobType').find(":selected").val()+"/"+$('#jobID').val()+"/runs"
        }
        if (info == "getspecificrun") {
            var ep = "job/"+$('#jobType').find(":selected").val()+"/"+$('#jobID').val()+"/runs/"+$('#runID').val()+"?versionTS="+$('#versionTS').val()
        }
        $("#oj-select-1").val(oj1);
        $("#oj-select-2").val(oj2);
        $("#endpoint").val(ep);
        $(".unity-api-list").val(oj3);
        //-- Auto run query if using a GET request
        if (oj1 == "GET") {
            $(".oj-button-button").click();
        }
    }

//-- RESPONSYS FUNCTIONS
    //-- Open Email Campaign by ID
    EmailCampaignbyID = function() {
        var acct=prompt("What Campaign ID would you like to open?","");
        if(acct!=null){
        if(typeof(nw)=="undefined"||nw.closed){
            var nw=window.open(location.origin+"/emd/c/campaigndesigner/framework/page/launch?campaignId="+acct,"_self","");
        }
    nw.focus();
        }
    }

    //-- Open Push Campaign by ID
    PushCampaignbyID = function() {
        var acct=prompt("What Push Campaign ID would you like to open?","");
        if(acct!=null){
        if(typeof(nw)=="undefined"||nw.closed){
            var nw=window.open(location.origin+"/push/c/campaigndesigner/framework/page/launch?campaignId="+acct,"_self","");
        }nw.focus();
        }
    }

    //-- Open Program by ID
    ProgrambyID = function() {
        var acct=prompt("What Program ID would you like to open?","");
        if(acct!=null){
        if(typeof(nw)=="undefined"||nw.closed){
            var nw=window.open(location.origin+"/workflowdesigner/c/program/edit/"+acct,"_self","");
        }nw.focus();
        }
    }

    //-- Open Current program in Debug
    currentProgramDebug = function() {
        if((location.href.indexOf("workflowdesigner") <0)) {
            alert("You are not currently in a program.\nOpen a program then try again")
        }
        else{
            var nw=window.open(location.origin+location.pathname+"?&execMode=debug&viewIds=true","_self","");
        nw.focus();}
        }

//-- MULTIUSE FUNCTIONS
    // FUNCTION : Call SQL API
    sqlapi = function(rawsql) {
        var rawsql = $("#jsonResult").val();
        jQuery.ajax({
        url: 'https://sqlformat.org/api/v1/format',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            sql: rawsql,
            reindent: 1,
            indent_width: 1,
            wrap_after: 100
            }
        }).done(function(data, textStatus, xhr) {
            // Success
            $("#jsonResult").val(data.result);

        }).fail(function(err) {
            // Fail
            // ADD ERROR DETAILS
             console.log("LOG | FAIL | " + err);
        });
    };