

// ========================
// ========================


var Handler = function(app) {
    this.app = app;
};


Handler.prototype.init = function(msg, session, next) {
    
};

module.exports = function(app) {
    return new Handler(app);
};


