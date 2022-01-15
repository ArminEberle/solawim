<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wp' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', 'sepp01' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'spORTnyfvd38Hyapps6XK2Jl9e9pu8UqWaUoxDrBhFzOkI1AdS1Nbf6329FV5DuF');
define('SECURE_AUTH_KEY',  'OBO1ZAayJCbR05yRORV7rGyiiCHATYvUulF7GeI97j5CUDa5S4wwMuXafEAjkJlj');
define('LOGGED_IN_KEY',    'Y8ro2bJLNK2QZ26aKxWLjwiCGL68mcsKy263t4zsgEaYX0E3EknOJXf5aPy6Ef7R');
define('NONCE_KEY',        'eEpJOyHqwdm1CWoiO0MdS0cFLl3V6RAB9akzkN5kGgbA70VW3LrvrGdJLZm2wSSz');
define('AUTH_SALT',        'rxQgnka75ZNp3nQFWR6HF0f9QYmU4VjAxXlCiZ140qZhi6MKZctzN0omsnHpRVQw');
define('SECURE_AUTH_SALT', 'yvxH6DtWjslv1yrYJMqXHqj3BxToAVZVAEviPMdvKv9M3hPxwIPc2vdkXrfPDqVf');
define('LOGGED_IN_SALT',   'Y6BOEAe8PuqzDtr9pxnOBJlLkaJBdjvbeaTg2xCPT79UVZpmfHYMzXhx5N65vQ1x');
define('NONCE_SALT',       '49VulDgrdQN9lOSMjIykhqCJW6YUQW3GYLyLF6xnO0AeJ2ORqysQXOpJ0omccy2D');

/**
 * Other customizations.
 */
define('FS_METHOD','direct');
define('FS_CHMOD_DIR',0755);
define('FS_CHMOD_FILE',0644);
define('WP_TEMP_DIR',dirname(__FILE__).'/wp-content/uploads');

/**
 * Turn off automatic updates since these are managed externally by Installatron.
 * If you remove this define() to re-enable WordPress's automatic background updating
 * then it's advised to disable auto-updating in Installatron.
 */



/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'sdwj_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

define( "WP_AUTO_UPDATE_CORE", true );