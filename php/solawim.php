<?php
/**
* Plugin Name: solawim
* Plugin URI: https://github.com/ArminEberle/solawim
* Description: Wordpress Plugin for managing a Solawi
* Version: 1.0-versionqualifier
* Author: Armin Groll
* Author URI: https://github.com/ArminEberle/solawim
**/

function solawim_membership($atts)
{
    wp_enqueue_style('solawim_member_css', plugin_dir_url(__FILE__) . 'solawim_member/solawim_member.css');
    wp_enqueue_script('solawim_member', plugin_dir_url(__FILE__) . 'solawim_member/solawim_member.js');
    return '<div id="solawim_membership"></div>';
}

function solawim_manage($atts)
{
    wp_enqueue_style('solawim_manage_css', plugin_dir_url(__FILE__) . 'solawim_manage/solawim_manage.css');
    wp_enqueue_script('solawim_manage', plugin_dir_url(__FILE__) . 'solawim_manage/solawim_manage.js');
    return '<div id="solawim_manage"></div>';
}

add_shortcode('solawim_membership', 'solawim_membership');
add_shortcode('solawim_manage', 'solawim_manage');

function solawim_register_cron_schedules($schedules)
{
    if (!isset($schedules['every_minute'])) {
        $schedules['every_minute'] = array(
            'interval' => 60,
            'display' => 'Jede Minute',
        );
    }
    return $schedules;
}

add_filter('cron_schedules', 'solawim_register_cron_schedules');

function solawim_disable_wp_emojis()
{
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    add_filter('tiny_mce_plugins', 'solawim_disable_wp_emojis_from_tinymce');
    add_filter('wp_resource_hints', 'solawim_disable_wp_emojis_dns_prefetch', 10, 2);
}

add_action('init', 'solawim_disable_wp_emojis');

function solawim_disable_wp_emojis_from_tinymce($plugins)
{
    if (is_array($plugins)) {
        return array_diff($plugins, array('wpemoji'));
    }

    return array();
}

function solawim_disable_wp_emojis_dns_prefetch($urls, $relation_type)
{
    if ('dns-prefetch' === $relation_type) {
        $emoji_svg_url = apply_filters('emoji_svg_url', 'https://s.w.org/images/core/emoji/2/svg/');
        $urls = array_diff($urls, array($emoji_svg_url));
    }

    return $urls;
}
