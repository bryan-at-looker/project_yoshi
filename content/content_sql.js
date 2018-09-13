////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// This extracts instance info from Looker and adds quick navigation-bar      //
// to a few admin pages                                                       //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// set to true for verbose logging

chrome.storage.sync.get(['chart_type', 'dashboard_default', 'host'], function(items) {

    var debug_mode = false;

    // var path = "looker.com/sql/"
    var path = items.host + "/sql"

    url_position = window.location.href.indexOf(path)

    // check if we're on a Looker sql
    if (url_position > -1) {
        var sql_slug = window.location.href.substring(path.length + url_position)

        // add top nav buttons to users, connections, ...
        try {

            // create buttons
            setTimeout(function() {
                var modal = ` <!-- Modal -->
                  <div class="modal fade" id="LicenseFeaturesModal" tabindex="-1" role="dialog" aria-labelledby="LicenseFeaturesModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="LicenseFeaturesModalLabel">Add SQL to Dashboard</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div class="modal-body">
                        <p style="color: black; font-size: 12px;">Default Chart Type</p>
                          <span width="50%"><select class="form-control ng-pristine ng-untouched ng-valid ng-not-empty" id="chart_type">
                           <option value="table">Table</option>
                           <option value="looker_column">Column</option>
                           <option value="looker_bar">Bar</option>
                           <option value="looker_scatter">Scatter</option>
                           <option value="looker_line">Line</option>
                           <option value="looker_area">Area</option>
                           <option value="single_value">Single Value</option>
                          </select></span>
                        <br><p style="color: black; font-size: 12px;">Enter Dashboard Number</p>
                        <span width="50%"><input class="explore-filter-field form-control number ng-pristine ng-untouched ng-valid ng-not-empty" value="` + items.dashboard_default.trim() + `" style="color: black" type="text" id="dashboard_id" name="dashboard_id" /></span>
                        </div>
                        <div class="modal-footer">
                          <button id="add-to-dashboard" onClick='addToDashboard()' type="button" class="btn btn-primary" data-dismiss="modal">Add to Dashboard</button>
                          <button type="button" onClick="showOptions()" class="btn btn-secondary" id="go-to-options">Options</button>
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                      </div>
                    </div>
                  </div> `
                var license_features_button = `
                  <script>
                  var editorExtensionId = "alfbbdbigdbjnmdhhkefemcapmeobghn";

                  function showOptions() {
                    chrome.runtime.sendMessage(editorExtensionId, {"type": "option"}, 
                      function (response) {});
                  }

                          
                  function addToDashboard() {
                    var dashboard_id = document.getElementById("dashboard_id").value
                    var chart_type = document.getElementById("chart_type").value
                    window.location.hash = dashboard_id.trim()+','+chart_type.trim();
                    // The ID of the extension we want to talk to.

                    // Make a simple request:
                    chrome.runtime.sendMessage(editorExtensionId, {"type": "dashboard"}, 
                      function (response) {});
                    }
                  </script>
                  <button style="margin-top: 3px;" type="button" class="btn btn-default wide ng-scope" data-toggle="modal" data-target="#LicenseFeaturesModal">
                    Add SQL to Dashboard
                  </button>`

                $(".lk-title-controls.ng-scope").prepend(license_features_button);
                $("body").prepend(modal);
                
            }, 5000);

        } catch (err) {
            debugLog(err)
        }
    };

    // helper functions
    // clear all injected html
    // function clearInjected() {
    //   $( '.ll_remove' ).remove();
    // }

    function createNavButton(label, meta_path) {
        return "<li class='navbar-search ll_remove'><a href='" + meta_path + "'><div class='text'>" + label + "</div></a></li>";
    }

    // console logger
    function debugLog(data) {
        if (debug_mode) {
            console.log("DEBUG :: " + data);
        }
    }

    function myAlert() {
        console.log('hello')
    }

})