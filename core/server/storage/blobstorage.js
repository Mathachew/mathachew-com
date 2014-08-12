// # Local File System Image Storage module
// The (default) module for storing images, using the local file system

var _ = require('lodash'),
    express = require('express'),
    fs = require('fs-extra'),
    azure = require('azure-storage'),
    blobService = azure.createBlobService(),
    nodefn = require('when/node/function'),
    path = require('path'),
    when = require('when'),
    errors = require('../errors'),
    config = require('../config'),
    baseStore = require('./base'),
    container = 'blog-images',
    localFileStore;

localFileStore = _.extend(baseStore, {
    // ### Save
    // Saves the image to blob storage
    // - image is the express image object
    // - returns a promise which ultimately returns the full url to the uploaded image
    'save': function (image) {
        var saved = when.defer(),
            targetFilename;

        this.getUniqueFileName(this, image, '').then(function(filename) {
            targetFilename = filename;
            //  ensure container exists
            return nodefn.call(function(callback) {
              blobService.createContainerIfNotExists(container, { publicAccessLevel: 'blob' }, callback);
            });
        }).then(function () {
            // copy file to blob
            return nodefn.call(function(callback) {
              blobService.createBlockBlobFromLocalFile(container, targetFilename, image.path, callback);
            });
        }).then(function() {
            // Remove temp image
            return nodefn.call(fs.unlink, image.path).otherwise(errors.logError);
        }).then(function() {
            var fullUrl = blobService.getUrl(container, targetFilename);
            return saved.resolve(fullUrl);
        }).otherwise(function (e) {
            errors.logError(e);
            return saved.reject(e);
        });

        return saved.promise;
    },

    'exists': function (filename) {
        var done = when.defer();

        blobService.doesBlobExist(container, filename, function(err, exists) {
            done.resolve(exists);
        });

        return done.promise;
    },

    // middleware for serving the files
    'serve': function () {
        // For some reason send divides the max age number by 1000
        return express['static'](config.paths.imagesPath, {maxAge: utils.ONE_YEAR_MS});
    }
});

module.exports = localFileStore;
