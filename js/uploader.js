/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};

(function ($, fluid) {

    /**
     * ImageGallery represents the client-side behaviour for the Uploader Image Gallery demo.
     */
    fluid.defaults("demo.imageGallery", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "demo.imageGallery.init",
                
        components: {
            checker: {
                type: "fluid.progressiveCheckerForComponent",
                options: {
                    componentName: "fluid.uploader"
                }
            },
            
            uploader: {
                type: "fluid.uploader",
                createOnEvent: "onReady",
                container: "{imageGallery}.dom.uploader",
                options: {
                    components: {
                        strategy: {
                            options: {
                                flashMovieSettings: {
                                    flashURL: "../infusion/src/webapp/lib/swfupload/flash/swfupload.swf",
                                    flashButtonImageURL: "../infusion/src/webapp/components/uploader/images/browse.png"
                                }
                            }
                        }
                    },
                    queueSettings: {
                        uploadURL: "{imageGallery}.uploadURL",
                        fileTypes: ["image/gif", "image/jpeg", "image/png", "image/tiff"],
                        fileSizeLimit: "20480",
                        fileUploadLimit: 0
                    },
                    // Boil Uploader's onFileSuccess and onFileError to match our component's semantics.
                    events: {
                        onSuccess: {
                            event: "onFileSuccess",
                            args: [
                                {
                                    fileName: "{arguments}.0.name",
                                    srcURL: "{arguments}.1"
                                }
                            ]
                        },
                        onError: {
                            event: "onFileError",
                            args: [
                                {
                                    fileName: "{arguments}.0.name",
                                    statusCode: "{arguments}.2"
                                }
                            ]
                        }
                    },
                    listeners: {
                        onSuccess: "{imagesView}.render",
                        onError: "{errorsView}.render"
                    }
                }
            },
            
            imagesView: {
                type: "demo.imageGallery.simpleRenderer",
                container: "{imageGallery}.dom.images",
                options: {
                    template: "<img src='%srcURL' alt='%fileName' class='ig-imageFrame' />"
                }
            },
            
            errorsView: {
                type: "demo.imageGallery.simpleRenderer",
                container: "{imageGallery}.dom.errors",
                options: {
                    template: "<div>%fileName failed to upload. HTTP status code: %statusCode</div>"
                }
            },
            
            settings: {
                type: "demo.imageGallery.settings",
                createOnEvent: "onReady",
                options: {
                    model: "{imageGallery}.options.components.uploader.options.queueSettings",
                    listeners: {
                        modelChanged: "{imageGallery}.resetUploader"
                    }
                }
            }
        },
        
        selectors: {
            uploader: ".ig-multiFileUploader",
            settings: ".ig-settings",
            images: ".ig-imageViewer-images",
            errors: ".ig-serverErrors"
        },
        
        events: {
            onReady: null
        },
        
        // The URL to the Uploader's template.
        templateURL: "../infusion/src/webapp/components/uploader/html/Uploader.html",
        
        // A selector pointing to the portion of the Uploader's template that we're interested in.
        templateSelector: ".fl-uploader",
        
        serverURLPrefix: "uploader.php?session="
    });
    
    demo.imageGallery.init = function (that) {
        that.sessionID = Math.random().toString(16).substring(2);
        that.uploadURL = that.options.serverURLPrefix + that.sessionID;    
        
        that.loadUploaderTemplate = function () {
            var urlSelector = that.options.templateURL + " " + that.options.templateSelector;
            that.locate("uploader").load(urlSelector, function () {
                that.events.onReady.fire();
            });
        };
        
        that.destroyUploader = function () {
            that.locate("uploader").empty();
            if (fluid.get(that, "uploader.strategy.engine")) {
                var su = that.uploader.strategy.engine.swfUpload;
                su.destroy();
            }
        };
        
        that.resetUploader = function (options) {
            that.destroyUploader();
            that.loadUploaderTemplate();
        };
        
        that.loadUploaderTemplate();
    };
    
    
    /**
     * SimpleRenderer injects a single element rendered from a string template into the DOM.
     */
    fluid.defaults("demo.imageGallery.simpleRenderer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "demo.imageGallery.simpleRenderer.init",
        template: ""
    });
    
    demo.imageGallery.simpleRenderer.init = function (that) {
        that.render = function (values) {
            var renderedMarkup = fluid.stringTemplate(that.options.template, values);
            that.container.append(renderedMarkup);
        };
    };
    
    
    /**
     * Settings controls the form that allow a user to customize the Uploader's options.
     */
    fluid.defaults("demo.imageGallery.settings", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "demo.imageGallery.settings.init",
        selectors: {
            fileSizeLimit: "#fileSizeLimit",
            fileUploadLimit: "#fileUploadLimit",
            fileTypes: "#fileTypes"
        },
        protoTree: {
            fileSizeLimit: "${fileSizeLimit}",
            fileUploadLimit: "${fileUploadLimit}",
            fileTypes: "${fileTypes}"
        },
        events: {
            modelChanged: null
        },
        styles: {
            hidden: "fl-hidden"
        }
    });
    
    demo.imageGallery.settings.init = function (that) {
        // TODO: Replace these with model transformation.
        that.events.prepareModelForRender.addListener(function (model) {
            model.fileTypes = fluid.isArrayable(model.fileTypes) ? 
                model.fileTypes.join(",") : model.fileTypes;
        });
        that.applier.modelChanged.addListener("*", function (model) {
            model.fileTypes = model.fileTypes ? model.fileTypes.split(",") : undefined;
        });
        
        // TODO: Replace this with a declarative listener when the framework supports it.
        that.applier.modelChanged.addListener("*", function (model) {
            that.events.modelChanged.fire(model);
        });
        
        that.refreshView();
        that.container.removeClass(that.options.styles.hidden);
    };
    
    fluid.demands("demo.imageGallery.settings", ["demo.imageGallery", "fluid.uploader.multiFileUploader"], {
        funcName: "demo.imageGallery.settings",
        container: "{imageGallery}.dom.settings"
    });
    
    fluid.demands("demo.imageGallery.settings", ["demo.imageGallery", "fluid.uploader.singleFileUploader"], {
        funcName: "fluid.emptySubcomponent"
    });
    
})(jQuery, fluid);
