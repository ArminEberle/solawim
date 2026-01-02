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

// Remove emoji CDN hostname from DNS prefetching hints.
// This is to prevent code-clashin g with certain Content Security Policies.
function solawim_disable_wp_emojis_dns_prefetch($urls, $relation_type)
{
    if ('dns-prefetch' === $relation_type) {
        $emoji_svg_url = apply_filters('emoji_svg_url', 'https://s.w.org/images/core/emoji/2/svg/');
        $urls = array_diff($urls, array($emoji_svg_url));
    }

    return $urls;
}

// Add custom registration field for "How did you find us?"
add_action( 'register_form', 'custom_registration_fields' );
function custom_registration_fields() {
    ?>
    <p>
        <label for="how_found">Wie bist Du auf das Höhberg Kollektiv aufmerksam geworden?<br>
            <input type="text" name="how_found" id="how_found" class="input" value="<?php echo esc_attr( $_POST['how_found'] ?? '' ); ?>" size="25" required />
        </label>
    </p>
    <?php
}

add_action( 'user_register', 'save_custom_registration_fields', 10, 1 );
function save_custom_registration_fields( $user_id ) {
    if ( isset( $_POST['how_found'] ) ) {
        update_user_meta( $user_id, 'how_found', sanitize_text_field( $_POST['how_found'] ) );
    }
}

add_action( 'show_user_profile', 'display_custom_user_fields' );
add_action( 'edit_user_profile', 'display_custom_user_fields' );
function display_custom_user_fields( $user ) {
    $how_found = get_user_meta( $user->ID, 'how_found', true );
    ?>
    <h3>Zusätzliche Informationen</h3>
    <table class="form-table">
        <tr>
            <th><label>Wie bist Du auf das Höhberg Kollektiv aufmerksam geworden?</label></th>
            <td><input type="text" name="how_found" value="<?php echo esc_attr( $how_found ); ?>" class="regular-text" /></td>
        </tr>
    </table>
    <?php
}

// Speichern im Profil
add_action( 'personal_options_update', 'save_custom_user_fields_profile' );
add_action( 'edit_user_profile_update', 'save_custom_user_fields_profile' );
function save_custom_user_fields_profile( $user_id ) {
    if ( current_user_can( 'edit_user', $user_id ) && isset( $_POST['how_found'] ) ) {
        update_user_meta( $user_id, 'how_found', sanitize_text_field( $_POST['how_found'] ) );
    }
}
