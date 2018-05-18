
var main;
if (process.env.NODE_ENV == "Release") {
	main = require("../clang/build/Release/main.node");
} else {
	main = require("../clang/build/Debug/main.node");
}
console.log("NODE_ENV: ", process.env.NODE_ENV);
console.log(main);

main.start_main_server();

