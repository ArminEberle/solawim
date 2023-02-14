<?php
/**
* Plugin Name: solawim
* Plugin URI: https://www.yourwebsiteurl.com/
* Description: This is the very first plugin I ever created.
* Version: 1.0-versionqualifier
* Author: Armin Groll
* Author URI: http://yourwebsiteurl.com/
**/

function solawim_membership($atts)
{
    wp_enqueue_style('solawim_member_css', plugin_dir_url(__FILE__) . 'member/solawim_member.css');
    wp_enqueue_script('solawim_member', plugin_dir_url(__FILE__) . 'member/solawim_member.js');
    return '<div id="solawim_membership"></div>';
}

function solawim_manage($atts)
{
    wp_enqueue_style('solawim_manage_css', plugin_dir_url(__FILE__) . 'manage/solawim_manage.css');
    wp_enqueue_script('solawim_manage', plugin_dir_url(__FILE__) . 'manage/solawim_manage.js');
    return '<div id="solawim_manage"></div>';
}

add_shortcode('solawim_membership', 'solawim_membership');
add_shortcode('solawim_manage', 'solawim_manage');
