<?php

if (!defined('ABSPATH')) {
    exit;
}

class Portfolio_3D_Home_Plugin {
    private const OPTION_KEY = 'portfolio_3d_home_rooms_config';
    private const SHORTCODE = 'portfolio_3d_home';
    private const REST_NAMESPACE = 'portfolio-3d-home/v1';

    private string $plugin_file;

    public function __construct(string $plugin_file) {
        $this->plugin_file = $plugin_file;
    }

    public function init(): void {
        add_shortcode(self::SHORTCODE, [$this, 'render_shortcode']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('admin_menu', [$this, 'register_admin_menu']);
    }

    public function register_admin_menu(): void {
        add_menu_page(
            'Portfolio 3D Rooms',
            '3D Rooms',
            'manage_options',
            'portfolio-3d-rooms',
            [$this, 'render_admin_page'],
            'dashicons-format-gallery',
            70
        );
    }

    public function render_admin_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }

        $saved = get_option(self::OPTION_KEY, []);

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['portfolio_3d_home_nonce'])) {
            check_admin_referer('portfolio_3d_home_save', 'portfolio_3d_home_nonce');
            $posted = isset($_POST['rooms']) && is_array($_POST['rooms']) ? wp_unslash($_POST['rooms']) : [];
            $saved = $this->sanitize_rooms_config($posted);
            update_option(self::OPTION_KEY, $saved, false);

            echo '<div class="notice notice-success is-dismissible"><p>Saved room panel mappings.</p></div>';
        }

        $rooms = $this->merge_with_defaults($saved);
        ?>
        <div class="wrap">
            <h1>Portfolio 3D Rooms</h1>
            <p>Set the page slug for each panel. Leave a slug blank to keep a panel empty.</p>
            <p><strong>Room model paths</strong> should be typed relative to <code>wp-content/uploads</code>, for example <code>/2026/05/WellsFlat.glb</code>. Full URLs also work.</p>
            <p><strong>Expected IDs in source pages:</strong> p3d-title, p3d-caption, p3d-description, p3d-hero, p3d-video, p3d-link, p3d-link-2, ...</p>

            <form method="post">
                <?php wp_nonce_field('portfolio_3d_home_save', 'portfolio_3d_home_nonce'); ?>

                <?php foreach ($rooms as $room_index => $room): ?>
                    <hr />
                    <h2><?php echo esc_html('Room ' . $room['id']); ?></h2>
                    <?php $room_count = count($rooms); ?>

                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row"><label for="room-<?php echo esc_attr((string) $room_index); ?>-glb">Model path or URL</label></th>
                            <td>
                                <input
                                    id="room-<?php echo esc_attr((string) $room_index); ?>-glb"
                                    name="rooms[<?php echo esc_attr((string) $room_index); ?>][glb]"
                                    type="text"
                                    class="regular-text"
                                    value="<?php echo esc_attr($room['glb']); ?>"
                                />
                                <p class="description">Example: <code>/2026/05/WellsFlat.glb</code></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Rail Range</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][railMin]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['railMin']); ?>" />
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][railMax]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['railMax']); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Scroll Speed</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][scrollSpeed]" type="number" step="0.0001" value="<?php echo esc_attr((string) $room['scrollSpeed']); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Eye Height</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][eyeHeight]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['eyeHeight']); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Nav Label</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][label]" type="text" class="regular-text" value="<?php echo esc_attr($room['navPanel']['label']); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Next Room ID</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][nextRoomId]" type="number" min="1" max="<?php echo esc_attr((string) $room_count); ?>" value="<?php echo esc_attr((string) $room['navPanel']['nextRoomId']); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Nav Position (X Y Z)</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][position][0]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['navPanel']['position'][0]); ?>" />
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][position][1]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['navPanel']['position'][1]); ?>" />
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][position][2]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['navPanel']['position'][2]); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Nav Rotation (X Y Z)</th>
                            <td>
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][rotation][0]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['navPanel']['rotation'][0]); ?>" />
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][rotation][1]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['navPanel']['rotation'][1]); ?>" />
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][rotation][2]" type="number" step="0.01" value="<?php echo esc_attr((string) $room['navPanel']['rotation'][2]); ?>" />
                            </td>
                        </tr>
                    </table>

                    <h3>Panels</h3>
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>Panel</th>
                                <th>Page Slug</th>
                                <th>Position (X Y Z)</th>
                                <th>Rotation (X Y Z)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($room['panels'] as $panel_index => $panel): ?>
                                <tr>
                                    <td><?php echo esc_html('Panel ' . ($panel_index + 1)); ?></td>
                                    <td>
                                        <input
                                            name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][slug]"
                                            type="text"
                                            class="regular-text"
                                            value="<?php echo esc_attr($panel['slug']); ?>"
                                            placeholder="example-page-slug"
                                        />
                                    </td>
                                    <td>
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][position][0]" type="number" step="0.01" value="<?php echo esc_attr((string) $panel['position'][0]); ?>" />
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][position][1]" type="number" step="0.01" value="<?php echo esc_attr((string) $panel['position'][1]); ?>" />
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][position][2]" type="number" step="0.01" value="<?php echo esc_attr((string) $panel['position'][2]); ?>" />
                                    </td>
                                    <td>
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][rotation][0]" type="number" step="0.01" value="<?php echo esc_attr((string) $panel['rotation'][0]); ?>" />
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][rotation][1]" type="number" step="0.01" value="<?php echo esc_attr((string) $panel['rotation'][1]); ?>" />
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][rotation][2]" type="number" step="0.01" value="<?php echo esc_attr((string) $panel['rotation'][2]); ?>" />
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endforeach; ?>

                <?php submit_button('Save Rooms'); ?>
            </form>
        </div>
        <?php
    }

    public function render_shortcode(): string {
        $this->enqueue_frontend_assets();

        return '<div id="portfolio-3d-home-root" style="width:100%;min-height:100vh"></div>';
    }

    public function register_rest_routes(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/rooms',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_rooms_payload'],
                'permission_callback' => '__return_true',
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/debug/panel',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_debug_panel'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'slug' => [
                        'required' => true,
                        'sanitize_callback' => 'sanitize_title',
                    ],
                ],
            ]
        );
    }

    public function get_rooms_payload(): WP_REST_Response {
        $saved = get_option(self::OPTION_KEY, []);
        $rooms = $this->merge_with_defaults($saved);

        foreach ($rooms as &$room) {
            foreach ($room['panels'] as &$panel) {
                $panel_data = $this->get_panel_page_data($panel['slug'], false);

                if (!empty($panel_data)) {
                    $panel['title'] = $panel_data['title'];
                    $panel['caption'] = $panel_data['caption'];
                    $panel['description'] = $panel_data['description'];
                    $panel['videoUrl'] = $panel_data['videoUrl'];
                    $panel['links'] = $panel_data['links'];
                    $panel['image'] = $panel_data['heroImage'] ?: $panel['image'];
                } else {
                    $panel['title'] = '';
                    $panel['caption'] = '';
                    $panel['description'] = '';
                    $panel['videoUrl'] = '';
                    $panel['links'] = [];
                }
            }
        }

        return new WP_REST_Response(['rooms' => $rooms], 200);
    }

    public function get_debug_panel(WP_REST_Request $request): WP_REST_Response {
        $slug = $request->get_param('slug');
        $data = $this->get_panel_page_data($slug, true);
        return new WP_REST_Response($data, 200);
    }

    private function enqueue_frontend_assets(): void {
        $manifest_path = plugin_dir_path($this->plugin_file) . 'assets/build/asset-manifest.json';

        $main_js = '';
        $main_css = '';

        if (file_exists($manifest_path)) {
            $manifest = json_decode((string) file_get_contents($manifest_path), true);
            if (is_array($manifest) && isset($manifest['files']) && is_array($manifest['files'])) {
                $main_js = $manifest['files']['main.js'] ?? '';
                $main_css = $manifest['files']['main.css'] ?? '';
            }
        }

        if ($main_js === '') {
            return;
        }

        $base_url = plugin_dir_url($this->plugin_file) . 'assets/build/';
        $base_path = plugin_dir_path($this->plugin_file) . 'assets/build/';

        if ($main_css !== '' && file_exists($base_path . ltrim($main_css, '/'))) {
            wp_enqueue_style(
                'portfolio-3d-home-style',
                $base_url . ltrim($main_css, '/'),
                [],
                (string) filemtime($base_path . ltrim($main_css, '/'))
            );
        }

        wp_enqueue_script(
            'portfolio-3d-home-script',
            $base_url . ltrim($main_js, '/'),
            [],
            file_exists($base_path . ltrim($main_js, '/')) ? (string) filemtime($base_path . ltrim($main_js, '/')) : '1.0.0',
            true
        );

        wp_localize_script(
            'portfolio-3d-home-script',
            'Portfolio3DHomeSettings',
            [
                'apiEndpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/rooms')),
                'uploadsBaseUrl' => esc_url_raw(trailingslashit(wp_upload_dir()['baseurl'] ?? '')),
            ]
        );
    }

    private function get_panel_page_data(string $slug, bool $debug = false): array {
        $slug = trim($slug);
        if ($slug === '') {
            if ($debug) error_log('[P3D] get_panel_page_data: empty slug, skipping.');
            return [];
        }

        if ($debug) error_log('[P3D] get_panel_page_data: looking up slug "' . $slug . '"');

        $post = get_page_by_path($slug, OBJECT, ['page', 'post']);
        if (!$post instanceof WP_Post || $post->post_status !== 'publish') {
            if ($debug) error_log('[P3D] get_panel_page_data: post not found or not published for slug "' . $slug . '"');
            return [];
        }

        if ($debug) error_log('[P3D] get_panel_page_data: post found, ID=' . $post->ID . ', title="' . $post->post_title . '"');

        $content_html = $this->render_post_content($post, $debug);
        $ids = $this->extract_panel_ids($content_html, $debug);

        $title = $ids['title'] !== '' ? $ids['title'] : get_the_title($post);

        if ($debug) error_log('[P3D] get_panel_page_data: using title="' . $title . '"');

        $links = $ids['links'];
        $links[] = [
            'label' => 'View page',
            'url' => get_permalink($post),
        ];

        $result = [
            'title' => $title,
            'caption' => $ids['caption'],
            'description' => $ids['description'],
            'heroImage' => $ids['heroImage'],
            'videoUrl' => $ids['videoUrl'],
            'links' => $links,
        ];

        if ($debug) {
            $result['_debug'] = [
                'post_id' => $post->ID,
                'slug_searched' => $slug,
                'content_length' => strlen($content_html),
                'elementor_active' => $this->is_elementor_post($post),
                'raw_ids' => $ids,
            ];
        }

        return $result;
    }

    private function render_post_content(WP_Post $post, bool $debug = false): string {
        if ($this->is_elementor_post($post)) {
            if ($debug) error_log('[P3D] render_post_content: Elementor page detected for post ID=' . $post->ID);

            if (class_exists('\Elementor\Plugin')) {
                $rendered = \Elementor\Plugin::instance()->frontend->get_builder_content_for_display($post->ID, true);

                if ($debug) {
                    $len = strlen($rendered);
                    error_log('[P3D] render_post_content: Elementor rendered content length=' . $len);
                    if ($len === 0) {
                        error_log('[P3D] render_post_content: WARNING Elementor returned empty content.');
                    }
                }

                if ($rendered !== '') {
                    return $rendered;
                }

                if ($debug) error_log('[P3D] render_post_content: Elementor returned empty, falling back to the_content filter.');
            } else {
                if ($debug) error_log('[P3D] render_post_content: Elementor class not available, falling back to the_content filter.');
            }
        } else {
            if ($debug) error_log('[P3D] render_post_content: Not an Elementor page, using the_content filter.');
        }

        $filtered = apply_filters('the_content', $post->post_content);

        if ($debug) error_log('[P3D] render_post_content: the_content filter returned length=' . strlen($filtered));

        return $filtered;
    }

    private function is_elementor_post(WP_Post $post): bool {
        $meta = get_post_meta($post->ID, '_elementor_edit_mode', true);
        return $meta === 'builder';
    }

    private function extract_panel_ids(string $content_html, bool $debug = false): array {
        $result = [
            'title' => '',
            'caption' => '',
            'description' => '',
            'heroImage' => '',
            'videoUrl' => '',
            'links' => [],
        ];

        if (trim($content_html) === '') {
            if ($debug) error_log('[P3D] extract_panel_ids: content_html is empty, nothing to parse.');
            return $result;
        }

        if ($debug) error_log('[P3D] extract_panel_ids: parsing HTML, length=' . strlen($content_html));

        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content_html);
        $xpath = new DOMXPath($dom);

        $result['title'] = $this->extract_text_by_id($xpath, 'p3d-title', $debug);
        $result['caption'] = $this->extract_text_by_id($xpath, 'p3d-caption', $debug);
        $result['description'] = $this->extract_text_by_id($xpath, 'p3d-description', $debug);

        $hero = $this->extract_hero_image($xpath, $debug);
        $result['heroImage'] = $hero;

        $result['videoUrl'] = $this->extract_video_url($xpath, $debug);

        $link_nodes = $xpath->query("//*[@id='p3d-link' or starts-with(@id, 'p3d-link-')]");
        if ($debug) error_log('[P3D] extract_panel_ids: p3d-link search returned ' . ($link_nodes instanceof DOMNodeList ? $link_nodes->length : 0) . ' node(s).');

        if ($link_nodes instanceof DOMNodeList) {
            foreach ($link_nodes as $node) {
                if (!$node instanceof DOMElement) {
                    continue;
                }
                $href = trim($node->getAttribute('href'));
                if ($href === '') {
                    if ($debug) error_log('[P3D] extract_panel_ids: p3d-link node has no href, skipping.');
                    continue;
                }

                $label = trim(wp_strip_all_tags($node->textContent));
                if ($label === '') {
                    $label = 'External link';
                }

                if ($debug) error_log('[P3D] extract_panel_ids: p3d-link found — label="' . $label . '", href="' . $href . '"');

                $result['links'][] = [
                    'label' => $label,
                    'url' => esc_url_raw($href),
                ];
            }
        }

        libxml_clear_errors();

        if ($debug) {
            error_log('[P3D] extract_panel_ids: final result — title="' . $result['title'] . '", caption="' . $result['caption'] . '", description length=' . strlen($result['description']) . ', heroImage="' . $result['heroImage'] . '", videoUrl="' . $result['videoUrl'] . '", links=' . count($result['links']));
        }

        return $result;
    }

    private function extract_text_by_id(DOMXPath $xpath, string $id, bool $debug = false): string {
        $nodes = $xpath->query("//*[@id='{$id}']");
        if (!$nodes instanceof DOMNodeList || $nodes->length === 0) {
            if ($debug) error_log('[P3D] extract_text_by_id: id="' . $id . '" NOT FOUND in HTML.');
            return '';
        }

        $text = trim(wp_strip_all_tags($nodes->item(0)->textContent));
        if ($debug) error_log('[P3D] extract_text_by_id: id="' . $id . '" FOUND — value="' . mb_substr($text, 0, 120) . '"');
        return $text;
    }

    private function extract_hero_image(DOMXPath $xpath, bool $debug = false): string {
        foreach (['p3d-hero', 'p3d-image'] as $id) {
            $nodes = $xpath->query("//*[@id='{$id}']");
            if (!$nodes instanceof DOMNodeList || $nodes->length === 0) {
                if ($debug) error_log('[P3D] extract_hero_image: id="' . $id . '" NOT FOUND.');
                continue;
            }
            $node = $nodes->item(0);
            if (!$node instanceof DOMElement) {
                continue;
            }
            // Direct src attribute (img element)
            $src = trim($node->getAttribute('src'));
            if ($src !== '') {
                if ($debug) error_log('[P3D] extract_hero_image: id="' . $id . '" FOUND with src="' . $src . '"');
                return esc_url_raw($src);
            }
            // Nested img (e.g. wrapped in a div)
            $inner = $xpath->query(".//img", $node);
            if ($inner instanceof DOMNodeList && $inner->length > 0) {
                $img = $inner->item(0);
                if ($img instanceof DOMElement) {
                    $src = trim($img->getAttribute('src'));
                    if ($src !== '') {
                        if ($debug) error_log('[P3D] extract_hero_image: id="' . $id . '" FOUND via nested img, src="' . $src . '"');
                        return esc_url_raw($src);
                    }
                }
            }
            if ($debug) error_log('[P3D] extract_hero_image: id="' . $id . '" node found but no src located.');
        }
        return '';
    }

    private function extract_video_url(DOMXPath $xpath, bool $debug = false): string {
        $nodes = $xpath->query("//*[@id='p3d-video']");
        if (!$nodes instanceof DOMNodeList || $nodes->length === 0) {
            if ($debug) error_log('[P3D] extract_video_url: id="p3d-video" NOT FOUND in HTML.');
            return '';
        }

        $node = $nodes->item(0);
        if (!$node instanceof DOMElement) {
            return '';
        }

        // Direct src (if the element itself is an iframe)
        if (strtolower($node->nodeName) === 'iframe') {
            $src = trim($node->getAttribute('src'));
            if ($src !== '') {
                $clean = $this->clean_embed_url($src);
                if ($debug) error_log('[P3D] extract_video_url: p3d-video is iframe, src="' . $clean . '"');
                return $clean;
            }
        }

        // Nested iframe (Elementor video widget wraps iframe in divs)
        $iframes = $xpath->query(".//iframe", $node);
        if ($iframes instanceof DOMNodeList && $iframes->length > 0) {
            $iframe = $iframes->item(0);
            if ($iframe instanceof DOMElement) {
                $src = trim($iframe->getAttribute('src'));
                if ($src !== '') {
                    $clean = $this->clean_embed_url($src);
                    if ($debug) error_log('[P3D] extract_video_url: p3d-video nested iframe found, src="' . $clean . '"');
                    return $clean;
                }
            }
        }

        // Fallback: check data-settings for YouTube URL (Elementor stores URL there)
        $settings_raw = $node->getAttribute('data-settings');
        if ($settings_raw !== '') {
            $settings = json_decode(html_entity_decode($settings_raw), true);
            if (is_array($settings)) {
                $yt_url = $settings['youtube_url'] ?? '';
                if ($yt_url !== '') {
                    $embed = $this->youtube_url_to_embed($yt_url);
                    if ($embed !== '') {
                        if ($debug) error_log('[P3D] extract_video_url: p3d-video data-settings youtube_url resolved to embed="' . $embed . '"');
                        return $embed;
                    }
                }
            }
        }

        if ($debug) error_log('[P3D] extract_video_url: p3d-video found but no usable src/iframe/data-settings resolved.');
        return '';
    }

    private function clean_embed_url(string $src): string {
        // Strip query params added by Elementor/host that include internal origins
        $parts = parse_url($src);
        if (!is_array($parts)) return esc_url_raw($src);
        $base = ($parts['scheme'] ?? 'https') . '://' . ($parts['host'] ?? '') . ($parts['path'] ?? '');
        parse_str($parts['query'] ?? '', $params);
        // Keep only standard YouTube embed params
        $keep = ['controls', 'rel', 'autoplay', 'loop', 'playlist', 'start', 'end', 'mute'];
        $clean_params = array_intersect_key($params, array_flip($keep));
        $query = $clean_params ? '?' . http_build_query($clean_params) : '';
        return esc_url_raw($base . $query);
    }

    private function youtube_url_to_embed(string $url): string {
        // Handles youtu.be/ID and youtube.com/watch?v=ID
        if (preg_match('/youtu\.be\/([a-zA-Z0-9_\-]+)/i', $url, $m)) {
            return 'https://www.youtube.com/embed/' . $m[1];
        }
        if (preg_match('/[?&]v=([a-zA-Z0-9_\-]+)/i', $url, $m)) {
            return 'https://www.youtube.com/embed/' . $m[1];
        }
        if (strpos($url, 'youtube.com/embed/') !== false) {
            return esc_url_raw($url);
        }
        return '';
    }

    private function sanitize_rooms_config(array $posted_rooms): array {
        $defaults = $this->get_default_rooms();
        $room_count = count($defaults);
        $sanitized = [];

        foreach ($defaults as $room_index => $default_room) {
            $room = isset($posted_rooms[$room_index]) && is_array($posted_rooms[$room_index]) ? $posted_rooms[$room_index] : [];

            $sanitized_room = $default_room;
            $sanitized_room['glb'] = isset($room['glb']) ? sanitize_text_field((string) $room['glb']) : $default_room['glb'];
            $sanitized_room['railMin'] = isset($room['railMin']) ? (float) $room['railMin'] : (float) $default_room['railMin'];
            $sanitized_room['railMax'] = isset($room['railMax']) ? (float) $room['railMax'] : (float) $default_room['railMax'];
            $sanitized_room['scrollSpeed'] = isset($room['scrollSpeed']) ? (float) $room['scrollSpeed'] : (float) $default_room['scrollSpeed'];
            $sanitized_room['eyeHeight'] = isset($room['eyeHeight']) ? (float) $room['eyeHeight'] : (float) $default_room['eyeHeight'];

            if (isset($room['navPanel']) && is_array($room['navPanel'])) {
                $nav = $room['navPanel'];
                $next_room = isset($nav['nextRoomId']) ? (int) $nav['nextRoomId'] : (int) $default_room['navPanel']['nextRoomId'];
                $sanitized_room['navPanel']['label'] = isset($nav['label']) ? sanitize_text_field((string) $nav['label']) : $default_room['navPanel']['label'];
                $sanitized_room['navPanel']['nextRoomId'] = max(1, min($room_count, $next_room));
                $sanitized_room['navPanel']['position'] = $this->sanitize_vector3(
                    $nav['position'] ?? null,
                    $default_room['navPanel']['position']
                );
                $sanitized_room['navPanel']['rotation'] = $this->sanitize_vector3(
                    $nav['rotation'] ?? null,
                    $default_room['navPanel']['rotation']
                );
            }

            if (isset($room['panels']) && is_array($room['panels'])) {
                foreach ($default_room['panels'] as $panel_index => $default_panel) {
                    $panel = isset($room['panels'][$panel_index]) && is_array($room['panels'][$panel_index]) ? $room['panels'][$panel_index] : [];
                    $sanitized_room['panels'][$panel_index]['slug'] = isset($panel['slug'])
                        ? sanitize_title((string) $panel['slug'])
                        : '';
                    $sanitized_room['panels'][$panel_index]['position'] = $this->sanitize_vector3(
                        $panel['position'] ?? null,
                        $default_panel['position']
                    );
                    $sanitized_room['panels'][$panel_index]['rotation'] = $this->sanitize_vector3(
                        $panel['rotation'] ?? null,
                        $default_panel['rotation']
                    );
                }
            }

            $sanitized[] = $sanitized_room;
        }

        return $sanitized;
    }

    private function sanitize_vector3($value, array $fallback): array {
        if (!is_array($value) || count($value) < 3) {
            return [(float) $fallback[0], (float) $fallback[1], (float) $fallback[2]];
        }

        return [
            isset($value[0]) ? (float) $value[0] : (float) $fallback[0],
            isset($value[1]) ? (float) $value[1] : (float) $fallback[1],
            isset($value[2]) ? (float) $value[2] : (float) $fallback[2],
        ];
    }

    private function merge_with_defaults(array $saved): array {
        if (empty($saved)) {
            return $this->get_default_rooms();
        }

        return $this->sanitize_rooms_config($saved);
    }

    private function get_default_rooms(): array {
        return [
            [
                'id' => 1,
                'glb' => '/2026/05/TestRoom1.glb',
                'railMin' => -2,
                'railMax' => 1,
                'scrollSpeed' => 0.005,
                'eyeHeight' => 1.67,
                'panels' => [
                    $this->panel_template('room1-panel1', [-1.5, 1.5, 3.5], [0, M_PI, 0]),
                ],
                'navPanel' => [
                    'position' => [3.25, 1.5, 0],
                    'rotation' => [0, -M_PI / 2, 0],
                    'label' => 'Room 2 ->',
                    'nextRoomId' => 2,
                ],
            ],
            [
                'id' => 2,
                'glb' => '/2026/05/TestRoom2.glb',
                'railMin' => -2,
                'railMax' => 1,
                'scrollSpeed' => 0.005,
                'eyeHeight' => 1.67,
                'panels' => [
                    $this->panel_template('room2-panel1', [-1.5, 1.5, 3.5], [0, M_PI, 0]),
                ],
                'navPanel' => [
                    'position' => [3.25, 1.5, 0],
                    'rotation' => [0, -M_PI / 2, 0],
                    'label' => 'Room 3 ->',
                    'nextRoomId' => 3,
                ],
            ],
            [
                'id' => 3,
                'glb' => '/2026/05/TestRoom3.glb',
                'railMin' => -2,
                'railMax' => 1,
                'scrollSpeed' => 0.005,
                'eyeHeight' => 1.67,
                'panels' => [
                    $this->panel_template('room3-panel1', [-1.5, 1.5, 3.5], [0, M_PI, 0]),
                ],
                'navPanel' => [
                    'position' => [3.25, 1.5, 0],
                    'rotation' => [0, -M_PI / 2, 0],
                    'label' => 'Room 1 ->',
                    'nextRoomId' => 1,
                ],
            ],
        ];
    }

    private function panel_template(string $id, array $position, array $rotation): array {
        return [
            'id' => $id,
            'slug' => '',
            'position' => $position,
            'rotation' => $rotation,
            'image' => '',
            'title' => '',
            'caption' => '',
            'description' => '',
            'videoUrl' => '',
            'links' => [],
        ];
    }
}
