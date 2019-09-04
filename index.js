require("dotenv").config();
const debug = require("debug")("hellomeinte:main");
const error = require("debug")("hellomeinte:error");
const GhostContentAPI = require("@tryghost/content-api");
const handleBars = require("handlebars");
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const ghostUtils = require("./ghost-utils");
const hbsHelpers = require("./handlebars-helpers");

const apiKey = process.env.GHOST_API_KEY;
const port = process.env.WWWPORT;
const isProduction = process.env.NODE_ENV === "production";

debug("starting..");

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));

const api = new GhostContentAPI({
  url: "https://blog.hellomeinte.com",
  key: apiKey,
  version: "v2"
});

hbsHelpers(handleBars);

//Maps ghost page titles to handlebars IDs
//Pages not listed here will not be shown on the website
const WEBSITE_CONTENT_IDS = {
  pagedescription: "pagedescription",
  main_intro: "main_intro",
  intro1: "intro1",
  contact_intro: "contact_intro",
  work_intro: "work_intro",
  timeline_intro: "timeline_intro",
  "client:Greenwheels": "greenwheels",
  "client:QGC": "qgc",
  "client:Macquarie University": "macquarie",
  "client:Deloitte": "deloitte",
  other_work: "other_work",
  about: "about",
  "Timeline 2019": "t2019",
  "Timeline 2018": "t2018",
  "Timeline 2017": "t2017",
  "Timeline 2016": "t2016",
  "Timeline 2015": "t2015",
  "Timeline 2014": "t2014",
  "Timeline 2013": "t2013",
  "Timeline 2012": "t2012",
  "Timeline 2011": "t2011"
};

//hard caching of content, never invalidates unless service is restarted.
let cachedContent = null;
app.get("/", function(req, res) {
  if (cachedContent && isProduction) {
    debug("using cached content");
    res.render("home", cachedContent);
    return;
  }
  const start = new Date();

  ghostUtils
    .grabGhostContent(api, WEBSITE_CONTENT_IDS)
    .then(content => {
      content.clients = ghostUtils.bundleContent(content, "client");
      content.timelines = ghostUtils.bundleContent(content, "Timeline");
      return content;
    })
    .then(content => {
      debug("mapped content: ", content);
      debug("request duration ", new Date() - start);
      cachedContent = content;
      res.render("home", content);
    })
    .catch(err => {
      error(err);
      res.render("error", {
        error_msg: "Something went wrong, please try again later..."
      });
    });
});

app.get("/projects/vfrg", function(req, res) {
  res.render("project", {});
});

app.listen(port, () => debug(`Listening on port ${port}!`));
