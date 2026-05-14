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
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][nextRoomId]" type="number" min="1" max="3" value="<?php echo esc_attr((string) $room['navPanel']['nextRoomId']); ?>" />
                            </td>
                        </tr>
                    </table>

                    <h3>Panels</h3>
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>Panel</th>
                                <th>Page Slug</th>
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
    }

    public function get_rooms_payload(): WP_REST_Response {
        $saved = get_option(self::OPTION_KEY, []);
        $rooms = $this->merge_with_defaults($saved);

        foreach ($rooms as &$room) {
            foreach ($room['panels'] as &$panel) {
                $panel_data = $this->get_panel_page_data($panel['slug']);

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

    private function get_panel_page_data(string $slug): array {
        $slug = trim($slug);
        if ($slug === '') {
            return [];
        }

        $post = get_page_by_path($slug, OBJECT, ['page', 'post']);
        if (!$post instanceof WP_Post || $post->post_status !== 'publish') {
            return [];
        }

        $content_html = apply_filters('the_content', $post->post_content);
        $ids = $this->extract_panel_ids($content_html);

        $title = $ids['title'] !== '' ? $ids['title'] : get_the_title($post);

        $links = $ids['links'];
        $links[] = [
            'label' => 'View page',
            'url' => get_permalink($post),
        ];

        return [
            'title' => $title,
            'caption' => $ids['caption'],
            'description' => $ids['description'],
            'heroImage' => $ids['heroImage'],
            'videoUrl' => $ids['videoUrl'],
            'links' => $links,
        ];
    }

    private function extract_panel_ids(string $content_html): array {
        $result = [
            'title' => '',
            'caption' => '',
            'description' => '',
            'heroImage' => '',
            'videoUrl' => '',
            'links' => [],
        ];

        if (trim($content_html) === '') {
            return $result;
        }

        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content_html);
        $xpath = new DOMXPath($dom);

        $result['title'] = $this->extract_text_by_id($xpath, 'p3d-title');
        $result['caption'] = $this->extract_text_by_id($xpath, 'p3d-caption');
        $result['description'] = $this->extract_text_by_id($xpath, 'p3d-description');

        $hero = $this->extract_attribute_by_id($xpath, 'p3d-hero', 'src');
        if ($hero === '') {
            $hero = $this->extract_attribute_by_id($xpath, 'p3d-image', 'src');
        }
        $result['heroImage'] = $hero;

        $result['videoUrl'] = $this->extract_attribute_by_id($xpath, 'p3d-video', 'src');

        $link_nodes = $xpath->query("//*[@id='p3d-link' or starts-with(@id, 'p3d-link-')]");
        if ($link_nodes instanceof DOMNodeList) {
            foreach ($link_nodes as $node) {
                if (!$node instanceof DOMElement) {
                    continue;
                }
                $href = trim($node->getAttribute('href'));
                if ($href === '') {
                    continue;
                }

                $label = trim(wp_strip_all_tags($node->textContent));
                if ($label === '') {
                    $label = 'External link';
                }

                $result['links'][] = [
                    'label' => $label,
                    'url' => esc_url_raw($href),
                ];
            }
        }

        libxml_clear_errors();

        return $result;
    }

    private function extract_text_by_id(DOMXPath $xpath, string $id): string {
        $nodes = $xpath->query("//*[@id='{$id}']");
        if (!$nodes instanceof DOMNodeList || $nodes->length === 0) {
            return '';
        }

        $text = trim(wp_strip_all_tags($nodes->item(0)->textContent));
        return $text;
    }

    private function extract_attribute_by_id(DOMXPath $xpath, string $id, string $attribute): string {
        $nodes = $xpath->query("//*[@id='{$id}']");
        if (!$nodes instanceof DOMNodeList || $nodes->length === 0) {
            return '';
        }

        $node = $nodes->item(0);
        if (!$node instanceof DOMElement) {
            return '';
        }

        return esc_url_raw(trim($node->getAttribute($attribute)));
    }

    private function sanitize_rooms_config(array $posted_rooms): array {
        $defaults = $this->get_default_rooms();
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
                $sanitized_room['navPanel']['nextRoomId'] = max(1, min(3, $next_room));
            }

            if (isset($room['panels']) && is_array($room['panels'])) {
                foreach ($default_room['panels'] as $panel_index => $default_panel) {
                    $panel = isset($room['panels'][$panel_index]) && is_array($room['panels'][$panel_index]) ? $room['panels'][$panel_index] : [];
                    $sanitized_room['panels'][$panel_index]['slug'] = isset($panel['slug'])
                        ? sanitize_title((string) $panel['slug'])
                        : '';
                }
            }

            $sanitized[] = $sanitized_room;
        }

        return $sanitized;
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
