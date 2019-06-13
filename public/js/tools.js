/**
 * ...
 * @author Meinte van't Kruis
 */

var D = {
  LVL_NONE: 0,
  LVL_INFO: 1 << 1,
  LVL_NOTICE: 1 << 2,
  LVL_ERROR: 1 << 3
};

D.stackTrace = function(message) {
  try {
    throw new Error(message);
  } catch (e) {
    console.log(e.stack);
  }
};

D.log = (function(DEBUG_LEVEL) {
  function log(message, level) {
    if (!shouldLog(level)) return;
    var logFunc = console.log;
    switch (level) {
      case D.LVL_NOTICE:
        logFunc = console.warn;
        break;
      case D.LVL_ERROR:
        logFunc = console.error;
        break;
      default:
        logFunc = console.log;
        break;
    }

    logFunc.apply(console, [message]);
  }

  function shouldLog(level) {
    return (
      (DEBUG_LEVEL | level) == DEBUG_LEVEL ||
      DEBUG_LEVEL == null ||
      DEBUG_LEVEL == undefined
    );
  }

  return log;
})(D.LVL_NOTICE | D.LVL_ERROR);

var T = {};

T.twin = function(elem) {
  var pos = elem.getBoundingClientRect();
  var twin = elem.cloneNode(true);
  twin.style.opacity = 0;
  twin.style.position = "absolute";
  twin.style.top = pos.top + "px";
  twin.style.left = pos.left + "px";
  twin.style["z-index"] = 1000;
  twin.style.zIndex = 1000;

  return twin;
};

T.pos = function(elem, x, y, positioning) {
  if (!positioning) positioning = "relative";

  elem.style.position = positioning;
  elem.style.top = y + "px";
  elem.style.left = x + "px";
};

T.scale = function(elem, value) {
  var sString = "scale(" + value + "," + value + ")";

  elem.style.webkitTransform = sString;
  elem.style.MozTransform = sString;
  elem.style.msTransform = sString;
  elem.style.OTransform = sString;
  elem.style.transform = sString;
};

T.del = function(elem) {
  if (!elem) return;
  if (!elem.parentNode) return;
  elem.parentNode.removeChild(elem);
};

T.uniq_arr = function(arr) {
  var u = {},
    a = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (u.hasOwnProperty(arr[i])) {
      continue;
    }
    a.push(arr[i]);
    u[arr[i]] = 1;
  }
  return a;
};

T.enbl = function(elem) {
  if (!elem.mouseShield) return;
  elem.disabled = false;
  var mouseShield = elem.mouseShield;
  T.del(mouseShield);
  elem.mouseShield = null;
};

T.dsbl = function(elem) {
  if (elem.mouseShield) return;
  elem.disabled = true;
  var bRect = elem.getBoundingClientRect();

  var mouseShield = document.createElement("div");

  mouseShield.style.width = bRect.width + "px";
  mouseShield.style.height = bRect.height + "px";
  mouseShield.style.backgroundColor = "red";
  mouseShield.style.opacity = 0;
  mouseShield.style["top"] = bRect.top + "px";
  mouseShield.style["left"] = bRect.left + "px";

  T.adcl(mouseShield, "drag_mouseshield");
  document.body.appendChild(mouseShield);

  elem.mouseShield = mouseShield;
};

T.clone = function(parent, elem) {
  if (!elem) throw new Error("Element to clone is null");
  var clone = elem.cloneNode(true);
  var nodes = elem.childNodes;
  T.rmcl(clone, "template");

  if (parent) parent.appendChild(clone);
  return clone;
};

T.gcls = function(node, classname) {
  if (node.getElementsByClassName) {
    // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass, node) {
      if (node == null) node = document;
      var classElements = [],
        els = node.getElementsByTagName("*"),
        elsLen = els.length,
        pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)"),
        i,
        j;

      for (i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
          classElements[j] = els[i];
          j++;
        }
      }
      return classElements;
    })(classname, node);
  }
};

T.gcl = function(node, classname) {
  return T.gcls(node, classname)[0];
};

T.gui = function(element, value) {
  return T.gat(element, "data-ui", value);
};

T.gat = function(element, attribute, value) {
  return T.gats(element, attribute, value)[0];
};

T.gats = function(element, attribute, value) {
  if (!element) return null;
  var tags = element.getElementsByTagName("*");
  var gats = [];
  for (var i = 0; i < tags.length; i++) {
    if (
      tags[i].getAttribute(attribute) == value ||
      (value == "*" && tags[i].getAttribute(attribute))
    ) {
      gats.push(tags[i]);
    }
  }
  return gats;
};

T.gid = function(id) {
  return document.getElementById(id);
};

T.adcl = function(element, classname) {
  var curClassnames = element.className.split(" ");
  if (curClassnames.indexOf(classname) > -1) return;
  curClassnames.push(classname);
  curClassnames = T.uniq_arr(curClassnames);
  element.className = curClassnames.join(" ");
};

T.rplcl = function(element, oldclassname, newclassname) {
  T.rmcl(element, oldclassname);
  T.adcl(element, newclassname);
};

T.rmcl = function(element, classname) {
  if (!element.className) return;
  var curClassnames = element.className.split(" ");
  var ind = curClassnames.indexOf(classname);
  if (ind > -1) {
    curClassnames.splice(ind, 1);
  }
  curClassnames = T.uniq_arr(curClassnames);
  element.className = curClassnames.join(" ");
};

T.dlg = function(object, method) {
  var shim = function() {
    return method.apply(object, arguments);
  };
  return shim;
};

T.rnd = function(min, max) {
  return Math.floor(Math.random() * (1 + max - min)) + min;
};

T.ajx = function(url, data, callback) {
  var oReq = new XMLHttpRequest();

  oReq.addEventListener(
    "progress",
    function(evt) {
      D.log(evt, D.LVL_INFO);
    },
    false
  );

  oReq.addEventListener(
    "load",
    function(evt) {
      D.log(evt, D.LVL_INFO);
      var response = evt.currentTarget.responseText;
      var json;
      if (response) {
        try {
          json = JSON.parse(response);
        } catch (e) {
          D.log(
            "Error with JSON response: " + response + ", complete error:" + e,
            D.LVL_ERROR
          );
          D.log(e, D.LVL_ERROR);
        }
      }
      callback(json);
    },
    false
  );
  oReq.addEventListener(
    "error",
    function(evt) {
      D.log(evt, T.dbg_levels.LVL_INFO);
    },
    false
  );
  oReq.addEventListener(
    "abort",
    function(evt) {
      D.log(evt, T.dbg_levels.LVL_INFO);
    },
    false
  );
  oReq.open("POST", url, true);
  oReq.setRequestHeader("Cache-Control", "no-cache");
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send(JSON.stringify(data));
};

T.timeString = function(seconds) {
  var d = new Date(seconds * 1000);
  var hoursLeft = Math.floor(seconds / 3600);
  var minutesLeft = d.getMinutes().toString();
  var secondsLeft = d.getSeconds().toString();

  if (minutesLeft.length == 1) minutesLeft = "0" + minutesLeft;
  if (secondsLeft.length == 1) secondsLeft = "0" + secondsLeft;

  return hoursLeft + ":" + minutesLeft + ":" + secondsLeft;
};
//deep cloning of object
T.cloneObject = function(object) {
  if (object == null) return null;
  var clone = {};
  for (var i in object) {
    clone[i] = object[i];
    if (typeof object[i] === "object") {
      clone[i] = T.cloneObject(object[i]);
    }
  }
  return clone;
};
