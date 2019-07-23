function init() {
  const MAX_TIMELINES = 3;

  const mainElement = document.getElementsByTagName("main")[0];
  const read_moreButtons = T.gats(mainElement, "data-ui", "read_more") || [];
  const read_lessButtons = T.gats(mainElement, "data-ui", "read_less") || [];
  const moreContent = T.gats(mainElement, "data-ui", "more_content") || [];

  const allAnchors = document.getElementsByTagName("a");

  const moreTimelinesButton = T.gat(
    mainElement,
    "data-ui",
    "show_all_timelines"
  );

  const timelines = T.gid("timelines");
  if (!timelines) return;
  const numTimelines = parseInt(
    timelines.getAttribute("data-num-timelines"),
    10
  );

  moreTimelinesButton.addEventListener("click", () => {
    T.adcl(moreTimelinesButton, "hidden");
    showAllTimelines();
  });

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

  (function hideTooManyTimelines() {
    if (numTimelines > MAX_TIMELINES) {
      for (var i = MAX_TIMELINES; i < numTimelines; i++) {
        const timeline = T.gid(`timeline_${i}`);
        if (timeline) {
          T.adcl(timeline, "hidden");
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

  const showAllTimelines = () => {
    for (var i = 0; i < numTimelines; i++) {
      const timeline = T.gid(`timeline_${i}`);
      if (timeline) {
        T.rmcl(timeline, "hidden");
      }
    }
  };

  const showWorkContent = contentElement => {
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
  };
}
