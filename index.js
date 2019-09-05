require("dotenv").config();
const debug = require("debug")("hellomeinte:main");
const error = require("debug")("hellomeinte:error");

const GhostContentAPI = require("@tryghost/content-api");
const handleBars = require("handlebars");
const express = require("express");
const exphbs = require("express-handlebars");

const ghostUtils = require("./ghost-utils");
const hbsHelpers = require("./handlebars-helpers");
const portfolioContentIds = require("./config/portfolio-content-ids.json");

const API_KEY = process.env.GHOST_API_KEY;
const PORT = process.env.WWWPORT;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

debug("starting..");
const app = express();
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));

hbsHelpers(handleBars);

const api = new GhostContentAPI({
  url: "https://blog.hellomeinte.com",
  key: API_KEY,
  version: "v2"
});

const projectNotFound = res => {
  res.status(400);
  res.render("error", {
    error_msg: "Bad request, please provide a valid project URL..."
  });
};

const generalError = (err, res) => {
  error(err);
  res.status(500);
  res.render("error", {
    error_msg: `<p>Something went wrong...</p><p>${err.message}</p>`
  });
};

//hard caching of content, never invalidates unless service is restarted.
let cachedContent = {};
app.get("/", function(req, res) {
  if (cachedContent["root"] && IS_PRODUCTION) {
    debug("using cached content");
    res.render("home", cachedContent["root"]);
    return;
  }
  const start = new Date();

  ghostUtils
    .grabPortfolio(api, portfolioContentIds)
    .then(content => {
      content.clients = ghostUtils.bundleContent(content, "client");
      content.timelines = ghostUtils.bundleContent(content, "Timeline");
      return content;
    })
    .then(content => {
      debug("mapped content: ", content);
      debug("request duration ", new Date() - start);
      cachedContent["root"] = content;
      res.render("home", content);
    })
    .catch(err => generalError(err, res));
});

app.get("/projects/*", function(req, res) {
  const projectId = req.url.split("/projects/")[1];
  if (!projectId.length) {
    return projectNotFound(res);
  }

  ghostUtils
    .grabProject(api, projectId)
    .then(page => {
      if (!page || !page.html) {
        throw new Error(`Project not found with ID: ${projectId}`);
      }
      res.render("project", page);
    })
    .catch(err => generalError(err, res));
});

app.listen(PORT, () => debug(`Listening on port ${PORT}!`));
