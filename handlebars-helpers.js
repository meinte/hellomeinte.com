module.exports = handleBars => {
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
};
