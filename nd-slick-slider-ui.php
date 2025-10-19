<?php
/**
 * Plugin Name: ND Slick Slider UI
 * Description: Lightweight Init-Layer für Slick + optionale UI-Shortcodes. Lädt NUR lokale Vendor-Dateien (kein CDN).
 * Version: 1.1.8
 *
 * Author: netzwerk.design
 * Author URI: https://netzwerk.design
 * Text Domain: nd-slick-slider-ui
 * Domain Path: /languages
 * License: GPL-2.0-or-later
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'ND_SLICK_UI_VERSION', '1.1.8' );
define( 'ND_SLICK_UI_FILE', __FILE__ );
define( 'ND_SLICK_UI_DIR', plugin_dir_path( __FILE__ ) );
define( 'ND_SLICK_UI_URL', plugin_dir_url( __FILE__ ) );

/**
 * Load plugin textdomain for translations.
 */
function nd_slick_ui_load_textdomain() {
    load_plugin_textdomain( 'nd-slick-slider-ui', false, dirname( plugin_basename( ND_SLICK_UI_FILE ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'nd_slick_ui_load_textdomain' );

/**
 * Register only LOCAL assets (no CDN).
 */
function nd_slick_ui_register_assets() {
    // Use filemtime for cache-busting when files change
    $slick_css_version = file_exists( ND_SLICK_UI_DIR . 'assets/vendor/slick/slick.css' ) ? filemtime( ND_SLICK_UI_DIR . 'assets/vendor/slick/slick.css' ) : '1.8.1';
    $ui_css_version = file_exists( ND_SLICK_UI_DIR . 'assets/css/nd-slick-ui.css' ) ? filemtime( ND_SLICK_UI_DIR . 'assets/css/nd-slick-ui.css' ) : ND_SLICK_UI_VERSION;
    $slick_js_version = file_exists( ND_SLICK_UI_DIR . 'assets/vendor/slick/slick.min.js' ) ? filemtime( ND_SLICK_UI_DIR . 'assets/vendor/slick/slick.min.js' ) : '1.8.1';
    $init_js_version = file_exists( ND_SLICK_UI_DIR . 'assets/js/nd-slick-init.js' ) ? filemtime( ND_SLICK_UI_DIR . 'assets/js/nd-slick-init.js' ) : ND_SLICK_UI_VERSION;
    
    wp_register_style( 'slick-core', ND_SLICK_UI_URL . 'assets/vendor/slick/slick.css', array(), $slick_css_version );
    wp_register_style( 'nd-slick-ui', ND_SLICK_UI_URL . 'assets/css/nd-slick-ui.css', array('slick-core'), $ui_css_version );
    wp_register_script( 'slick', ND_SLICK_UI_URL . 'assets/vendor/slick/slick.min.js', array( 'jquery' ), $slick_js_version, true );
    wp_register_script( 'nd-slick-init', ND_SLICK_UI_URL . 'assets/js/nd-slick-init.js', array( 'jquery', 'slick' ), $init_js_version, true );
}
add_action( 'wp_enqueue_scripts', 'nd_slick_ui_register_assets', 5 );

/**
 * Enqueue when needed.
 */
function nd_slick_ui_enqueue_assets() {
    wp_enqueue_style( 'slick-core' );
    // Allow turning the UI CSS off via filter if needed:
    $enqueue_ui = apply_filters( 'nd_slick_ui_enqueue_ui_css', true );
    if ( $enqueue_ui ) {
        wp_enqueue_style( 'nd-slick-ui' );
    }
    wp_enqueue_script( 'slick' );
    wp_enqueue_script( 'nd-slick-init' );
}
add_action( 'nd_slick_slider_ui_enqueue', 'nd_slick_ui_enqueue_assets' );

/**
 * Heuristik: Assets auf Singular laden, wenn Block/Shortcode/Pattern gefunden.
 */
function nd_slick_ui_maybe_enqueue_by_content() {
    if ( is_admin() ) { return; }
    if ( is_singular() ) {
        global $post;
        if ( $post ) {
            $content = get_post_field( 'post_content', $post );
            $load = false;
            if ( function_exists( 'has_block' ) && has_block( 'nd/slick-assets', $post ) ) $load = true;
            if ( ! $load && ( has_shortcode( $content, 'nd_slick_ui' ) || has_shortcode( $content, 'nd_slick_assets' ) ) ) $load = true;
            if ( ! $load && is_string( $content ) ) {
                if ( ( strpos( $content, 'class=\"slick-ui' ) !== false || strpos( $content, "class='slick-ui" ) !== false ) &&
                     ( strpos( $content, 'data-for=\"' ) !== false || strpos( $content, "data-for='" ) !== false ) ) {
                    $load = true;
                }
            }
            $load = apply_filters( 'nd_slick_ui_detect_load', $load, $post );
            if ( $load ) do_action( 'nd_slick_slider_ui_enqueue' );
        }
    }
}
add_action( 'wp', 'nd_slick_ui_maybe_enqueue_by_content', 11 );

/**
 * Shortcode: Nur UI-Markup.
 */
function nd_slick_ui_render( $args ) {
    $for         = isset( $args['for'] ) ? sanitize_text_field( $args['for'] ) : '';
    $extra       = isset( $args['class'] ) ? sanitize_text_field( $args['class'] ) : '';
    $variant     = isset( $args['variant'] ) ? sanitize_text_field( $args['variant'] ) : '';
    $toggle      = ! empty( $args['show_toggle'] );
    $counter     = ! empty( $args['show_counter'] );
    $arrows      = ! empty( $args['show_arrows'] );
    if ( ! $for ) { return ''; }
    $classes = trim( 'slick-ui ' . ( $arrows ? 'has-arrows' : 'no-arrows' ) . ' ' . $variant . ' ' . $extra );
    ob_start(); ?>
<div class="<?php echo esc_attr( $classes ); ?>" data-for="<?php echo esc_attr( $for ); ?>" data-show-arrows="<?php echo $arrows ? '1' : '0'; ?>" role="region" aria-label="<?php esc_attr_e( 'Slider-Navigation', 'nd-slick-slider-ui' ); ?>">
    <div class="slick-controls-row">
        <?php if ( $arrows ) : ?><div class="slick-nav-arrows" role="group" aria-label="<?php esc_attr_e( 'Slider-Pfeile', 'nd-slick-slider-ui' ); ?>"></div><?php endif; ?>
        <div class="slick-nav-dots" role="group" aria-label="<?php esc_attr_e( 'Slider-Punkte', 'nd-slick-slider-ui' ); ?>"></div>
        <?php if ( $toggle ) : ?><button class="slider-autoplay-toggle" type="button" aria-label="<?php esc_attr_e( 'Autoplay ein-/ausschalten', 'nd-slick-slider-ui' ); ?>" aria-pressed="false"></button><?php endif; ?>
    </div>
    <?php if ( $counter ) : ?><div class="slick-nav-counter" aria-live="polite" aria-label="<?php esc_attr_e( 'Aktuelle Folie', 'nd-slick-slider-ui' ); ?>"></div><?php endif; ?>
</div>
<?php return ob_get_clean();
}

function nd_slick_ui_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'for'          => '',
        'class'        => '',
        'variant'      => '',
        'show_counter' => '1',
        'show_toggle'  => '1',
        'show_arrows'  => '1',
    ), $atts, 'nd_slick_ui' );

    $args = array(
        'for'          => $atts['for'],
        'class'        => $atts['class'],
        'variant'      => $atts['variant'],
        'show_counter' => $atts['show_counter'] !== '0',
        'show_toggle'  => $atts['show_toggle'] !== '0',
        'show_arrows'  => $atts['show_arrows'] !== '0',
    );

    add_action( 'wp_footer', 'nd_slick_ui_enqueue_assets' );
    return nd_slick_ui_render( $args );
}
add_shortcode( 'nd_slick_ui', 'nd_slick_ui_shortcode' );

function nd_slick_assets_shortcode() { do_action( 'nd_slick_slider_ui_enqueue' ); return ''; }
add_shortcode( 'nd_slick_assets', 'nd_slick_assets_shortcode' );

/**
 * Editor-Block: „Slick Assets“ lädt nur die Assets, ohne Markup auszugeben.
 */
function nd_register_slick_assets_block() {
    register_block_type( 'nd/slick-assets', array(
        'render_callback' => function() { do_action( 'nd_slick_slider_ui_enqueue' ); return ''; },
    ) );
    wp_register_script(
        'nd-slick-assets-editor',
        ND_SLICK_UI_URL . 'blocks/assets/index.js',
        array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'wp-components' ),
        ND_SLICK_UI_VERSION
    );
    if ( is_admin() ) wp_enqueue_script( 'nd-slick-assets-editor' );
}
add_action( 'init', 'nd_register_slick_assets_block' );
