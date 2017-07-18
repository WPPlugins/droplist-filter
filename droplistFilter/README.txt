droplistFilter
http://joshuachan.ca/home/droplist-filter/

Copyright 2008 Joshua Chan
This Javascript class is distributed under the terms of the GNU General Public
License.


USAGE
-----

First link to the class files in the header. (See USER INTERFACE below for 
further options.) Assuming the Droplist Filter package is in the same directory
as your site HTML file, you would do something like this--
  
    <head>
    <link type="text/css" rel="stylesheet" href="UI_blue/DroplistFilter.css" />
    <script type="text/javascript" src="DroplistFilter.js"></script>
    </head>

Then add the list normally in the body. For example--
  
    <select id="EXAMPLE">
    <option value="-" >-</option>
    <option value="name">What is your name?</option>
    <option value="quest">What is your quest?</option>
    <option value="color">What is your favorite color?</option>
    <option value="swallow" selected>What is the airspeed velocity of an
    unladen swallow?</option>
    </select>

Finally, at any point after that, add the following Javascript code--
  
    <script type="text/javascript">
    addDroplistFilter("EXAMPLE");
    </script>


USER INTERFACE
--------------

Four color schemes are provided. Their stylesheet and image files are found in
the following subdirectories:
 - UI_blue
 - UI_gray
 - UI_green
 - UI_red
You must include only one of them for the Droplist Filter to work correctly.
Of course, you can also create your own images to customize the UI to match
your site's theme.


LEGAL
-----

Any graphics images included with this package are for example purposes only
and are copyright their respective owners.

    This class is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

