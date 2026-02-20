import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== API Routes ====================

// Get all users (for search/discovery)
app.get('/api/users', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare(`
    SELECT id, email, full_name, headline, profile_image, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 50
  `).all()
  
  return c.json({ users: results })
})

// Get user by ID
app.get('/api/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  const user = await DB.prepare(`
    SELECT u.id, u.email, u.full_name, u.headline, u.profile_image, u.created_at,
           p.about, p.location, p.website
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(userId).first()
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  return c.json({ user })
})

// Get user's experiences
app.get('/api/users/:id/experiences', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  const { results } = await DB.prepare(`
    SELECT * FROM experiences
    WHERE user_id = ?
    ORDER BY is_current DESC, start_date DESC
  `).bind(userId).all()
  
  return c.json({ experiences: results })
})

// Get user's education
app.get('/api/users/:id/education', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  const { results } = await DB.prepare(`
    SELECT * FROM education
    WHERE user_id = ?
    ORDER BY start_date DESC
  `).bind(userId).all()
  
  return c.json({ education: results })
})

// Get user's skills
app.get('/api/users/:id/skills', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  const { results } = await DB.prepare(`
    SELECT * FROM skills
    WHERE user_id = ?
    ORDER BY endorsements DESC
  `).bind(userId).all()
  
  return c.json({ skills: results })
})

// Get all posts (feed)
app.get('/api/posts', async (c) => {
  const { DB } = c.env
  
  const { results } = await DB.prepare(`
    SELECT p.*, u.full_name, u.headline, u.profile_image
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all()
  
  return c.json({ posts: results })
})

// Get posts by user
app.get('/api/users/:id/posts', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  const { results } = await DB.prepare(`
    SELECT p.*, u.full_name, u.headline, u.profile_image
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).bind(userId).all()
  
  return c.json({ posts: results })
})

// Create new post
app.post('/api/posts', async (c) => {
  const { DB } = c.env
  const { user_id, content, image_url } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO posts (user_id, content, image_url)
    VALUES (?, ?, ?)
  `).bind(user_id, content, image_url || null).run()
  
  return c.json({ id: result.meta.last_row_id, user_id, content, image_url })
})

// Like a post
app.post('/api/posts/:id/like', async (c) => {
  const { DB } = c.env
  const postId = c.req.param('id')
  const { user_id } = await c.req.json()
  
  try {
    await DB.prepare(`
      INSERT INTO post_likes (post_id, user_id)
      VALUES (?, ?)
    `).bind(postId, user_id).run()
    
    await DB.prepare(`
      UPDATE posts SET likes_count = likes_count + 1
      WHERE id = ?
    `).bind(postId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Already liked or post not found' }, 400)
  }
})

// Get comments for a post
app.get('/api/posts/:id/comments', async (c) => {
  const { DB } = c.env
  const postId = c.req.param('id')
  
  const { results } = await DB.prepare(`
    SELECT c.*, u.full_name, u.profile_image
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).bind(postId).all()
  
  return c.json({ comments: results })
})

// Add comment to post
app.post('/api/posts/:id/comments', async (c) => {
  const { DB } = c.env
  const postId = c.req.param('id')
  const { user_id, content } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO comments (post_id, user_id, content)
    VALUES (?, ?, ?)
  `).bind(postId, user_id, content).run()
  
  await DB.prepare(`
    UPDATE posts SET comments_count = comments_count + 1
    WHERE id = ?
  `).bind(postId).run()
  
  return c.json({ id: result.meta.last_row_id, post_id: postId, user_id, content })
})

// Get user's connections
app.get('/api/users/:id/connections', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  const { results } = await DB.prepare(`
    SELECT u.id, u.full_name, u.headline, u.profile_image, c.status
    FROM connections c
    JOIN users u ON (c.following_id = u.id AND c.follower_id = ?)
    WHERE c.status = 'accepted'
    ORDER BY u.full_name
  `).bind(userId).all()
  
  return c.json({ connections: results })
})

// Send connection request
app.post('/api/connections', async (c) => {
  const { DB } = c.env
  const { follower_id, following_id } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO connections (follower_id, following_id, status)
      VALUES (?, ?, 'pending')
    `).bind(follower_id, following_id).run()
    
    return c.json({ id: result.meta.last_row_id, status: 'pending' })
  } catch (error) {
    return c.json({ error: 'Connection request already exists' }, 400)
  }
})

// Accept/reject connection request
app.put('/api/connections/:id', async (c) => {
  const { DB } = c.env
  const connectionId = c.req.param('id')
  const { status } = await c.req.json()
  
  await DB.prepare(`
    UPDATE connections
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(status, connectionId).run()
  
  return c.json({ success: true, status })
})

// ==================== Frontend Route ====================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ProNetwork - 전문가 네트워킹 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .card { @apply bg-white rounded-lg shadow-md p-6 mb-4; }
          .btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition; }
          .btn-secondary { @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition; }
        </style>
    </head>
    <body class="bg-gray-100">
        <!-- Navigation -->
        <nav class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-8">
                        <h1 class="text-2xl font-bold text-blue-600">
                            <i class="fas fa-network-wired mr-2"></i>ProNetwork
                        </h1>
                        <div class="hidden md:flex space-x-4">
                            <a href="#" class="nav-link text-gray-700 hover:text-blue-600" data-page="feed">
                                <i class="fas fa-home mr-1"></i>홈
                            </a>
                            <a href="#" class="nav-link text-gray-700 hover:text-blue-600" data-page="network">
                                <i class="fas fa-users mr-1"></i>네트워크
                            </a>
                            <a href="#" class="nav-link text-gray-700 hover:text-blue-600" data-page="profile">
                                <i class="fas fa-user mr-1"></i>프로필
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <input type="text" id="searchInput" placeholder="사람 검색..." 
                               class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button class="btn-secondary">
                            <i class="fas fa-bell"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Left Sidebar -->
                <div class="md:col-span-3">
                    <div id="profileCard" class="card">
                        <div class="text-center">
                            <img src="https://i.pravatar.cc/150?img=1" 
                                 class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100">
                            <h3 class="font-bold text-lg">John Doe</h3>
                            <p class="text-gray-600 text-sm">Software Engineer at Tech Corp</p>
                            <div class="mt-4 pt-4 border-t">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">연결</span>
                                    <span class="font-bold text-blue-600">523</span>
                                </div>
                                <div class="flex justify-between text-sm mt-2">
                                    <span class="text-gray-600">프로필 조회수</span>
                                    <span class="font-bold text-blue-600">1,243</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="md:col-span-6">
                    <div id="mainContent"></div>
                </div>

                <!-- Right Sidebar -->
                <div class="md:col-span-3">
                    <div class="card">
                        <h3 class="font-bold mb-4">추천 연결</h3>
                        <div id="suggestedConnections"></div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
