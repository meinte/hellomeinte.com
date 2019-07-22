require("dotenv").config();
const debug = require("debug")("hellomeinte:main");
const error = require("debug")("hellomeinte:error");
const GhostContentAPI = require("@tryghost/content-api");
const handleBars = require("handlebars");
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");

const apiKey = process.env.GHOST_API_KEY;
const port = process.env.PORT;

debug("starting..");

handleBars.registerHelper("clientTitleEmphasize", clientTitle => {
  const split = clientTitle.split(":");
  return `${split[0]}: <em>${split[1]}</em>`;
});
handleBars.registerHelper("timelineTitleEmphasize", clientTitle => {
  const year = clientTitle.split("Timeline ")[1];
  const splitYear = year.split("20");
  return `20<em>${splitYear[1]}</em>`;
});

handleBars.registerHelper("tagList", (tags, delimiter) =>
  tags
    .filter(tag => tag.visibility === "public")
    .map(tag => tag.name)
    .join(delimiter)
);

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));

const api = new GhostContentAPI({
  url: "https://blog.hellomeinte.com",
  key: apiKey,
  version: "v2"
});

//Maps ghost page titles to handlebars IDs
//Pages not listed here will not be shown on the website
const WEBSITE_CONTENT_IDS = {
  main_intro: "main_intro",
  intro1: "intro1",
  contact_intro: "contact_intro",
  work_intro: "work_intro",
  timeline_intro: "timeline_intro",
  "client:Greenwheels": "greenwheels",
  "client:QGC": "qgc",
  "client:Macquarie": "macquarie",
  "client:Deloitte": "deloitte",
  other_work: "other_work",
  about: "about",
  "Timeline 2019": "t2019",
  "Timeline 2018": "t2018",
  "Timeline 2017": "t2017",
  "Timeline 2016": "t2016",
  "Timeline 2015": "t2015",
  "Timeline 2014": "t2014",
  "Timeline 2013": "t2013"
};

const filterOnGhostTitle = (pages, title) =>
  pages.find(page => page.title === title);

const grabGhostContent = () => {
  return api.pages
    .browse({
      fields: "html,title,custom_excerpt,feature_image",
      include: "tags",
      limit: "all",
      filter: "tag:hash-website",
      order: "title ASC"
    })
    .then(pages => {
      debug(pages);
      /**
       * Search content through their page titles.
       * In this case, titles are stored in the WEBSITE_CONTENT_IDS array.
       * Content is then mapped(reduced) in an object through its title
       */
      return Object.keys(WEBSITE_CONTENT_IDS).reduce((acc, title) => {
        const ghostContent = filterOnGhostTitle(pages, title) || {};
        return {
          ...acc,
          [WEBSITE_CONTENT_IDS[title]]: ghostContent
        };
      }, {});
    })
    .catch(err => {
      throw err; //main render function will deal with this
    });
};

const bundleContent = (content, withTitle) =>
  Object.keys(content).reduce((acc, itemKey) => {
    const item = content[itemKey];
    const arr = [...acc];
    if (!item.title) return arr;
    if (item.title.indexOf(withTitle) > -1) {
      arr.push(item);
      delete content[itemKey];
    }
    return arr;
  }, []);

app.get("/", function(req, res) {
  const start = new Date();

  grabGhostContent()
    .then(content => {
      content.clients = bundleContent(content, "client");
      content.timelines = bundleContent(content, "Timeline");
      return content;
    })
    .then(content => {
      debug("mapped content: ", content);
      debug("request duration ", new Date() - start);
      res.render("home", content);
    })
    .catch(err => {
      error(err);
      res.render("error", {
        error_msg: "Something went wrong, please try again later..."
      });
    });
});
app.listen(port, () => debug(`Listening on port ${port}!`));
