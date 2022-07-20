// Import modules
const express = require("express");
const { engine } = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

// Creates an Express Web Server
const app = express();

// Handlebars Middleware
app.engine(
  "handlebars",
  engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "main", // Specify default template views/layout/main.handlebar
  })
);
app.set("view engine", "handlebars");

// Express middleware to parse HTTP body in order to read HTTP data
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, "public")));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Library to use MySQL to store session objects
const MySQLStore = require("express-mysql-session");
var options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  clearExpired: true,
  // The maximum age of a valid session; milliseconds:
  expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
  // How frequently expired sessions will be cleared; milliseconds:
  checkExpirationInterval: 1800000, // 30 min
};

// To store session information. By default it is stored as a cookie on browser
app.use(
  session({
    key: "session",
    secret: "div",
    store: new MySQLStore(options),
    resave: false,
    saveUninitialized: false,
  })
);

// Bring in database connection
const DBConnection = require("./config/DBConnection");
// Connects to MySQL database
DBConnection.setUpDB(false); // True to set up database with new tables

// Place to define global variables
app.use(function (req, res, next) {
  next();
});

// mainRoute is declared to point to routes/main.js
const mainRoute = require("./routes/main");
const tutorRoute = require("./routes/tutor");

// Any URL with the pattern ‘/*’ is directed to routes/main.js
app.use("/", mainRoute);
app.use("/tutor", tutorRoute);

// Creates a port for express server.
const port = 5000;

// Starts the server and listen to port
app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
