<?php
/**
* Plugin Name: solawim
* Plugin URI: https://www.yourwebsiteurl.com/
* Description: This is the very first plugin I ever created.
* Version: 1.0
* Author: Your Name Here
* Author URI: http://yourwebsiteurl.com/
**/

function solawim_membership($atts)
{
    wp_enqueue_script('solawim', plugin_dir_url(__FILE__) . 'mime/solawim.js');
    return '<div id="solawim_membership"></div>';
}
add_shortcode('solawim_membership', 'solawim_membership');
