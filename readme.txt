=== Droplist Filter ===
Contributors: jchan
Tags: javascript, search, widget
Requires at least: 2.0.2
Stable tag: 1.0.2

This adds Javascript search widgets to any droplists on the website. 


== Description ==

This adds Javascript search widgets to any droplists on the website. It allows users to search the contents of the list, and filter out items that do not match. Useful for longs or unsorted lists.

This has been tested on the following browsers: Safari, Firefox 2, Firefox 3, and IE6. There were problems with the appearance of the search textbox on certain browsers in the older version. That should be fixed now.

See http://joshuachan.ca/home/droplist-filter for demonstration.


== Installation ==

1. Upload `droplist_filter` directory to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Go to Settings -> Droplist Filter to configure it to your preferences


== Frequently Asked Questions ==

= How do I add a custom user interface? =

Duplicate the `droplist_filter/droplistFilter/UI_blue` directory, and give it a
new name. It must begin with `UI_`. Then edit the DroplistFilter.css file, and
replace the graphics files with your own creations.

You will be able to select the new UI from the Settings -> Droplist Filter page.


== Screenshots ==

1. Click on the search widget to swap the droplist with a search box.
2. Very useful for long or unsorted lists.
3. Long lists can be filtered down to a handful of matching items.
4. Alternate colors and graphics can be used instead. (Four are provided.)


== Arbitrary section ==

Copyright 2008 Joshua Chan

This plugin acts as a wrapper for the Droplist Filter Javascript class,
which is included with this package in the "droplistFilter" subdirectory. It
is possible to use that independently from Wordpress. See the documentation in 
the subdirectory for more information.

Any graphics images included with this package are for example purposes only
and are copyright their respective owners.
