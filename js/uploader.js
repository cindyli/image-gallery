/*global jQuery*/
/*global fluid*/

var demo = demo || {};

(function ($, fluid) {
    demo.initUploader = function () {
        var sessionID = Math.random().toString(16).substring(2);
    
        // Load the Uploader's template via AJAX and inject it into this page.
        var templateURLSelector = "[INFUSION_PATH]/src/webapp/components/uploader/html/Uploader.html .fl-uploader";
        $("#uploader-contents").load(templateURLSelector, null, function () {
            
            // Initialize the Uploader
            fluid.uploader(".flc-uploader", {
                components: {
                    strategy: {
                        options: {
                            flashMovieSettings: {
                                flashURL: "[INFUSION_PATH]/src/webapp/lib/swfupload/flash/swfupload.swf",
                                flashButtonImageURL: "[INFUSION_PATH]/src/webapp/components/uploader/images/browse.png"
                            }
                        }
                    }
                },
                queueSettings: {
                    // Set the uploadURL to the URL for posting files to your server.
                    uploadURL: "uploader.php?session=" + sessionID,
                    fileTypes: "*.gif;*.jpeg;*.jpg;*.png;*.tiff;*.tif"
                },
                listeners: {
                    onFileSuccess: function (file, responseText, xhr) {
                        // the server code passes the new image URL in the responseText
                        $('#image-space').append('<img src="' + responseText + '" alt="' + file.name + '" class="image-frame" />');
                    },
                    onFileError: function (file, error, status, xhr) {
                        $('#server-error').append(file.name + " : Failed uploading. HTTP Status Code: " + status + "<br />");
                    }
                }
            });
        });
    };
})(jQuery, fluid);