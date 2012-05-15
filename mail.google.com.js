// ------------------------------------------------------------------------- //
// Gmail Address Swapper: swaps the 'To' and 'Cc' fields in Gmail
// Author: Nate Hardison, May 2012                                           //
// Credit to http://swaroop.in/tag/gmail-address-swapper for initial code    //
// ------------------------------------------------------------------------- //

// ------------------------------- CONSTANTS ------------------------------- //
// The ID of the iframe that holds all of the visible Gmail content.
var CANVAS_ID = 'canvas_frame';

// Check this often to figure out if we're in the Compose view
var CHECK_VIEW_INTERVAL = 500;
// ------------------------------------------------------------------------- //

function Swapper() {
  /**
   * The initialize function needs to get us a valid reference to the linkArea,
   * a td element where we're going to stuff our swapLink. The best way to get
   * to the proper linkArea is to find the Cc field and go one tr up from it.
   * Once we've found the linkArea, we can display the swapLink. The trick here
   * is that we cannot initialize until the tr containing the Cc textarea is
   * visible, since Gmail dynamically inserts an extra tr between the To tr and
   * the Cc tr when revealing the Cc tr.
   */
  this.initialize = function() {
    var ccTextArea = $('cc');
    if (ccTextArea.length > 0) {
      var ccTableRow = ccTextArea[0].parentNode.parentNode;
      if (ccTableRow.style.display !== "none") {
        var table = ccTableRow.parentNode;
        for (var i = 0; i < table.childNodes.length; i++) {
          if (table.childNodes[i] === ccTableRow) {
            linkArea = table.childNodes[i - 1].childNodes[1];
            break;
          }
        }

        // Yikes. What a craptastic jQuery-like thing.
        swapLink = $().createElement("span");

        // These attributes make it look and behave just like the other links
        swapLink.setAttribute("class", "el");
        swapLink.setAttribute("role", "link");
        swapLink.setAttribute("tabindex", "2");

        swapLink.innerHTML = "Swap To/Cc";
        swapLink.addEventListener('click', swap.bind(this), true);

        // Now we style the link area a bit to get the padding right
        linkArea.setAttribute("class", "eF");
        linkArea.style.paddingBottom = "3px";
        linkArea.appendChild(swapLink);
      }
    }
  };

  /**
   * Best way to tell if we're initialized is to check if we have a valid
   * reference to the linkArea and an initialized swapLink.
   */
  this.initialized = function() {
    return (linkArea && swapLink);
  };

  /** 
   * Intended to be used when we find ourselves outside of the Compose view
   * after being initialized.
   */
  this.reset = function() {
    linkArea = null;
    swapLink.removeEventListener('click', swap.bind(this), true);
    swapLink = null;
  };

// ------ PRIVATE --------------

  var linkArea = null;
  var swapLink = null;

  /**
   * Yes, I know this is bastardizing jQuery...shoot me.
   */
  var $ = function(str) {
    var canvasDocument = document.getElementById(CANVAS_ID).contentDocument;
    if (str) {
      if (str.indexOf('#') === 0) {
        return canvasDocument.getElementById(str.slice(1));
      } else if (str.indexOf('.') === 0) {
        return canvasDocument.getElementsByClassName(str.slice(1));
      }
      return canvasDocument.getElementsByName(str);      
    }
    return canvasDocument;
  };

  var swap = function() {
    var to = $('to')[0];
    var cc = $('cc')[0];
    var temp = to.value;
    to.value = cc.value;
    cc.value = temp;
  };
}

/**
 * We know we're in the compose view if we can get a valid reference to a
 * textarea with name="to". It's a hell of a hack, but I can't think of a
 * better way for now.
 */
function inComposeView() {
  var canvas = document.getElementById(CANVAS_ID);
  try {
    var to = canvas.contentDocument.getElementsByName('to')[0];
    return (to.tagName.toLowerCase() === "textarea");
  } catch (error) {
    return false;
  }
}

/**
 * This main loop sets up our Swapper and runs throughout the time that we're
 * on Gmail. If there's a better way to hook into Gmail's Javascript and figure
 * out when we move from the Compose view to the Inbox view (and others), it'd
 * be great to know...
 */
if (!window.top || top.location.href == window.location.href) {
  var swapper = new Swapper();
  setInterval(function() {
    var canvas = document.getElementById(CANVAS_ID);    
    if (canvas != null && canvas.contentDocument != null &&
        canvas.contentDocument.readyState === "complete") {
      if (inComposeView() && !swapper.initialized()) {
        swapper.initialize();
      } else if (swapper.initialized() && !inComposeView()) {
        swapper.reset();
      }
    }
  }, CHECK_VIEW_INTERVAL);
}