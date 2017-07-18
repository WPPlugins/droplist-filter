/**
 * @version 23 August 2008
 * @author Joshua Chan
 * @link http://joshuachan.ca/home/droplist-filter
 * @filesource
 */

/**
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


window.droplistFilterCount = 0;

/**
 * Wrapper function to easily add a new droplist filter.
 * If the browser does not have Javascript enabled, then nothing special will
 * happen, but the droplist will still work normally, without the filter.
 *
 * @var string listID
 *  The HTML ID of the droplist we are adding the filter to.
 * @var integer maxFilters 
 *  (Optional) The maxium number of filters to add at a time. Default is 20.
 * @var boolean override
 *  (Optional) You can ignore the maxFilters limit by overriding with this.
 */
function addDroplistFilter( listID, maxFilters, override )
{

    // Default value
    if (maxFilters <= 0) {
        maxFilters = 20;
    }

    // Initialize for first filter
    if (!window.droplistFilters) {
        // We need a global array for storing variables to prevent
        // them from going out of scope.
        window.droplistFilters = new Array();
        var internetExplorer = "pain" + "suffering";
        if (!internetExplorer) {
            // Preload images
            if (document.images) {
                var imgDir = '';
                // Look up the image directory from the stylesheet.
                // There is no simple way to do this in Javascript.
                for (var i=0; i<document.styleSheets.length; i++) {
                    if (document.styleSheets[i].href.match('DroplistFilter.css')) {
                        var dsStyleSheet = document.styleSheets[i];
                        // Get the name of the directory holding the CSS file.
                        var cssPath = dsStyleSheet.href.replace(/\\/g,'/').replace(/\/[^\/]*\/?$/, '');
                        var rules = dsStyleSheet.cssRules || dsStyleSheet.rules;
                        // Search for the dsFilterButton class. We know it has a background image.
                        for (var j=0; j<rules.length; j++) {
                            if (rules[j].selectorText = ".dsFilterButton") {
                                // Use regex to extract the image directory.
                                var regex = /url\(['"]?(.*)search.gif["']?\)/;
                                var bgImage = regex.exec(rules[j].style.backgroundImage);
                                if (bgImage) {
                                    //var bgImageDir = bgImage[1].replace(/\\/g,'/').replace(/\/[^\/]*\/?$/, '');
                                    var bgImageDir = bgImage[1];
                                    // Combine image dir with CSS dir if needed.
                                    if (bgImageDir.charAt(0) == '/' || bgImageDir.indexOf('://') != -1) {
                                        imgDir = bgImageDir;
                                    } else if (bgImageDir) {
                                        imgDir = cssPath + '/' + bgImageDir;
                                    } else {
                                        imgDir = cssPath;
                                    }
                                    // Add trailing slash if needed.
                                    if (imgDir.charAt(imgDir.length-1) != '/') {
                                        imgDir = imgDir + '/';
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
                var pic1 = new Image();
                pic1.src = imgDir + "search.gif";
                var pic2 = new Image();
                pic2.src = imgDir + "searching.gif";
                var pic3 = new Image();
                pic3.src = imgDir + "left.gif";
                var pic4 = new Image();
                pic4.src = imgDir + "right.gif";
                var pic5 = new Image();
                pic5.src = imgDir + "background.gif";
                window.droplistFilters.push( pic1 );
                window.droplistFilters.push( pic2 );
                window.droplistFilters.push( pic3 );
                window.droplistFilters.push( pic4 );
                window.droplistFilters.push( pic5 );
            }
        }
    }

    // The droplistFilter widget can massively slow down page rendering
    // when used excessively. So we will stop at 20.
    if (override!=true && window.droplistFilterCount > maxFilters) {

        // Every time a new droplistFilter is requested, we will cancel 
        // the previous one. So only the first 20, and the very last 
        // droplistFilter will be displayed.
        if (window.droplistTimeout) {
            clearTimeout( window.droplistTimeout );
            window.droplistTimeout = 0;
        }
        
        // Wait 5 seconds before adding the droplistFilter. 
        // This will get cancelled if another droplistFilter is
        // added before then.
        window.droplistTimeout = setTimeout( "addDroplistFilter('" +listID+ "', " +maxFilters+ ", true)", 5000 );
        
        
    } else {
        // This is how we add the first 20 widgets normally.
        window.droplistFilters[ listID ] = new droplistFilter( listID );
        window.droplistTimeout = 0;
        window.droplistFilterCount += 1;
    }
    
}



/**
 * Work around IE suckage
 */
function addListOption( droplist, option )
{
    try {
        // Most browsers know how to do this
        droplist.add( option, null );
    } catch (e) {
        // but not IE
        droplist[droplist.length] = option;
    }
}



/**
 * Droplist Filter class.
 *
 * @var string listID
 *  The HTML ID of the droplist we are adding the filter to.
 *
 * @version 23 August 2008
 * @author Joshua Chan
 */
function droplistFilter( listID )
{
    
    /////////////////////////////////////
    //// Constructor
    
    this.listID = listID;
    this.activateID = listID + "__dfActivate";
    this.containerID = listID + "__dfContainer";
    this.resetID = listID + "__dfReset";
    this.okID = listID + "__dfOK";
    this.textID = listID + "__dfText";
    
    // Need another way of referring to "this" object in an event handling fn.
    var thisDF = this;
    
    var listControl = document.getElementById(listID);
    
    // We will delay fully initializing the list until the widget is activated
    // to avoid slowing down the page loading time. Very important when there
    // are multiple droplist filters on the same page.
    this.listInitialized = false;

    // Do some simple browser detection
    if (!droplistFilter.prototype.userAgent) {
        var userAgent = navigator.userAgent;
        if (userAgent.match('Safari')) {
            droplistFilter.prototype.userAgent = 'Safari';
        } else if (userAgent.match('MSIE')) {
            droplistFilter.prototype.userAgent = 'MSIE';
        } else if (userAgent.match('Firefox/3')) {
            droplistFilter.prototype.userAgent = 'Firefox3';
        } else if (userAgent.match('Gecko')) {
            droplistFilter.prototype.userAgent = 'Gecko';
        } else {
            droplistFilter.prototype.userAgent = 'Other';
        }
    }


    /////////////////////////////////////
    //// Create the HTML elements

    var elNobr = document.createElement('nobr');
    elNobr.style.whiteSpace = "nowrap";
    
    // Safari supports "inline-block", which get positioned as an inline element
    // but can have a height and width like a block element.
    // See the filterPopup() method.
    //
    // Internet Explorer kind of supports "inline-block". But it doesn't work
    // right and we don't have a work-around for it yet.
    //
    // We need two container DIVs to approximate "inline-block" in Firefox2. 
    // The outer DIV will use the display style "-moz-inline-box", and the
    // inner DIV will be a normal display style "block".
    
    // Activation button
    var elActivate = document.createElement('div');
    elActivate.id = this.activateID;
    elActivate.className = "dsFilterButton";
    if (this.userAgent == 'Safari') {
        elActivate.style.display = 'inline-block';
	} else if (this.userAgent == 'MSIE') {
        //elActivate.style.display = 'inline-block';
        elActivate.style.display = 'inline';
	} else if (this.userAgent == 'Firefox3') {
        elActivate.style.display = 'inline-block';
	} else if (this.userAgent == 'Gecko') {
        // The real button needs to be a block. Otherwise
        // Firefox will have trouble detecting mouseclicks.
        elActivate.style.display = 'block';
        // Create a new div to contain the real button.
        // We need this to get the inline-block effect
        // in Firefox.
        var elActivateContainer = document.createElement('div');
        elActivateContainer.style.display = '-moz-inline-box';
        elActivateContainer.style.margin = '0';
        elActivateContainer.style.padding = '0';
        // Firefox 2 shifts the box down 13 pixels for no reason
        // so we compensate here.
        elActivateContainer.style.position = 'relative';
        elActivateContainer.style.top = "-13px";
        // Put the real button inside the container and
        // swap the variable names.
        elActivateContainer.appendChild(elActivate);
        elActivate = elActivateContainer;
	} else {
        elActivate.style.display = 'block';
	}
    
    // Searchbox Outer Container DIV
    var elContainer = document.createElement('div');
    elContainer.className = "dsOuterBox";
    elContainer.id = this.containerID;
    elContainer.style.display = "none";
    elContainer.style.width = "188px";
    
    // Searchbox Inner Container DIV
    var elInnerContainer = document.createElement('div');
    elInnerContainer.className = "dsInnerBox";
    elInnerContainer.style.width = "188px";
    elInnerContainer.style.display = "block";
    
    elContainer.appendChild( elInnerContainer );
    
    
    // Textbox
    var elTextbox = document.createElement('input');
    elTextbox.id = this.textID;
    elTextbox.name = "";

    if (this.userAgent == 'Safari') {
    
        // Safari can use the proprietary OSX search box
        elTextbox.className = "dsFilterTextboxSafari";
        elTextbox.type = "search";
        
        elInnerContainer.appendChild( elTextbox );
        
    } else {
    
        // We can mimic OSX in other browsers
        //elTextbox.className = "dsFilterTextbox";

        if (this.userAgent == 'MSIE') {
            // Can't set the "type" property in IE.
            elTextbox.className = "dsFilterTextboxIE";
        } else if (this.userAgent == 'Firefox3') {
            elTextbox.type = "textbox";
            elTextbox.className = "dsFilterTextboxFF3";
        } else {
            elTextbox.type = "textbox";
            elTextbox.className = "dsFilterTextboxFF";
        }

        // DIV to hold the textbox
        var elTextDiv = document.createElement('div');
        elTextDiv.className = "dsFilterTextdiv";
        elTextDiv.appendChild( elTextbox );

        // Left side of the textbox
        var elTextLeft = document.createElement('div');
        elTextLeft.className = "dsFilterTextLeft";

        // Right side of the text box
        var elTextRight = document.createElement('div');
        elTextRight.className = "dsFilterTextRight";
        
        elInnerContainer.appendChild( elTextLeft );
        elInnerContainer.appendChild( elTextDiv );
        elInnerContainer.appendChild( elTextRight );
        
    }
    
    // Search button
    var elOK = document.createElement('div');
    elOK.id = this.okID;
    elOK.className = "dsFilterButton2 dsFilterOK";
    
    // Reset button
    var elReset = document.createElement('div');
    elReset.id = this.resetID;
    elReset.className = "dsFilterButton2 dsFilterReset";
    
    elInnerContainer.appendChild( elOK );
    elInnerContainer.appendChild( elReset );
    
    elNobr.appendChild( elActivate );
    
    var listParent = listControl.parentNode;
    if (listControl.nextSibling) {
        var sibling = listControl.nextSibling;
        
        listParent.removeChild( listControl );
        elNobr.insertBefore( listControl, elActivate );
        listParent.insertBefore( elContainer, sibling );
        listParent.insertBefore( elNobr, elContainer ); 
        
    } else {
        
        listParent.removeChild( listControl );
        elNobr.insertBefore( listControl, elActivate );
        listParent.appendChild( elNobr );
        listParent.appendChild( elContainer );
    
    }

    // Need to attach event handler methods here, in order to access the thisDF
    // object in the proper scope.

    /////////////////////////////////////
    // Attach event handlers to the HTML elements we created earlier
    document.getElementById(this.activateID).onmousedown = function(e) {
        
        // Initialize the list if it's not been done  yet.
        // Attach the other handlers only when the widget is first activated.
        if (!thisDF.listInitialized) {

            thisDF.saveListItems();
            thisDF.listInitialized = true;
 
            document.getElementById(thisDF.okID).onclick = function(e) {
                return droplistFilter.prototype.event_ok(e, thisDF);
            }
            document.getElementById(thisDF.resetID).onclick = function(e) {
                return droplistFilter.prototype.event_reset(e, thisDF);
            }
            document.getElementById(thisDF.textID).onkeypress = function(e) {
                return droplistFilter.prototype.event_keypress(e, thisDF);
            }
            
        }

        // Only after initializing, then we activate the real
        // handler for this event.
        return droplistFilter.prototype.event_activate(e, thisDF);
    }

}


    /////////////////////////////////////
    //// Class methods

    /**
     * Add a new option to the saved list.
     * @param Option option
     */
    droplistFilter.prototype.saveListOption =
    function( option )
    {
        if (option.value != '-') {
            this.oldOptions.push( option );
        } else {
            this.listDash = true;
        }
    }
    
    
    
    /**
     * Save original droplist items and properties.
     */
    droplistFilter.prototype.saveListItems =
    function()
    {
        var listControl = document.getElementById(this.listID);
        var length = listControl.options.length;
        
        // Save original droplist width
        // (but somehow IE7 doesn't have the width correct here)
        this.listWidth = listControl.offsetWidth;

        // Create a pseudo unique key for each list.
        this.listKey = '';
        this.listKey = this.listKey + length + '__';
        if (length > 0) {
            this.listKey = this.listKey + listControl.options[length-1].text;
            if (length > 1) {
                var i=1;
            } else {
                var i=0;
            }
            this.listKey = this.listKey + '__' + listControl.options[i].value;
        }
        
        // Initialize the droplist cache if needed.
        if (!window.droplistCache) {
            window.droplistCache = new Object();
            window.droplistDash = new Object();
        }
        
        // See if the same list items have already been saved before.
        if (window.droplistCache[this.listKey]) {
            // We are saving a reference to the saved list items.
            // Much cheaper than re-creating a new list.
            this.oldOptions = window.droplistCache[this.listKey];
            this.listDash = window.droplistDash[this.listKey];
        }
        
        // If not, save them now.
        else {
            this.oldOptions = new Array();
            for (var i=0; i<listControl.options.length; i++) {
                var thisOption = listControl.options[i];
                var savedOption = new Object();
                savedOption.text = thisOption.text;
                savedOption.value = thisOption.value;
                savedOption.title = thisOption.title;
				savedOption.style = thisOption.style;
                this.saveListOption(savedOption);
            }
            window.droplistCache[this.listKey] = this.oldOptions;
            window.droplistDash[this.listKey] = this.listDash;
        }
        
        // Save original selection index
        this.oldSelection = listControl.selectedIndex;
        // If there wasn't a dash in the original list, we need to make room
        // for one.
        if (!this.listDash) {
            this.oldSelection += 1;
        }
 
    }



    /**
     * Filters the droplist so that items that do not
     * match the filterString are removed. 
     * 
     * @var string filterString
     */
    droplistFilter.prototype.filterListOptions = 
    function(filterString)
    {
        var listControl = document.getElementById(this.listID);
        
        // Replace the list control with an empty duplicate
        // We have secretly replaced free will with the illusion of free will
        var newListControl = listControl.cloneNode(false);
        var listParent = listControl.parentNode;
        
        // Copy the event handler of the old list to the new one
        if (listControl.onchange) {
            newListControl.onchange = listControl.onchange;
        }
        if (listControl.onclick) {
            newListControl.onlcick = listControl.onclick;
        }
        
        //// Fill in the new list with matching items
        if (filterString.toLowerCase) {
            filterString = filterString.toLowerCase();
        }
        // Add a '-' option on top that says what the search filter is
        var optionString;
        // Test to see if the filterString is a real string
        if (filterString.toLowerCase && filterString != '') {
            optionString = '-- '+filterString+' --';
        } else {
            optionString = '-';
        }
        var blankOption = new Option( optionString, '-' );
        addListOption( newListControl, blankOption );
    
        for (i=0; i<this.oldOptions.length; i++) {
            if (filterString == -1 || 
                this.oldOptions[i].text.toLowerCase().match( filterString ))
            {
                // Clone each option from the storage array
                var clonedOption = new Option( 
                    this.oldOptions[i].text, this.oldOptions[i].value
                );
				// Preserve all CSS style attributes
				for (var attr in this.oldOptions[i].style) {
					if (this.oldOptions[i].style[attr]) {
						try {
							clonedOption.style[attr] = 
								this.oldOptions[i].style[attr];
						} catch(e) { }
					}
				}
    
                // Then add it to the new droplist
                addListOption( newListControl, clonedOption );
            }
        }
        
        if (filterString == -1) {
            // When resetting the list, reselect the original item
            newListControl.selectedIndex = this.oldSelection;
        } else {
            // Select the blank option
            newListControl.selectedIndex = 0;
        }
        
        if (listParent.replaceChild) {
            listParent.replaceChild( newListControl, listControl );
            // Make sure the filtered lists are the same width as the original
            if (newListControl.offsetWidth < this.listWidth) {
                newListControl.style.width = '' + this.listWidth + 'px';
            }
        } else {
            alert( "Please use Firefox" );
        }
        
    }



    /**
     * Event handler function for the main activation button.
     * @var event e
     */
    droplistFilter.prototype.event_activate = 
    function(e, thisDF) {

        var popupBox = document.getElementById(thisDF.containerID);

        // Toggle the visibility of the searchbox
        if (popupBox.style.display == "none") {
            // Show
            thisDF.filterPopup();
        } else {
            // Hide
            thisDF.filterPopup(true);
        }
    };
    
    
    
    /**
     * Event handling function for the Reset button.
     * @var event e
     * @var droplistFilter classObject
     *      Optional. It is used to get around the problem where "this" refers
     *      to the event object, and not the class object.
     */
    droplistFilter.prototype.event_reset =
    function(e, classObject) {
    
        if (classObject && classObject.listID) {
            thisDF = classObject;
        }

        // Reset the filter
        thisDF.filterListOptions( -1 );
        // Clear the filter textbox
        document.getElementById(thisDF.textID).value = '';

        // Hide the popup box again
        thisDF.filterPopup(true);

        // Stop the button from doing anything else
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropogation) e.stopPropogation();
        
        return false;
    }



    /**
     * Event handling function for textbox keypresses.
     * @var event e
     */
    droplistFilter.prototype.event_keypress =
    function(e, thisDF) {

        var keynum = 0;
      
        if (!e) var e = window.event;
        if (e.keyCode) keynum = e.keyCode;
        else if(e.which) keynum = e.which;
        
        // Check for 'Enter' key
        if (keynum == 13 || keynum == 10 || keynum == 3) {
        
            // Enter is the same as clicking the OK button
            thisDF.event_ok(e, thisDF);

            // Stop the keypress from doing anything else
            e.cancelBubble = true;
            if (e.stopPropogation) e.stopPropogation();

            return false;

         // Check for the 'Escape' key
        } else if (keynum == 27) {

            // ESC is the same as clicking the reset button
            thisDF.event_reset(e, thisDF);
            
            // Stop the keypress from doing anything else
            e.cancelBubble = true;
            if (e.stopPropogation) e.stopPropogation();
            return false;

        } else {
            // Let the browser handle all other keys
            return true;
        }
        
    };
    
    

    /**
     * Event handling function for the OK button.
     * @var event e
     * @var droplistFilter classObject
     *      Optional. It is used to get around the problem where "this" refers
     *      to the event object, and not the class object.
     */
    droplistFilter.prototype.event_ok =
    function(e, classObject) {
    
        if (classObject && classObject.listID) {
            thisDF = classObject;
        }

        var filterTextbox = document.getElementById(thisDF.textID);
    
        // Apply the filter
        thisDF.filterListOptions(filterTextbox.value);

        // Hide the popup box again
        thisDF.filterPopup(true);

        // Stop the button from doing anything else
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropogation) e.stopPropogation();
        
        return false;

    }



    /**
     * Show or hide the droplist filter popup.
     *
     * @var boolean hide
     */
    droplistFilter.prototype.filterPopup = 
    function(hide)
    {
        var droplist = document.getElementById( this.listID );
        var mainButton = document.getElementById( this.activateID );
        var popupBox = document.getElementById( this.containerID );
        
        // Hide the ugly focus box        
        mainButton.blur();

        // Make sure the filtered lists are the same width as the original
        if (droplist.offsetWidth < this.listWidth) {
            droplist.style.width = '' + this.listWidth + 'px';
        }
        
        // Toggle the popup box visibility
        if (hide) {
		
		    // Hide the search box
            popupBox.style.display = "none";
			// Show the droplist and activation button
            droplist.style.display = "inline";
            if (this.userAgent == 'Safari') {
                mainButton.style.display = "inline-block";
            } else if (this.userAgent == 'MSIE') {
                //mainButton.style.display = "inline-block";
                mainButton.style.display = "inline";
            } else if (this.userAgent == 'Firefox3') {
                mainButton.style.display = "inline-block";
            } else if (this.userAgent == 'Gecko') {
                mainButton.style.display = "block";
            } else {
				mainButton.style.display = "block";
            }
        
		} else {
            // Get the width of the droplist + the activation button
            var listWidth;
            if (this.listWidth <= 0) {
                this.listWidth = droplist.offsetWidth;
            }
            
            listWidth = this.listWidth + 27;

            // Hide the droplist and activation button
            droplist.style.display = "none";
            mainButton.style.display = "none";
            // Show the search box
            if (this.userAgent == 'Safari') {
                popupBox.style.display = "inline-block";
            } else if (this.userAgent == 'MSIE') {
                //popupBox.style.display = "inline";
                //popupBox.style.display = "block";
                popupBox.style.display = "inline-block";
            } else if (this.userAgent == 'Firefox3') {
                popupBox.style.display = "inline-block";
            } else if (this.userAgent == 'Gecko') {
                popupBox.style.display = "-moz-inline-box";
            } else {
                popupBox.style.display = "block";
            }
            
            // Make our search box at least as wide as the droplist
            if (listWidth > popupBox.offsetWidth) {
                popupBox.style.width = '' + listWidth + 'px';
                popupBox.childNodes[0].style.width = '' + listWidth + 'px';
            }
            
            // Some browsers require a delay before they can set focus
            setTimeout(
                "var optText = document.getElementById( '"+this.textID+"' ); " +
                "optText.select(); " +
                "optText.focus(); "
            , 10);
        }
        
    }
