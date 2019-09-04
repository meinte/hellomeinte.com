/**
 * ...
 * @author Meinte van't Kruis
 */

const T = {};
T.gcls = (node, classname) => node.getElementsByClassName(classname);
T.gcl = (node, classname) => T.gcls(node, classname)[0];
T.gui = (element, value) => T.gat(element, "data-ui", value);
T.gat = (element, attribute, value) => T.gats(element, attribute, value)[0];
T.gats = (element, attribute, value) => {
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
T.gid = id => document.getElementById(id);
