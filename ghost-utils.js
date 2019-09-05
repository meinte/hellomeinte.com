const debug = require("debug")("hellomeinte:ghost-utils");

const filterOnGhostTitle = (pages, title) =>
  pages.find(page => page.title === title);

const grabProject = (api, project) => {
  debug(`grabbing project: tag:hash-project-${project}`);
  return api.pages
    .browse({
      fields: "html,title",
      limit: "1",
      filter: `tag:hash-project-${project}`
    })
    .then(pages => {
      if (!pages.length) return null;
      return pages[0];
    })
    .catch(err => {
      throw err; //main render function will deal with this
    });
};

const grabPortfolio = (api, contentIds) => {
  return api.pages
    .browse({
      fields: "html,slug,title,custom_excerpt,feature_image",
      include: "tags",
      limit: "all",
      filter: "tag:hash-website",
      order: "title ASC"
    })
    .then(pages => {
      debug(pages);
      /**
       * Search content through their page titles.
       * In this case, titles are stored in the contentIds array.
       * Content is then mapped(reduced) in an object through its title
       */
      return Object.keys(contentIds).reduce((acc, title) => {
        const ghostContent = filterOnGhostTitle(pages, title) || {};
        return {
          ...acc,
          [contentIds[title]]: ghostContent
        };
      }, {});
    })
    .catch(err => {
      throw err; //main render function will deal with this
    });
};

//bundle similar content keys into one array
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

module.exports = {
  grabProject,
  grabPortfolio,
  bundleContent
};
