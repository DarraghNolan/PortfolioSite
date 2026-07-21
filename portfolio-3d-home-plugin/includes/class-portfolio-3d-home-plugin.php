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
        $notices = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['portfolio_3d_home_nonce'])) {
            check_admin_referer('portfolio_3d_home_save', 'portfolio_3d_home_nonce');
            $posted = isset($_POST['rooms']) && is_array($_POST['rooms']) ? wp_unslash($_POST['rooms']) : [];
            $saved = $this->sanitize_rooms_config($posted);

            $remove_room_index = isset($_POST['portfolio_3d_home_remove_room'])
                ? (int) $_POST['portfolio_3d_home_remove_room']
                : -1;

            if ($remove_room_index >= 0 && isset($saved[$remove_room_index])) {
                if (count($saved) <= 1) {
                    $notices[] = ['type' => 'error', 'text' => 'At least one room is required. Remove was ignored.'];
                } else {
                    unset($saved[$remove_room_index]);
                    $saved = array_values($saved);
                    $notices[] = ['type' => 'success', 'text' => 'Room removed.'];
                }
            }

            if (isset($_POST['portfolio_3d_home_add_room'])) {
                $next_room_id = $this->get_next_room_id($saved);
                $saved[] = $this->create_room_template($next_room_id);
                $notices[] = ['type' => 'success', 'text' => 'New room added.'];
            }

            $add_panel_room_index = isset($_POST['portfolio_3d_home_add_panel_room'])
                ? (int) $_POST['portfolio_3d_home_add_panel_room']
                : -1;

            if ($add_panel_room_index >= 0 && isset($saved[$add_panel_room_index])) {
                $room_id = (int) ($saved[$add_panel_room_index]['id'] ?? ($add_panel_room_index + 1));
                $next_index = count($saved[$add_panel_room_index]['panels']) + 1;
                $seed_panel = $saved[$add_panel_room_index]['panels'][0] ?? [
                    'position' => [-1.5, 1.5, 3.5],
                    'rotation' => [0, M_PI, 0],
                    'scale' => [2, 1.5],
                ];

                $saved[$add_panel_room_index]['panels'][] = $this->panel_template(
                    $this->build_panel_id($room_id, $next_index),
                    $seed_panel['position'] ?? [-1.5, 1.5, 3.5],
                    $seed_panel['rotation'] ?? [0, M_PI, 0],
                    $seed_panel['scale'] ?? [2, 1.5]
                );
                $notices[] = ['type' => 'success', 'text' => 'New panel added.'];
            }

            $invalid_nav_count = 0;
            $saved = $this->sanitize_rooms_config_with_validation($saved, $this->get_default_rooms(), $invalid_nav_count);

            if ($invalid_nav_count > 0) {
                $notices[] = [
                    'type' => 'warning',
                    'text' => 'Some nav panel targets were invalid and have been disabled. Check Next Room ID values.'
                ];
            }

            update_option(self::OPTION_KEY, $saved, false);
            $notices[] = ['type' => 'success', 'text' => 'Saved room panel mappings.'];
        }

        $rooms = $this->merge_with_defaults($saved);
        $room_ids = $this->get_room_id_list($rooms);
        ?>
        <div class="wrap">
            <h1>Portfolio 3D Rooms</h1>
            <p>Set the page slug for each panel. Leave a slug blank to keep a panel empty.</p>
            <p><strong>Room model paths</strong> should be typed relative to <code>wp-content/uploads</code>, for example <code>/2026/05/WellsFlat.glb</code>. Full URLs also work.</p>
            <p><strong>Room texture paths</strong> should also be relative to <code>wp-content/uploads</code>, for example <code>/2026/05/WellsFlat.webp</code>.</p>
            <p><strong>Expected IDs in source pages:</strong> p3d-title, p3d-caption, p3d-description, p3d-hero, p3d-video, p3d-link, p3d-link-2, ...</p>

            <?php foreach ($notices as $notice): ?>
                <?php
                    $class = 'notice-warning';
                    if ($notice['type'] === 'success') {
                        $class = 'notice-success';
                    } elseif ($notice['type'] === 'error') {
                        $class = 'notice-error';
                    }
                ?>
                <div class="notice <?php echo esc_attr($class); ?> is-dismissible">
                    <p><?php echo esc_html($notice['text']); ?></p>
                </div>
            <?php endforeach; ?>

            <form method="post">
                <?php wp_nonce_field('portfolio_3d_home_save', 'portfolio_3d_home_nonce'); ?>

                <p>
                    <button type="submit" class="button button-secondary" name="portfolio_3d_home_add_room" value="1">Add Room</button>
                </p>

                <?php foreach ($rooms as $room_index => $room): ?>
                    <hr />
                    <h2><?php echo esc_html('Room ' . $room['id']); ?></h2>

                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row">Room ID</th>
                            <td>
                                <input type="number" value="<?php echo esc_attr((string) $room['id']); ?>" readonly />
                                <p class="description">Use this ID in Next Room ID fields when linking rooms.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="room-<?php echo esc_attr((string) $room_index); ?>-glb">Model path or URL</label></th>
                            <td>
                                <input
                                    id="room-<?php echo esc_attr((string) $room_index); ?>-glb"
                                    name="rooms[<?php echo esc_attr((string) $room_index); ?>][id]"
                                    type="hidden"
                                    value="<?php echo esc_attr((string) $room['id']); ?>"
                                />
                                <input
                                    name="rooms[<?php echo esc_attr((string) $room_index); ?>][glb]"
                                    type="text"
                                    class="regular-text"
                                    value="<?php echo esc_attr($room['glb']); ?>"
                                />
                                <p class="description">Example: <code>/2026/05/WellsFlat.glb</code></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="room-<?php echo esc_attr((string) $room_index); ?>-texture">Room texture path or URL</label></th>
                            <td>
                                <input
                                    id="room-<?php echo esc_attr((string) $room_index); ?>-texture"
                                    name="rooms[<?php echo esc_attr((string) $room_index); ?>][texture]"
                                    type="text"
                                    class="regular-text"
                                    value="<?php echo esc_attr($room['texture'] ?? ''); ?>"
                                />
                                <p class="description">Example: <code>/2026/05/WellsFlat.webp</code></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Show Nav Panel</th>
                            <td>
                                <label>
                                    <input
                                        name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][enabled]"
                                        type="checkbox"
                                        value="1"
                                        <?php checked(!empty($room['navPanel']['enabled'])); ?>
                                    />
                                    Enable this room's navigation panel
                                </label>
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
                                <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][navPanel][nextRoomId]" type="number" min="1" value="<?php echo esc_attr((string) $room['navPanel']['nextRoomId']); ?>" />
                                <p class="description">Existing room IDs: <?php echo esc_html(implode(', ', array_map('strval', $room_ids))); ?></p>
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
                    </table>

                    <h3>Panels</h3>
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>Panel</th>
                                <th>Page Slug</th>
                                <th>Position (X Y Z)</th>
                                <th>Rotation (X Y Z)</th>
                                <th>Scale (X Y)</th>
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
                                    <td>
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][scale][0]" type="number" min="0.1" step="0.01" value="<?php echo esc_attr((string) $panel['scale'][0]); ?>" />
                                        <input name="rooms[<?php echo esc_attr((string) $room_index); ?>][panels][<?php echo esc_attr((string) $panel_index); ?>][scale][1]" type="number" min="0.1" step="0.01" value="<?php echo esc_attr((string) $panel['scale'][1]); ?>" />
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <p style="margin-top:10px;">
                        <button type="submit" class="button" name="portfolio_3d_home_add_panel_room" value="<?php echo esc_attr((string) $room_index); ?>">Add Panel</button>
                        <button type="submit" class="button button-link-delete" name="portfolio_3d_home_remove_room" value="<?php echo esc_attr((string) $room_index); ?>" onclick="return confirm('Remove this room?');">Remove Room</button>
                    </p>
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

    public function get_rooms_payload(WP_REST_Request $request): WP_REST_Response {
        $debug = $this->should_debug($request);
        $saved = get_option(self::OPTION_KEY, []);
        $rooms = $this->merge_with_defaults($saved);

        if ($debug) {
            error_log('[P3D] get_rooms_payload: start room_count=' . count($rooms));
        }

        foreach ($rooms as &$room) {
            if (empty($room['navPanel']['enabled'])) {
                $room['navPanel'] = null;
            }

            foreach ($room['panels'] as &$panel) {
                if ($debug) {
                    error_log('[P3D] get_rooms_payload: processing room_id=' . $room['id'] . ' panel_id=' . ($panel['id'] ?? 'unknown') . ' slug="' . ($panel['slug'] ?? '') . '"');
                }

                $panel_data = $this->get_panel_page_data($panel['slug'], $debug);
                $has_real_data = !empty($panel_data) && !isset($panel_data['_early_fail']);

                if ($has_real_data) {
                    $panel['title'] = $panel_data['title'] ?? '';
                    $panel['caption'] = $panel_data['caption'] ?? '';
                    $panel['description'] = $panel_data['description'] ?? '';
                    $panel['videoUrl'] = $panel_data['videoUrl'] ?? '';
                    $panel['links'] = $panel_data['links'] ?? [];
                    $panel['image'] = ($panel_data['heroImage'] ?? '') ?: $panel['image'];

                    if ($debug) {
                        $panel['_debug'] = $panel_data['_debug'] ?? ['status' => 'populated'];
                        error_log('[P3D] get_rooms_payload: panel populated title_len=' . strlen((string) $panel['title']) . ' caption_len=' . strlen((string) $panel['caption']) . ' desc_len=' . strlen((string) $panel['description']) . ' links=' . count((array) $panel['links']));
                    }
                } else {
                    $panel['title'] = '';
                    $panel['caption'] = '';
                    $panel['description'] = '';
                    $panel['videoUrl'] = '';
                    $panel['links'] = [];

                    if ($debug) {
                        // Carry through early-fail details if present
                        $panel['_debug'] = !empty($panel_data) ? $panel_data : ['status' => 'panel_data_empty'];
                        error_log('[P3D] get_rooms_payload: panel empty. reason=' . ($panel_data['_early_fail'] ?? 'unknown'));
                    }
                }
            }
        }

        if ($debug) {
            error_log('[P3D] get_rooms_payload: done');
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
                'debugEnabled' => defined('WP_DEBUG') && WP_DEBUG,
                'uploadsBaseUrl' => esc_url_raw(trailingslashit(wp_upload_dir()['baseurl'] ?? '')),
            ]
        );
    }

    private function get_panel_page_data(string $slug, bool $debug = false): array {
        $slug = trim($slug);
        if ($slug === '') {
            if ($debug) error_log('[P3D] get_panel_page_data: empty slug, skipping.');
            return $debug ? ['_early_fail' => 'empty_slug'] : [];
        }

        if ($debug) error_log('[P3D] get_panel_page_data: looking up slug "' . $slug . '"');

        // Also try WP_Query as a fallback for get_page_by_path which can miss posts
        $post = get_page_by_path($slug, OBJECT, ['page', 'post']);
        if (!$post instanceof WP_Post) {
            $q = new WP_Query([
                'name'           => $slug,
                'post_type'      => ['page', 'post'],
                'post_status'    => 'publish',
                'posts_per_page' => 1,
            ]);
            $post = $q->have_posts() ? $q->posts[0] : null;
        }

        if (!$post instanceof WP_Post) {
            if ($debug) error_log('[P3D] get_panel_page_data: post not found for slug "' . $slug . '"');
            // List all pages/posts for diagnosis
            if ($debug) {
                $all = get_posts(['post_type' => ['page', 'post'], 'post_status' => 'publish', 'posts_per_page' => 50, 'fields' => 'all']);
                $names = array_map(fn($p) => $p->post_name . '(' . $p->post_status . ')', $all);
                error_log('[P3D] Published pages/posts: ' . implode(', ', $names));
            }
            return $debug ? ['_early_fail' => 'post_not_found', '_slug_searched' => $slug] : [];
        }

        if ($post->post_status !== 'publish') {
            if ($debug) error_log('[P3D] get_panel_page_data: post found (ID=' . $post->ID . ') but status="' . $post->post_status . '" not published');
            return $debug ? ['_early_fail' => 'not_published', '_post_id' => $post->ID, '_post_status' => $post->post_status] : [];
        }

        if ($debug) error_log('[P3D] get_panel_page_data: post found, ID=' . $post->ID . ', title="' . $post->post_title . '"');

        $content_html = $this->render_post_content($post, $debug);
        $ids = $this->extract_panel_ids($content_html, $debug);

        if ($this->is_panel_data_empty($ids)) {
            if ($debug) {
                error_log('[P3D] get_panel_page_data: no ids found in initial content, trying public page HTML fallback.');
            }

            $public_html = $this->fetch_public_page_html($post, $debug);
            if ($public_html !== '') {
                $fallback_ids = $this->extract_panel_ids($public_html, $debug);
                if (!$this->is_panel_data_empty($fallback_ids)) {
                    $ids = $fallback_ids;
                    if ($debug) {
                        error_log('[P3D] get_panel_page_data: public page HTML fallback produced panel ids.');
                    }
                } elseif ($debug) {
                    error_log('[P3D] get_panel_page_data: public page HTML fallback still empty.');
                }
            }
        }

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
        if ($meta === 'builder' || $meta === 'default') {
            return true;
        }

        $elementor_data = get_post_meta($post->ID, '_elementor_data', true);
        if (!empty($elementor_data)) {
            return true;
        }

        if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::instance()->documents)) {
            $document = \Elementor\Plugin::instance()->documents->get($post->ID);
            if ($document && method_exists($document, 'is_built_with_elementor')) {
                return (bool) $document->is_built_with_elementor();
            }
        }

        return false;
    }

    private function is_panel_data_empty(array $ids): bool {
        return (
            trim((string) ($ids['title'] ?? '')) === ''
            && trim((string) ($ids['caption'] ?? '')) === ''
            && trim(wp_strip_all_tags((string) ($ids['description'] ?? ''))) === ''
            && trim((string) ($ids['heroImage'] ?? '')) === ''
            && trim((string) ($ids['videoUrl'] ?? '')) === ''
            && empty($ids['links'])
        );
    }

    private function fetch_public_page_html(WP_Post $post, bool $debug = false): string {
        $url = get_permalink($post);
        if (!is_string($url) || trim($url) === '') {
            if ($debug) {
                error_log('[P3D] fetch_public_page_html: permalink empty for post ID=' . $post->ID);
            }
            return '';
        }

        if ($debug) {
            error_log('[P3D] fetch_public_page_html: requesting ' . $url);
        }

        $response = wp_remote_get(
            $url,
            [
                'timeout' => 12,
                'redirection' => 3,
                'headers' => [
                    'Accept' => 'text/html',
                ],
            ]
        );

        if (is_wp_error($response)) {
            if ($debug) {
                error_log('[P3D] fetch_public_page_html: request error ' . $response->get_error_message());
            }
            return '';
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);

        if ($debug) {
            error_log('[P3D] fetch_public_page_html: response_code=' . $code . ' body_length=' . strlen($body));
        }

        if ($code < 200 || $code >= 300 || trim($body) === '') {
            return '';
        }

        return $body;
    }

    private function should_debug(?WP_REST_Request $request = null): bool {
        $query_debug = false;
        if ($request instanceof WP_REST_Request) {
            $value = (string) $request->get_param('debug');
            $query_debug = in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
        }

        return $query_debug || (defined('WP_DEBUG') && WP_DEBUG);
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
        $result['description'] = $this->extract_html_by_id($xpath, 'p3d-description', $debug);

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

    private function extract_html_by_id(DOMXPath $xpath, string $id, bool $debug = false): string {
        $nodes = $xpath->query("//*[@id='{$id}']");
        if (!$nodes instanceof DOMNodeList || $nodes->length === 0) {
            if ($debug) error_log('[P3D] extract_html_by_id: id="' . $id . '" NOT FOUND in HTML.');
            return '';
        }

        $node = $nodes->item(0);
        if (!$node instanceof DOMElement) {
            return '';
        }

        // Keep rich structure (paragraphs, headings, lists, etc.) from children of p3d-description.
        $inner_html = '';
        foreach ($node->childNodes as $child) {
            $inner_html .= $node->ownerDocument->saveHTML($child);
        }

        // If no child markup exists, fall back to text content.
        if (trim($inner_html) === '') {
            $inner_html = esc_html(trim($node->textContent));
        }

        $allowed_tags = wp_kses_allowed_html('post');
        $allowed_tags['iframe'] = [
            'src' => true,
            'title' => true,
            'width' => true,
            'height' => true,
            'allow' => true,
            'allowfullscreen' => true,
            'frameborder' => true,
            'loading' => true,
            'referrerpolicy' => true,
        ];

        $safe_html = wp_kses($inner_html, $allowed_tags);

        if ($debug) {
            error_log('[P3D] extract_html_by_id: id="' . $id . '" FOUND — html_length=' . strlen($safe_html) . ', text_length=' . strlen(trim(wp_strip_all_tags($safe_html))));
        }

        return trim($safe_html);
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
        $invalid_nav_count = 0;

        return $this->sanitize_rooms_config_with_validation($posted_rooms, $defaults, $invalid_nav_count);
    }

    private function sanitize_rooms_config_with_validation(array $posted_rooms, array $defaults, int &$invalid_nav_count): array {
        $default_map = [];
        foreach ($defaults as $default_room) {
            $default_id = (int) ($default_room['id'] ?? 0);
            if ($default_id > 0) {
                $default_map[$default_id] = $default_room;
            }
        }

        $room_rows = array_values(array_filter($posted_rooms, 'is_array'));
        if (empty($room_rows)) {
            $room_rows = $defaults;
        }

        $sanitized = [];
        $existing_ids = [];

        foreach ($room_rows as $row_index => $room) {
            $requested_id = isset($room['id']) ? (int) $room['id'] : 0;
            if ($requested_id <= 0 || in_array($requested_id, $existing_ids, true)) {
                $requested_id = $this->get_next_room_id($sanitized);
            }

            $existing_ids[] = $requested_id;

            $default_room = $default_map[$requested_id] ?? $this->create_room_template($requested_id);

            $sanitized_room = $default_room;
            $sanitized_room['id'] = $requested_id;
            $sanitized_room['glb'] = isset($room['glb']) ? sanitize_text_field((string) $room['glb']) : $default_room['glb'];
            $sanitized_room['texture'] = isset($room['texture']) ? sanitize_text_field((string) $room['texture']) : ($default_room['texture'] ?? '');
            $sanitized_room['railMin'] = isset($room['railMin']) ? (float) $room['railMin'] : (float) $default_room['railMin'];
            $sanitized_room['railMax'] = isset($room['railMax']) ? (float) $room['railMax'] : (float) $default_room['railMax'];
            $sanitized_room['scrollSpeed'] = isset($room['scrollSpeed']) ? (float) $room['scrollSpeed'] : (float) $default_room['scrollSpeed'];
            $sanitized_room['eyeHeight'] = isset($room['eyeHeight']) ? (float) $room['eyeHeight'] : (float) $default_room['eyeHeight'];

            $nav = isset($room['navPanel']) && is_array($room['navPanel']) ? $room['navPanel'] : [];
            $next_room = isset($nav['nextRoomId']) ? (int) $nav['nextRoomId'] : (int) $default_room['navPanel']['nextRoomId'];
            $sanitized_room['navPanel']['enabled'] = !empty($nav['enabled']);
            $sanitized_room['navPanel']['label'] = isset($nav['label']) ? sanitize_text_field((string) $nav['label']) : $default_room['navPanel']['label'];
            $sanitized_room['navPanel']['nextRoomId'] = max(1, $next_room);
            $sanitized_room['navPanel']['position'] = $this->sanitize_vector3(
                $nav['position'] ?? null,
                $default_room['navPanel']['position']
            );
            $sanitized_room['navPanel']['rotation'] = $this->sanitize_vector3(
                $nav['rotation'] ?? null,
                $default_room['navPanel']['rotation']
            );

            $posted_panels = isset($room['panels']) && is_array($room['panels'])
                ? array_values(array_filter($room['panels'], 'is_array'))
                : [];

            $panel_seed = $default_room['panels'][0] ?? $this->panel_template($this->build_panel_id($requested_id, 1), [-1.5, 1.5, 3.5], [0, M_PI, 0]);
            $panel_count = max(1, max(count($default_room['panels']), count($posted_panels)));
            $sanitized_room['panels'] = [];

            for ($panel_index = 0; $panel_index < $panel_count; $panel_index++) {
                $default_panel = $default_room['panels'][$panel_index] ?? $panel_seed;
                $panel = $posted_panels[$panel_index] ?? [];

                $sanitized_room['panels'][$panel_index] = $default_panel;
                $sanitized_room['panels'][$panel_index]['id'] = $this->build_panel_id($requested_id, $panel_index + 1);
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
                $sanitized_room['panels'][$panel_index]['scale'] = $this->sanitize_vector2(
                    $panel['scale'] ?? null,
                    $default_panel['scale'] ?? [2, 1.5]
                );
            }

            $sanitized[] = $sanitized_room;
        }

        $valid_ids = $this->get_room_id_list($sanitized);
        foreach ($sanitized as &$room) {
            $nav_enabled = !empty($room['navPanel']['enabled']);
            $target_id = (int) ($room['navPanel']['nextRoomId'] ?? 0);
            if ($nav_enabled && !in_array($target_id, $valid_ids, true)) {
                $room['navPanel']['enabled'] = false;
                $invalid_nav_count++;
            }
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

    private function sanitize_vector2($value, array $fallback): array {
        if (!is_array($value) || count($value) < 2) {
            return [max(0.1, (float) $fallback[0]), max(0.1, (float) $fallback[1])];
        }

        return [
            max(0.1, isset($value[0]) ? (float) $value[0] : (float) $fallback[0]),
            max(0.1, isset($value[1]) ? (float) $value[1] : (float) $fallback[1]),
        ];
    }

    private function merge_with_defaults(array $saved): array {
        if (empty($saved)) {
            return $this->get_default_rooms();
        }

        return $this->sanitize_rooms_config($saved);
    }

    private function get_room_id_list(array $rooms): array {
        $ids = [];
        foreach ($rooms as $room) {
            $room_id = (int) ($room['id'] ?? 0);
            if ($room_id > 0) {
                $ids[] = $room_id;
            }
        }
        return array_values(array_unique($ids));
    }

    private function get_next_room_id(array $rooms): int {
        $max_id = 0;
        foreach ($rooms as $room) {
            $room_id = (int) ($room['id'] ?? 0);
            if ($room_id > $max_id) {
                $max_id = $room_id;
            }
        }
        return $max_id + 1;
    }

    private function create_room_template(int $room_id): array {
        return [
            'id' => $room_id,
            'glb' => '',
            'texture' => '',
            'railMin' => -2,
            'railMax' => 1,
            'scrollSpeed' => 0.005,
            'eyeHeight' => 1.67,
            'panels' => [
                $this->panel_template($this->build_panel_id($room_id, 1), [-1.5, 1.5, 3.5], [0, M_PI, 0]),
            ],
            'navPanel' => [
                'enabled' => false,
                'position' => [3.25, 1.5, 0],
                'rotation' => [0, -M_PI / 2, 0],
                'label' => 'Next Room ->',
                'nextRoomId' => $room_id,
            ],
        ];
    }

    private function get_default_rooms(): array {
        return [
            [
                'id' => 1,
                'glb' => '/2026/05/TestRoom1.glb',
                'texture' => '/2026/05/TestRoom1.webp',
                'railMin' => -2,
                'railMax' => 1,
                'scrollSpeed' => 0.005,
                'eyeHeight' => 1.67,
                'panels' => [
                    $this->panel_template('room1-panel1', [-1.5, 1.5, 3.5], [0, M_PI, 0]),
                ],
                'navPanel' => [
                    'enabled' => true,
                    'position' => [3.25, 1.5, 0],
                    'rotation' => [0, -M_PI / 2, 0],
                    'label' => 'Room 2 ->',
                    'nextRoomId' => 2,
                ],
            ],
            [
                'id' => 2,
                'glb' => '/2026/05/TestRoom2.glb',
                'texture' => '/2026/05/TestRoom2.webp',
                'railMin' => -2,
                'railMax' => 1,
                'scrollSpeed' => 0.005,
                'eyeHeight' => 1.67,
                'panels' => [
                    $this->panel_template('room2-panel1', [-1.5, 1.5, 3.5], [0, M_PI, 0]),
                ],
                'navPanel' => [
                    'enabled' => true,
                    'position' => [3.25, 1.5, 0],
                    'rotation' => [0, -M_PI / 2, 0],
                    'label' => 'Room 3 ->',
                    'nextRoomId' => 3,
                ],
            ],
            [
                'id' => 3,
                'glb' => '/2026/05/TestRoom3.glb',
                'texture' => '/2026/05/TestRoom3.webp',
                'railMin' => -2,
                'railMax' => 1,
                'scrollSpeed' => 0.005,
                'eyeHeight' => 1.67,
                'panels' => [
                    $this->panel_template('room3-panel1', [-1.5, 1.5, 3.5], [0, M_PI, 0]),
                ],
                'navPanel' => [
                    'enabled' => true,
                    'position' => [3.25, 1.5, 0],
                    'rotation' => [0, -M_PI / 2, 0],
                    'label' => 'Room 1 ->',
                    'nextRoomId' => 1,
                ],
            ],
        ];
    }

    private function panel_template(string $id, array $position, array $rotation, array $scale = [2, 1.5]): array {
        return [
            'id' => $id,
            'slug' => '',
            'position' => $position,
            'rotation' => $rotation,
            'scale' => $scale,
            'image' => '',
            'title' => '',
            'caption' => '',
            'description' => '',
            'videoUrl' => '',
            'links' => [],
        ];
    }

    private function build_panel_id(int $room_id, int $panel_number): string {
        return 'room' . $room_id . '-panel' . $panel_number;
    }
}
