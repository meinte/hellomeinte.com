function init() {
  const mainElement = document.getElementsByTagName("main")[0];
  const read_moreButtons = T.gats(mainElement, "data-ui", "read_more") || [];
  const read_lessButtons = T.gats(mainElement, "data-ui", "read_less") || [];
  const moreContent = T.gats(mainElement, "data-ui", "more_content") || [];
  const allAnchors = document.getElementsByTagName("a");
  (function hideWorkContent() {
    for (var i = 0; i < moreContent.length; i++) {
      T.adcl(moreContent[i], "hidden");
    }
  })();
  (function addButtonsBehaviour() {
    var i = 0;
    var button = null;
    for (i = 0; i < read_moreButtons.length; i++) {
      button = read_moreButtons[i];
      button.addEventListener("click", readmore_clickHandler);
    }

    for (i = 0; i < read_lessButtons.length; i++) {
      button = read_lessButtons[i];
      button.addEventListener("click", readless_clickHandler);
    }
  })();

  (function anchorClickedBehaviour() {
    var i = 0;
    for (i = 0; i < allAnchors.length; i++) {
      const anchor = allAnchors[i];
      const href = anchor.href || "";
      if (href.indexOf("#") > -1) {
        const target = T.gid(href.split("#")[1]);
        if (target) {
          const contentElem = T.gcl(target, "content");
          anchor.addEventListener("click", () => showWorkContent(contentElem));
        }
      }
    }
  })();

  function readless_clickHandler(e) {
    const contentIndex = read_lessButtons.indexOf(this);
    T.adcl(moreContent[contentIndex], "hidden");
    T.rmcl(read_moreButtons[contentIndex], "hidden");
    e.preventDefault();
  }

  function readmore_clickHandler(e) {
    const contentElement = moreContent[read_moreButtons.indexOf(this)];
    showWorkContent(contentElement);
    e.preventDefault();
  }

  function showWorkContent(contentElement) {
    const contentIndex = moreContent.indexOf(contentElement);
    const img = contentElement.getElementsByTagName("img")[0];
    const moreButton = read_moreButtons[contentIndex];
    //load image when content is displayed
    if (img && img.hasAttribute("data-src")) {
      img.src = img.getAttribute("data-src");
    }
    if (moreButton) {
      T.adcl(moreButton, "hidden");
    }

    T.rmcl(contentElement, "hidden");
  }

  function hideWorkContent() {}
}
