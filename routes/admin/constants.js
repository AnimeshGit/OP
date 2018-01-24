function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("success_msg", "Done!!");
define("base_url","http://127.0.0.1:4700/");