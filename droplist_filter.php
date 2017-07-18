<?php
/*
Plugin Name: Droplist Filter
Plugin URI: http://joshuachan.ca/home/droplist-filter
Description: This adds a search widget to any droplist on the website.
Version: 1.0
Author: Joshua Chan
Author URI: http://joshuachan.ca
*/

/**
 * This adds a search widget to any droplist. The module is mainly a
 * front-end to the included Javascript class, but it also provides
 * additional automation.
 */

/**
 *    Copyright 2008 Joshua Chan (josh@joshuachan.ca)
 *
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


// Set up default option values
add_option('droplist_filter_max_filters', 20);
add_option('droplist_filter_min_size', 1);
add_option('droplist_filter_restrict_class', '');
add_option('droplist_filter_ui', 'blue');
add_option('droplist_filter_create_id', true);


function droplist_filter_add_pages() {
    add_options_page('Droplist Filter Options', 'Droplist Filter', 8, 'droplist_filter', 'droplist_filter_options');
}



/**
 * This function sets up the settings page.
 */
function droplist_filter_options() {

  $options = array(
    'droplist_filter_max_filters',
    'droplist_filter_min_size',
    'droplist_filter_ui',
    'droplist_filter_create_id',
    'droplist_filter_restrict_class',
  );

  echo '<div class="wrap">';
  echo '<h2>Droplist Filter Settings</h2>';

  // Determine the paths
  $path = 'wp-content/plugins/droplist_filter';
  $count = 5;
  while (!file_exists($path.'/droplist_filter.php')) {
    if (--$count <= 0) {
      echo '<h3>Error</h3>';
      echo '<p class="error">Could not find the Droplist Filter plugin directory</p>';
      return;
    }
    $path = '../'.$path;
  }
  // Find all the "UI_..." subdirectories
  $ui_values = glob($path.'/droplistFilter/UI_*');
  $ui_options = array();
  foreach ($ui_values as $value) {
    $matches = array();
    preg_match('/.+UI_(.+)/', $value, $matches); // only use the simplified name
    $ui_options[$matches[1]] = $matches[1];
  }
  // Default UI
  $ui = get_option('droplist_filter_ui');


  // Start of form
  echo '<form method="post" action="options.php">';
  
  wp_nonce_field('update-options');
  echo '<input type="hidden" name="action" value="update" />';
  echo '<input type="hidden" name="page_options" value="';
  echo implode(',', $options);
  echo '" />';
  
  echo '<table class="form-table">';
  echo '<tr>';
  echo '<th>User Interface</th>';
  echo '<td>';
  echo '<select name="droplist_filter_ui">';
  foreach ($ui_options as $option) {
    echo '<option value="'.$option.'"';
    if ($option == $ui) {
        echo ' selected';
    }
    echo '>'.$option.'</option>';
  }
  echo '</select>';
  echo '</td>';
  echo '</tr>';

  echo '<tr>';
  echo '<th>Maximum droplist filters per page</th>';
  echo '<td>';
  echo '<input name="droplist_filter_max_filters" type="textbox" value="'.get_option('droplist_filter_max_filters').'" />';
  echo '<br />';
  echo 'On older computers, adding an excessive amount of Javascript widgets can slow down page rendering a lot. Use this setting to limit the number of widgets on a single page.';
  echo '</td>';
  echo '</tr>';
  
  echo '<tr>';
  echo '<th>Minimum items in each list</th>';
  echo '<td>';
  echo '<input name="droplist_filter_min_size" type="textbox" value="'.get_option('droplist_filter_min_size').'" />';
  echo '<br />';
  echo 'Lists with only a few items usually will not benefit from having a search widget. You can use this setting to add the widget only for lists with at least this number of items.';
  echo '</td>';
  echo '</tr>';

  echo '<tr>';
  echo '<th>Only add widgets to lists with this CSS <b>class</b></th>';
  echo '<td>';
  echo '<input name="droplist_filter_restrict_class" type="textbox" value="'.get_option('droplist_filter_restrict_class').'" />';
  echo '<br />';
  echo 'Leave this blank to add widgets to any class.';
  echo '</td>';
  echo '</tr>';

  echo '<tr>';
  echo '<th>Add CSS <b>id</b> to droplists if needed</th>';
  echo '<td>';
  echo '<input name="droplist_filter_create_id" type="checkbox" value="1"';
  if (get_option('droplist_filter_create_id')) {
    echo ' checked';
  }
  echo '" />';
  echo '<br />';
  echo 'Droplist Filter requires each droplist to have an ID. Some droplists should have this already. But if you are using a list with no ID, the system can create the ID for you at run-time.';
  echo '</td>';
  echo '</tr>';
  echo '</table>';

  echo '<p class="submit"><input name="Submit" type="submit" value="'.('Save Changes').'" /></p>';

  echo '</form>';
  echo '</div>';
}



/**
 * Include files in the page header.
 */
function droplist_filter_head() {

  // Determine the paths
  $ui = get_option('droplist_filter_ui');
  $modPath = wp_guess_url().'/wp-content/plugins/droplist_filter';
  $cssPath = $modPath.'/droplistFilter/UI_'.$ui;
  
  // Add the header tags
  $output = array('');
  $output[] = '<link rel="stylesheet" type="text/css" media="screen" href="'.$cssPath.'/DroplistFilter.css" />';
  $output[] = '<script type="text/javascript" src="'.$modPath.'/droplistFilter/DroplistFilter.js"></script>';
  $output[] = '';
  
  echo implode("\n", $output);
}



/**
 * Include dynamic Javascript code in the page footer.
 */
function droplist_filter_footer() {
  
  $max = get_option('droplist_filter_max_filters');
  $minSize = (int)get_option('droplist_filter_min_size');
  $class = get_option('droplist_filter_restrict_class', '');
  $createID = get_option('droplist_filter_create_id');

  // Generate dynamic Javascript code based on site settings
  $code = array('');
  $code[] = "<script type='text/javascript'>";
  {
    // Iterate through all HTML droplists on the page
    $code[] = "var allLists = document.getElementsByTagName('select');";
    $code[] = "var tmpList;";
    $code[] = "for (var i=0; i<allLists.length; i++) {";
    $code[] = "  tmpList = allLists[i];";
    if (!empty($class)) {
        // We can add the widget to only droplists belonging to a certain class
        $code[] = "  if (tmpList.className != '$class') {";
        $code[] = "    continue;";
        $code[] = "  }";
    }
    if ($minSize > 0) {
        // Skip droplists that are smaller than the min size
        $code[] = "  if (tmpList.options.length < $minSize) {";
        $code[] = "     continue;";
        $code[] = "  }";
    }
    if ($createID) {
        // We can assign new IDs to droplists that do not have them.
        $code[] = "  if (!tmpList.id) {";
        $code[] = "    tmpList.id = 'df_droplist_' + i;";
        $code[] = "  }";
    }
    $code[] = "  if (tmpList.id) {";
    $code[] = "    addDroplistFilter(tmpList.id, $max);";
    $code[] = "  }";
    $code[] = "}"; // end for
    $code[] = "</script>";
    $code[] = "";
  }
  
  // Add the generated code to the page footer
  $code = implode("\n", $code);
  echo $code;
}


add_action( 'wp_head', 'droplist_filter_head' );
add_action( 'wp_footer', 'droplist_filter_footer' );
add_action( 'admin_head', 'droplist_filter_head' );
add_action( 'admin_footer', 'droplist_filter_footer' );
add_action( 'admin_menu', 'droplist_filter_add_pages' );
