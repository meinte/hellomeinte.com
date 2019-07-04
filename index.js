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
  const split = clientTitle.split(" ");
  return `${split[0]}<em>${split[1]}</em>`;
});

handleBars.registerHelper("clientTags", tags =>
  tags
    .filter(tag => tag.visibility === "public")
    .map(tag => tag.name)
    .join(" | ")
);

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));

const api = new GhostContentAPI({
  url: "https://blog.hellomeinte.com",
  key: apiKey,
  version: "v2"
});

//Maps ghost title to handlebars IDs
const WEBSITE_CONTENT_IDS = {
  intro1: "intro1",
  contact_intro: "contact_intro",
  work_intro: "work_intro",
  "client: QGC": "qgc",
  "client: Macquarie University": "macquarie",
  "client: Deloitte": "deloitte",
  other_work: "other_work",
  about: "about"
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
       * Search content through their titles.
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

app.get("/", function(req, res) {
  grabGhostContent()
    .then(content => {
      content.clients = Object.keys(content).reduce((acc, itemKey) => {
        const item = content[itemKey];
        const arr = [...acc];
        if (item.title.indexOf("client") > -1) {
          arr.push(item);
          delete content[itemKey];
        }
        return arr;
      }, []);
      return content;
    })
    .then(content => {
      debug("mapped content: ", content);
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
