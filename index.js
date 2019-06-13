require("dotenv").config();
const debug = require("debug")("hellomeinte:main");
const error = require("debug")("hellomeinte:error");
const GhostContentAPI = require("@tryghost/content-api");
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");

const apiKey = process.env.GHOST_API_KEY;
const port = process.env.PORT;

debug("starting..");

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));

const api = new GhostContentAPI({
  url: "https://blog.hellomeinte.com",
  key: apiKey,
  version: "v2"
});

const WEBSITE_CONTENT_IDS = ["intro1"];

const filterOnGhostTitle = (pages, title) =>
  pages.find(page => page.title === title);

const grabGhostContent = () => {
  return api.pages
    .browse({
      fields: "html,title",
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
      return WEBSITE_CONTENT_IDS.reduce((acc, title) => {
        return {
          ...acc,
          [title]: filterOnGhostTitle(pages, title).html
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
      debug(content);
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
