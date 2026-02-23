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

// Update user profile
app.put('/api/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { full_name, headline, email } = await c.req.json()
  
  // Update users table
  await DB.prepare(`
    UPDATE users 
    SET full_name = ?, headline = ?, email = ?
    WHERE id = ?
  `).bind(full_name, headline, email, userId).run()
  
  return c.json({ success: true, message: 'Profile updated' })
})

// Update user profile details
app.put('/api/users/:id/profile', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { about, location, website } = await c.req.json()
  
  // Update profiles table
  await DB.prepare(`
    UPDATE profiles 
    SET about = ?, location = ?, website = ?
    WHERE user_id = ?
  `).bind(about, location, website, userId).run()
  
  return c.json({ success: true, message: 'Profile details updated' })
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

// Create experience
app.post('/api/experiences', async (c) => {
  const { DB } = c.env
  const { user_id, position, company, start_date, end_date, description, is_current } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO experiences (user_id, position, company, start_date, end_date, description, is_current)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(user_id, position, company, start_date, end_date || null, description || '', is_current ? 1 : 0).run()
  
  return c.json({ success: true, experience_id: result.meta.last_row_id })
})

// Update experience
app.put('/api/experiences/:id', async (c) => {
  const { DB } = c.env
  const expId = c.req.param('id')
  const { position, company, start_date, end_date, description, is_current } = await c.req.json()
  
  await DB.prepare(`
    UPDATE experiences
    SET position = ?, company = ?, start_date = ?, end_date = ?, description = ?, is_current = ?
    WHERE id = ?
  `).bind(position, company, start_date, end_date || null, description || '', is_current ? 1 : 0, expId).run()
  
  return c.json({ success: true, message: 'Experience updated' })
})

// Delete experience
app.delete('/api/experiences/:id', async (c) => {
  const { DB } = c.env
  const expId = c.req.param('id')
  
  await DB.prepare(`DELETE FROM experiences WHERE id = ?`).bind(expId).run()
  
  return c.json({ success: true, message: 'Experience deleted' })
})

// Create education
app.post('/api/education', async (c) => {
  const { DB } = c.env
  const { user_id, school, degree, field_of_study, start_date, end_date, description } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO education (user_id, school, degree, field_of_study, start_date, end_date, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(user_id, school, degree, field_of_study, start_date, end_date || null, description || '').run()
  
  return c.json({ success: true, education_id: result.meta.last_row_id })
})

// Update education
app.put('/api/education/:id', async (c) => {
  const { DB } = c.env
  const eduId = c.req.param('id')
  const { school, degree, field_of_study, start_date, end_date, description } = await c.req.json()
  
  await DB.prepare(`
    UPDATE education
    SET school = ?, degree = ?, field_of_study = ?, start_date = ?, end_date = ?, description = ?
    WHERE id = ?
  `).bind(school, degree, field_of_study, start_date, end_date || null, description || '', eduId).run()
  
  return c.json({ success: true, message: 'Education updated' })
})

// Delete education
app.delete('/api/education/:id', async (c) => {
  const { DB } = c.env
  const eduId = c.req.param('id')
  
  await DB.prepare(`DELETE FROM education WHERE id = ?`).bind(eduId).run()
  
  return c.json({ success: true, message: 'Education deleted' })
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

// Add skill
app.post('/api/skills', async (c) => {
  const { DB } = c.env
  const { user_id, skill_name } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO skills (user_id, skill_name, endorsements)
    VALUES (?, ?, 0)
  `).bind(user_id, skill_name).run()
  
  return c.json({ success: true, skill_id: result.meta.last_row_id })
})

// Delete skill
app.delete('/api/skills/:id', async (c) => {
  const { DB } = c.env
  const skillId = c.req.param('id')
  
  await DB.prepare(`DELETE FROM skills WHERE id = ?`).bind(skillId).run()
  
  return c.json({ success: true, message: 'Skill deleted' })
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

// ============================================
// PROFILE EDIT APIs
// ============================================

// Update user profile
app.put('/api/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { full_name, headline, email } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE users 
      SET full_name = ?, headline = ?, email = ?
      WHERE id = ?
    `).bind(full_name, headline, email, userId).run()
    
    return c.json({ success: true, message: 'Profile updated' })
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 400)
  }
})

// Update user profile details
app.put('/api/users/:id/profile', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { about, location, website } = await c.req.json()
  
  try {
    // Check if profile exists
    const existing = await DB.prepare(`
      SELECT user_id FROM profiles WHERE user_id = ?
    `).bind(userId).first()
    
    if (existing) {
      // Update existing profile
      await DB.prepare(`
        UPDATE profiles 
        SET about = ?, location = ?, website = ?
        WHERE user_id = ?
      `).bind(about, location, website, userId).run()
    } else {
      // Insert new profile
      await DB.prepare(`
        INSERT INTO profiles (user_id, about, location, website)
        VALUES (?, ?, ?, ?)
      `).bind(userId, about, location, website).run()
    }
    
    return c.json({ success: true, message: 'Profile details updated' })
  } catch (error) {
    return c.json({ error: 'Failed to update profile details' }, 400)
  }
})

// Add experience
app.post('/api/users/:id/experiences', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { company, position, description, start_date, end_date, is_current } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO experiences (user_id, company, position, description, start_date, end_date, is_current)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, company, position, description || null, start_date, end_date || null, is_current ? 1 : 0).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Experience added' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to add experience' }, 400)
  }
})

// Update experience
app.put('/api/experiences/:id', async (c) => {
  const { DB } = c.env
  const expId = c.req.param('id')
  const { company, position, description, start_date, end_date, is_current } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE experiences 
      SET company = ?, position = ?, description = ?, 
          start_date = ?, end_date = ?, is_current = ?
      WHERE id = ?
    `).bind(company, position, description || null, start_date, end_date || null, is_current ? 1 : 0, expId).run()
    
    return c.json({ success: true, message: 'Experience updated' })
  } catch (error) {
    return c.json({ error: 'Failed to update experience' }, 400)
  }
})

// Delete experience
app.delete('/api/experiences/:id', async (c) => {
  const { DB } = c.env
  const expId = c.req.param('id')
  
  try {
    await DB.prepare(`
      DELETE FROM experiences WHERE id = ?
    `).bind(expId).run()
    
    return c.json({ success: true, message: 'Experience deleted' })
  } catch (error) {
    return c.json({ error: 'Failed to delete experience' }, 400)
  }
})

// Add education
app.post('/api/users/:id/education', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { school, degree, field_of_study, start_date, end_date } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO education (user_id, school, degree, field_of_study, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, school, degree, field_of_study, start_date, end_date || null).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Education added' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to add education' }, 400)
  }
})

// Update education
app.put('/api/education/:id', async (c) => {
  const { DB } = c.env
  const eduId = c.req.param('id')
  const { school, degree, field_of_study, start_date, end_date } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE education 
      SET school = ?, degree = ?, field_of_study = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `).bind(school, degree, field_of_study, start_date, end_date || null, eduId).run()
    
    return c.json({ success: true, message: 'Education updated' })
  } catch (error) {
    return c.json({ error: 'Failed to update education' }, 400)
  }
})

// Delete education
app.delete('/api/education/:id', async (c) => {
  const { DB } = c.env
  const eduId = c.req.param('id')
  
  try {
    await DB.prepare(`
      DELETE FROM education WHERE id = ?
    `).bind(eduId).run()
    
    return c.json({ success: true, message: 'Education deleted' })
  } catch (error) {
    return c.json({ error: 'Failed to delete education' }, 400)
  }
})

// Add skill
app.post('/api/users/:id/skills', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { skill_name } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO skills (user_id, skill_name, endorsements)
      VALUES (?, ?, 0)
    `).bind(userId, skill_name).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Skill added' 
    })
  } catch (error) {
    return c.json({ error: 'Skill already exists or failed to add' }, 400)
  }
})

// Delete skill
app.delete('/api/skills/:id', async (c) => {
  const { DB } = c.env
  const skillId = c.req.param('id')
  
  try {
    await DB.prepare(`
      DELETE FROM skills WHERE id = ?
    `).bind(skillId).run()
    
    return c.json({ success: true, message: 'Skill deleted' })
  } catch (error) {
    return c.json({ error: 'Failed to delete skill' }, 400)
  }
})

// ============================================
// END OF PROFILE EDIT APIs
// ============================================

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

// ==================== Auth Routes ====================

// Login
app.post('/api/auth/login', async (c) => {
  const { DB } = c.env
  const { email, password } = await c.req.json()
  
  // Find user by email
  const user = await DB.prepare(`
    SELECT id, email, full_name, password_hash, headline, profile_image
    FROM users
    WHERE email = ?
  `).bind(email).first()
  
  if (!user) {
    return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  }
  
  // In production, use bcrypt to compare passwords
  // For demo, we'll do a simple check
  // const isValid = await bcrypt.compare(password, user.password_hash)
  
  // For demo purposes, accept any password for existing users
  const isValid = true
  
  if (!isValid) {
    return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  }
  
  // In production, generate JWT token
  // const token = await generateJWT({ userId: user.id, email: user.email })
  
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      headline: user.headline,
      profile_image: user.profile_image
    }
    // token: token
  })
})

// Register
app.post('/api/auth/register', async (c) => {
  const { DB } = c.env
  const { email, password, full_name, headline } = await c.req.json()
  
  // Check if user already exists
  const existing = await DB.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first()
  
  if (existing) {
    return c.json({ error: '이미 사용 중인 이메일입니다.' }, 400)
  }
  
  // In production, hash password with bcrypt
  // const password_hash = await bcrypt.hash(password, 10)
  const password_hash = '$2a$10$demo_hash_for_development'
  
  // Insert new user
  const result = await DB.prepare(`
    INSERT INTO users (email, password_hash, full_name, headline, profile_image)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    email,
    password_hash,
    full_name,
    headline || '전문가',
    `https://i.pravatar.cc/150?u=${email}`
  ).run()
  
  const userId = result.meta.last_row_id
  
  // Create empty profile
  await DB.prepare(`
    INSERT INTO profiles (user_id) VALUES (?)
  `).bind(userId).run()
  
  return c.json({
    success: true,
    user: {
      id: userId,
      email,
      full_name,
      headline: headline || '전문가',
      profile_image: `https://i.pravatar.cc/150?u=${email}`
    }
  })
})

// ==================== Family Tree Routes ====================

// Get my family tree
app.get('/api/family/tree', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth token
  
  // Get user's family member record
  const myRecord = await DB.prepare(`
    SELECT id FROM family_members WHERE user_id = ?
  `).bind(userId).first()
  
  if (!myRecord) {
    return c.json({ error: 'Family member record not found' }, 404)
  }
  
  // Get all related family members
  const { results: relatives } = await DB.prepare(`
    SELECT DISTINCT
      fm.id,
      fm.name_ko,
      fm.name_en,
      fm.birth_date,
      fm.gender,
      fm.is_alive,
      fm.is_registered,
      fr.relationship_type as relation,
      fr.is_verified
    FROM family_relationships fr
    JOIN family_members fm ON fr.relative_id = fm.id
    WHERE fr.person_id = ? AND fr.is_verified = 1
  `).bind(myRecord.id).all()
  
  return c.json({ relatives })
})

// Add family member
app.post('/api/family/members', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth token
  const {
    name_ko,
    name_en,
    birth_date,
    gender,
    relationship_type,
    contact_info
  } = await c.req.json()
  
  // Create family member
  const memberResult = await DB.prepare(`
    INSERT INTO family_members (name_ko, name_en, birth_date, gender, is_registered, created_by)
    VALUES (?, ?, ?, ?, 0, ?)
  `).bind(name_ko, name_en, birth_date, gender, userId).run()
  
  const memberId = memberResult.meta.last_row_id
  
  // Add contact info
  if (contact_info && Array.isArray(contact_info)) {
    for (const contact of contact_info) {
      await DB.prepare(`
        INSERT INTO contact_info (family_member_id, contact_type, contact_value, is_primary)
        VALUES (?, ?, ?, ?)
      `).bind(memberId, contact.type, contact.value, contact.is_primary || 0).run()
    }
  }
  
  // Get user's family member ID
  const myRecord = await DB.prepare(`
    SELECT id FROM family_members WHERE user_id = ?
  `).bind(userId).first()
  
  // Create relationship
  await DB.prepare(`
    INSERT INTO family_relationships (person_id, relative_id, relationship_type, is_verified)
    VALUES (?, ?, ?, 1)
  `).bind(myRecord.id, memberId, relationship_type).run()
  
  // Create reverse relationship
  const reverseType = getReversRelationship(relationship_type, gender)
  await DB.prepare(`
    INSERT INTO family_relationships (person_id, relative_id, relationship_type, is_verified)
    VALUES (?, ?, ?, 1)
  `).bind(memberId, myRecord.id, reverseType).run()
  
  return c.json({ success: true, member_id: memberId })
})

// ============================================
// NODE EXPANSION SYSTEM APIs
// ============================================

// Get all nodes (with filtering)
app.get('/api/nodes', async (c) => {
  const { DB } = c.env
  const nodeType = c.req.query('type') // filter by type
  const isPublic = c.req.query('public') // filter by visibility
  
  let query = `
    SELECT 
      n.id,
      n.name,
      n.description,
      nt.name as node_type,
      nt.icon as type_icon,
      nt.color as type_color,
      n.visibility,
      n.join_approval_required,
      n.verification_level,
      n.member_count,
      n.created_at,
      u.full_name as creator_name
    FROM nodes n
    JOIN node_types nt ON n.node_type_id = nt.id
    JOIN users u ON n.creator_id = u.id
    WHERE 1=1
  `
  
  const params = []
  if (nodeType) {
    query += ` AND nt.name = ?`
    params.push(nodeType)
  }
  if (isPublic !== undefined) {
    query += ` AND n.visibility = ?`
    params.push(isPublic === 'true' ? 'public' : 'private')
  }
  
  query += ` ORDER BY n.created_at DESC LIMIT 100`
  
  const { results: nodes } = await DB.prepare(query).bind(...params).all()
  return c.json({ nodes })
})

// Get single node details
app.get('/api/nodes/:id', async (c) => {
  const { DB } = c.env
  const nodeId = c.req.param('id')
  const userId = 1 // TODO: Get from auth token
  
  // Get node info
  const node = await DB.prepare(`
    SELECT 
      n.*,
      nt.name as node_type,
      nt.icon as type_icon,
      nt.color as type_color,
      u.full_name as creator_name
    FROM nodes n
    JOIN node_types nt ON n.node_type_id = nt.id
    JOIN users u ON n.creator_id = u.id
    WHERE n.id = ?
  `).bind(nodeId).first()
  
  if (!node) {
    return c.json({ error: 'Node not found' }, 404)
  }
  
  // Check if user is member
  const membership = await DB.prepare(`
    SELECT 
      nm.*,
      nr.role_name,
      nr.level as role_level,
      rl.name_ko as level_name,
      rl.color as level_color
    FROM node_memberships nm
    JOIN node_roles nr ON nm.role_id = nr.id
    LEFT JOIN relationship_levels rl ON nm.relationship_level = rl.level
    WHERE nm.node_id = ? AND nm.user_id = ?
  `).bind(nodeId, userId).first()
  
  return c.json({ 
    node,
    membership: membership || null,
    is_member: !!membership
  })
})

// Get node members
app.get('/api/nodes/:id/members', async (c) => {
  const { DB } = c.env
  const nodeId = c.req.param('id')
  const userId = 1 // TODO: Get from auth token
  
  // Check if user has permission to view members
  const membership = await DB.prepare(`
    SELECT relationship_level FROM node_memberships 
    WHERE node_id = ? AND user_id = ?
  `).bind(nodeId, userId).first()
  
  if (!membership || membership.relationship_level < 2) {
    return c.json({ error: 'Permission denied' }, 403)
  }
  
  // Get members list
  const { results: members } = await DB.prepare(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.headline,
      u.profile_image,
      nm.relationship_level,
      nm.verification_count,
      nm.activity_score,
      nm.joined_at,
      nr.role_name,
      nr.level as role_level,
      rl.name_ko as level_name,
      rl.color as level_color
    FROM node_memberships nm
    JOIN users u ON nm.user_id = u.id
    JOIN node_roles nr ON nm.role_id = nr.id
    LEFT JOIN relationship_levels rl ON nm.relationship_level = rl.level
    WHERE nm.node_id = ?
    ORDER BY nm.relationship_level DESC, nm.activity_score DESC
  `).bind(nodeId).all()
  
  return c.json({ members })
})

// Create new node
app.post('/api/nodes', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth token
  const {
    name,
    description,
    node_type,
    visibility,
    join_approval_required
  } = await c.req.json()
  
  // Get node type ID
  const nodeTypeRecord = await DB.prepare(`
    SELECT id FROM node_types WHERE name = ?
  `).bind(node_type).first()
  
  if (!nodeTypeRecord) {
    return c.json({ error: 'Invalid node type' }, 400)
  }
  
  // Create node
  const result = await DB.prepare(`
    INSERT INTO nodes (
      name, description, node_type_id, creator_id, 
      visibility, join_approval_required, member_count, verification_level
    ) VALUES (?, ?, ?, ?, ?, ?, 1, 1)
  `).bind(
    name, 
    description, 
    nodeTypeRecord.id, 
    userId,
    visibility || 'private',
    join_approval_required !== false ? 1 : 0
  ).run()
  
  const nodeId = result.meta.last_row_id
  
  // Create default roles for this node
  const defaultRolesResult = await DB.prepare(`
    INSERT INTO node_roles (node_id, role_name, role_name_ko, level, color)
    VALUES 
      (?, 'owner', '소유자', 3, '#8b5cf6'),
      (?, 'admin', '관리자', 2, '#3b82f6'),
      (?, 'member', '회원', 1, '#10b981')
  `).bind(nodeId, nodeId, nodeId).run()
  
  // Get the owner role ID (first inserted role)
  const ownerRole = await DB.prepare(`
    SELECT id FROM node_roles WHERE node_id = ? AND level = 3 LIMIT 1
  `).bind(nodeId).first()
  
  // Add creator as owner member
  await DB.prepare(`
    INSERT INTO node_memberships (
      node_id, user_id, role_id, status,
      relationship_level, verification_count, 
      activity_score, joined_at
    ) VALUES (?, ?, ?, 'approved', 5, 1, 100, datetime('now'))
  `).bind(nodeId, userId, ownerRole.id).run()
  
  return c.json({ 
    success: true, 
    node_id: nodeId,
    message: 'Node created successfully'
  })
})

// Join a node
app.post('/api/nodes/:id/join', async (c) => {
  const { DB } = c.env
  const nodeId = c.req.param('id')
  const userId = 1 // TODO: Get from auth token
  const { role_id } = await c.req.json()
  
  // Check if node exists and is public
  const node = await DB.prepare(`
    SELECT visibility, join_approval_required FROM nodes WHERE id = ?
  `).bind(nodeId).first()
  
  if (!node) {
    return c.json({ error: 'Node not found' }, 404)
  }
  
  if (node.visibility !== 'public') {
    return c.json({ error: 'This node requires invitation' }, 403)
  }
  
  // Check if already member
  const existing = await DB.prepare(`
    SELECT id FROM node_memberships WHERE node_id = ? AND user_id = ?
  `).bind(nodeId, userId).first()
  
  if (existing) {
    return c.json({ error: 'Already a member' }, 400)
  }
  
  // Add membership
  const initialLevel = node.join_approval_required ? 1 : 2
  const initialStatus = node.join_approval_required ? 'pending' : 'approved'
  
  await DB.prepare(`
    INSERT INTO node_memberships (
      node_id, user_id, role_id, status,
      relationship_level, verification_count,
      activity_score, joined_at
    ) VALUES (?, ?, ?, ?, ?, 0, 10, datetime('now'))
  `).bind(nodeId, userId, role_id, initialStatus, initialLevel).run()
  
  // Update member count
  await DB.prepare(`
    UPDATE nodes SET member_count = member_count + 1 WHERE id = ?
  `).bind(nodeId).run()
  
  // Log activity
  await DB.prepare(`
    INSERT INTO node_activity_logs (node_id, user_id, activity_type, points)
    VALUES (?, ?, 'join', 10)
  `).bind(nodeId, userId).run()
  
  return c.json({ 
    success: true,
    relationship_level: initialLevel,
    message: 'Successfully joined the node'
  })
})

// Invite user to node
app.post('/api/nodes/:id/invite', async (c) => {
  const { DB } = c.env
  const nodeId = c.req.param('id')
  const userId = 1 // TODO: Get from auth token (inviter)
  const { invited_user_id, role_id, message } = await c.req.json()
  
  // Check if inviter has permission (level >= 3)
  const membership = await DB.prepare(`
    SELECT relationship_level FROM node_memberships 
    WHERE node_id = ? AND user_id = ?
  `).bind(nodeId, userId).first()
  
  if (!membership || membership.relationship_level < 3) {
    return c.json({ error: 'Permission denied' }, 403)
  }
  
  // Generate invitation token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  // Create invitation
  await DB.prepare(`
    INSERT INTO node_invitations (
      node_id, inviter_id, invited_user_id,
      role_id, invitation_token, message,
      expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+7 days'))
  `).bind(nodeId, userId, invited_user_id, role_id, token, message || null).run()
  
  // Award activity points to inviter
  await DB.prepare(`
    UPDATE node_memberships 
    SET activity_score = activity_score + 15
    WHERE node_id = ? AND user_id = ?
  `).bind(nodeId, userId).run()
  
  await DB.prepare(`
    INSERT INTO node_activity_logs (node_id, user_id, activity_type, points)
    VALUES (?, ?, 'invite', 15)
  `).bind(nodeId, userId).run()
  
  return c.json({ 
    success: true,
    invitation_token: token,
    message: 'Invitation sent successfully'
  })
})

// Accept invitation
app.post('/api/invitations/:token/accept', async (c) => {
  const { DB } = c.env
  const token = c.req.param('token')
  const userId = 1 // TODO: Get from auth token
  
  // Get invitation
  const invitation = await DB.prepare(`
    SELECT * FROM node_invitations 
    WHERE invitation_token = ? AND invited_user_id = ?
    AND status = 'pending' AND expires_at > datetime('now')
  `).bind(token, userId).first()
  
  if (!invitation) {
    return c.json({ error: 'Invalid or expired invitation' }, 404)
  }
  
  // Add membership
  await DB.prepare(`
    INSERT INTO node_memberships (
      node_id, user_id, role_id, status,
      relationship_level, verification_count,
      activity_score, joined_at
    ) VALUES (?, ?, ?, 'approved', 2, 0, 10, datetime('now'))
  `).bind(invitation.node_id, userId, invitation.role_id).run()
  
  // Update invitation status
  await DB.prepare(`
    UPDATE node_invitations 
    SET status = 'accepted', accepted_at = datetime('now')
    WHERE id = ?
  `).bind(invitation.id).run()
  
  // Update member count
  await DB.prepare(`
    UPDATE nodes SET member_count = member_count + 1 WHERE id = ?
  `).bind(invitation.node_id).run()
  
  return c.json({ 
    success: true,
    node_id: invitation.node_id,
    message: 'Invitation accepted'
  })
})

// Verify membership (mutual verification)
app.put('/api/memberships/:id/verify', async (c) => {
  const { DB } = c.env
  const membershipId = c.req.param('id')
  const userId = 1 // TODO: Get from auth token (verifier)
  
  // Get membership info
  const membership = await DB.prepare(`
    SELECT node_id, user_id FROM node_memberships WHERE id = ?
  `).bind(membershipId).first()
  
  if (!membership) {
    return c.json({ error: 'Membership not found' }, 404)
  }
  
  // Check if verifier is member of same node
  const verifierMembership = await DB.prepare(`
    SELECT id, relationship_level FROM node_memberships 
    WHERE node_id = ? AND user_id = ?
  `).bind(membership.node_id, userId).first()
  
  if (!verifierMembership || verifierMembership.relationship_level < 2) {
    return c.json({ error: 'Permission denied' }, 403)
  }
  
  // Check if already verified by this user
  const existing = await DB.prepare(`
    SELECT id FROM membership_verifications 
    WHERE membership_id = ? AND verifier_id = ?
  `).bind(membershipId, userId).first()
  
  if (existing) {
    return c.json({ error: 'Already verified by you' }, 400)
  }
  
  // Add verification
  await DB.prepare(`
    INSERT INTO membership_verifications (
      membership_id, verifier_id, verified_at
    ) VALUES (?, ?, datetime('now'))
  `).bind(membershipId, userId).run()
  
  // Update verification count and activity score
  await DB.prepare(`
    UPDATE node_memberships 
    SET 
      verification_count = verification_count + 1,
      activity_score = activity_score + 20
    WHERE id = ?
  `).bind(membershipId).run()
  
  // Get updated verification count
  const updated = await DB.prepare(`
    SELECT verification_count, activity_score FROM node_memberships WHERE id = ?
  `).bind(membershipId).first()
  
  // Check if level upgrade is needed
  let newLevel = 1
  if (updated.verification_count >= 10 && updated.activity_score >= 500) {
    newLevel = 5 // Verified
  } else if (updated.verification_count >= 5 && updated.activity_score >= 200) {
    newLevel = 4 // Leader
  } else if (updated.activity_score >= 100) {
    newLevel = 3 // Active
  } else if (updated.verification_count >= 1) {
    newLevel = 2 // Connected
  }
  
  await DB.prepare(`
    UPDATE node_memberships SET relationship_level = ? WHERE id = ?
  `).bind(newLevel, membershipId).run()
  
  // Award points to verifier
  await DB.prepare(`
    UPDATE node_memberships 
    SET activity_score = activity_score + 5
    WHERE id = ?
  `).bind(verifierMembership.id).run()
  
  return c.json({ 
    success: true,
    verification_count: updated.verification_count,
    new_level: newLevel,
    message: 'Verification added successfully'
  })
})

// Get my nodes
app.get('/api/my-nodes', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth token
  
  const { results: nodes } = await DB.prepare(`
    SELECT 
      n.id,
      n.name,
      n.description,
      nt.name as node_type,
      nt.icon as type_icon,
      nt.color as type_color,
      nm.relationship_level,
      nm.verification_count,
      nm.activity_score,
      nm.joined_at,
      nr.role_name,
      nr.level as role_level,
      rl.name_ko as level_name,
      rl.color as level_color
    FROM node_memberships nm
    JOIN nodes n ON nm.node_id = n.id
    JOIN node_types nt ON n.node_type_id = nt.id
    JOIN node_roles nr ON nm.role_id = nr.id
    LEFT JOIN relationship_levels rl ON nm.relationship_level = rl.level
    WHERE nm.user_id = ?
    ORDER BY nm.relationship_level DESC, nm.joined_at DESC
  `).bind(userId).all()
  
  return c.json({ nodes })
})

// Get my relationship level summary
app.get('/api/my-level', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth token
  
  const { results: summary } = await DB.prepare(`
    SELECT 
      nm.relationship_level,
      rl.name_ko as level_name,
      rl.color,
      COUNT(*) as count
    FROM node_memberships nm
    LEFT JOIN relationship_levels rl ON nm.relationship_level = rl.level
    WHERE nm.user_id = ?
    GROUP BY nm.relationship_level
    ORDER BY nm.relationship_level DESC
  `).bind(userId).all()
  
  return c.json({ summary })
})

// ============================================
// END OF NODE EXPANSION SYSTEM APIs
// ============================================

// Get family member details
app.get('/api/family/members/:id', async (c) => {
  const { DB } = c.env
  const memberId = c.req.param('id')
  
  // Get member info
  const member = await DB.prepare(`
    SELECT 
      fm.*,
      fp.occupation,
      fp.education,
      fp.bio,
      fp.profile_image,
      fp.is_public
    FROM family_members fm
    LEFT JOIN family_profiles fp ON fm.id = fp.family_member_id
    WHERE fm.id = ?
  `).bind(memberId).first()
  
  if (!member) {
    return c.json({ error: 'Member not found' }, 404)
  }
  
  // Get contact info
  const { results: contacts } = await DB.prepare(`
    SELECT contact_type, contact_value, is_primary
    FROM contact_info
    WHERE family_member_id = ?
  `).bind(memberId).all()
  
  // Get relationships
  const { results: relationships } = await DB.prepare(`
    SELECT 
      fm.id,
      fm.name_ko,
      fm.name_en,
      fr.relationship_type,
      fr.is_verified
    FROM family_relationships fr
    JOIN family_members fm ON fr.relative_id = fm.id
    WHERE fr.person_id = ?
  `).bind(memberId).all()
  
  return c.json({
    member,
    contacts,
    relationships
  })
})

// Request relationship verification
app.post('/api/family/verify/request', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth token
  const { target_id, relationship_type } = await c.req.json()
  
  // Generate verification code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // Create verification request
  const result = await DB.prepare(`
    INSERT INTO relationship_verifications (requester_id, target_id, relationship_type, verification_code, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).bind(userId, target_id, relationship_type, code).run()
  
  // TODO: Send verification code via email/SMS
  
  return c.json({
    success: true,
    verification_id: result.meta.last_row_id,
    code // In production, don't return code
  })
})

// Accept relationship verification
app.post('/api/family/verify/accept', async (c) => {
  const { DB } = c.env
  const { verification_id, code } = await c.req.json()
  
  // Verify code
  const verification = await DB.prepare(`
    SELECT * FROM relationship_verifications
    WHERE id = ? AND verification_code = ? AND status = 'pending'
  `).bind(verification_id, code).first()
  
  if (!verification) {
    return c.json({ error: 'Invalid verification code or request' }, 400)
  }
  
  // Update verification status
  await DB.prepare(`
    UPDATE relationship_verifications
    SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(verification_id).run()
  
  // Update relationship to verified
  await DB.prepare(`
    UPDATE family_relationships
    SET is_verified = 1
    WHERE (person_id = ? AND relative_id = ?) OR (person_id = ? AND relative_id = ?)
  `).bind(
    verification.requester_id,
    verification.target_id,
    verification.target_id,
    verification.requester_id
  ).run()
  
  return c.json({ success: true })
})

// Helper function to get reverse relationship
function getReversRelationship(type: string, gender: string): string {
  const reverseMap: Record<string, string> = {
    'father': gender === 'male' ? 'child' : 'child',
    'mother': gender === 'male' ? 'child' : 'child',
    'child': 'parent',
    'sibling': 'sibling',
    'spouse': 'spouse'
  }
  return reverseMap[type] || 'relative'
}

// ==================== Frontend Routes ====================

// New Enhanced Login page
app.get('/login-new', (c) => {
  return c.redirect('/static/login-new.html')
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>로그인 - CHON-Network</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .login-container {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
          }
          .input-group {
            position: relative;
          }
          .input-group input {
            padding-left: 45px;
          }
          .input-group i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
          }
          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 20px 0;
          }
          .divider::before,
          .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #e5e7eb;
          }
          .divider span {
            padding: 0 10px;
            color: #6b7280;
            font-size: 14px;
          }
          .checkbox-custom {
            appearance: none;
            width: 20px;
            height: 20px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            cursor: pointer;
            position: relative;
          }
          .checkbox-custom:checked {
            background: #667eea;
            border-color: #667eea;
          }
          .checkbox-custom:checked::after {
            content: '✓';
            position: absolute;
            color: white;
            font-size: 14px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        </style>
    </head>
    <body class="flex items-center justify-center p-4">
        <div class="login-container w-full max-w-md rounded-2xl shadow-2xl p-8">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="inline-block">
                    <i class="fas fa-network-wired text-5xl text-purple-600 mb-3"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">CHON-Network</h1>
                <p class="text-gray-600">전문가 네트워킹 플랫폼</p>
            </div>
            
            <!-- Login Form -->
            <form id="loginForm" class="space-y-4">
                <!-- Email Input -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        이메일
                    </label>
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input 
                            type="email" 
                            id="email" 
                            required
                            placeholder="이메일을 입력하세요"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <!-- Password Input -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호
                    </label>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input 
                            type="password" 
                            id="password" 
                            required
                            placeholder="비밀번호를 입력하세요"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <!-- Remember & Find -->
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" class="checkbox-custom mr-2">
                        <span class="text-gray-700">로그인 상태 유지</span>
                    </label>
                    <a href="#" class="text-purple-600 hover:text-purple-700 font-medium">
                        비밀번호 찾기
                    </a>
                </div>
                
                <!-- Error Message -->
                <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorText"></span>
                </div>
                
                <!-- Login Button -->
                <button 
                    type="submit" 
                    class="btn-primary w-full text-white font-semibold py-3 rounded-lg"
                >
                    로그인
                </button>
            </form>
            
            <!-- Divider -->
            <div class="divider">
                <span>또는</span>
            </div>
            
            <!-- Social Login -->
            <div class="space-y-3">
                <button class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <i class="fab fa-google text-red-500 text-xl mr-3"></i>
                    <span class="font-medium text-gray-700">Google로 계속하기</span>
                </button>
                <button class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <i class="fab fa-facebook text-blue-600 text-xl mr-3"></i>
                    <span class="font-medium text-gray-700">Facebook으로 계속하기</span>
                </button>
            </div>
            
            <!-- Register Link -->
            <div class="text-center mt-6 pt-6 border-t border-gray-200">
                <p class="text-gray-600">
                    아직 회원이 아니신가요?
                    <a href="/register" class="text-purple-600 hover:text-purple-700 font-semibold ml-1">
                        회원가입
                    </a>
                </p>
            </div>
            
            <!-- Footer -->
            <div class="text-center mt-6 text-xs text-gray-500">
                <p>로그인하시면 CHON-Network의 
                    <a href="#" class="text-purple-600 hover:underline">이용약관</a> 및 
                    <a href="#" class="text-purple-600 hover:underline">개인정보 처리방침</a>에 
                    동의하는 것으로 간주합니다.
                </p>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/login.js"></script>
    </body>
    </html>
  `)
})

// Register page
app.get('/register', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>회원가입 - CHON-Network</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .register-container {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
          }
          .input-group {
            position: relative;
          }
          .input-group input {
            padding-left: 45px;
          }
          .input-group i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
          }
          .checkbox-custom {
            appearance: none;
            width: 20px;
            height: 20px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            cursor: pointer;
            position: relative;
          }
          .checkbox-custom:checked {
            background: #667eea;
            border-color: #667eea;
          }
          .checkbox-custom:checked::after {
            content: '✓';
            position: absolute;
            color: white;
            font-size: 14px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        </style>
    </head>
    <body class="flex items-center justify-center p-4">
        <div class="register-container w-full max-w-md rounded-2xl shadow-2xl p-8 my-8">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="inline-block">
                    <i class="fas fa-network-wired text-5xl text-purple-600 mb-3"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
                <p class="text-gray-600">CHON-Network에 오신 것을 환영합니다</p>
            </div>
            
            <!-- Register Form -->
            <form id="registerForm" class="space-y-4">
                <!-- Full Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span class="text-red-500">*</span>
                    </label>
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input 
                            type="text" 
                            id="fullName" 
                            required
                            placeholder="이름을 입력하세요"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        이메일 <span class="text-red-500">*</span>
                    </label>
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input 
                            type="email" 
                            id="email" 
                            required
                            placeholder="이메일을 입력하세요"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <!-- Password -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 <span class="text-red-500">*</span>
                    </label>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input 
                            type="password" 
                            id="password" 
                            required
                            placeholder="비밀번호를 입력하세요 (8자 이상)"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                    <p class="text-xs text-gray-500 mt-1">영문, 숫자, 특수문자 조합 8자 이상</p>
                </div>
                
                <!-- Confirm Password -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 확인 <span class="text-red-500">*</span>
                    </label>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            required
                            placeholder="비밀번호를 다시 입력하세요"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <!-- Headline -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        한 줄 소개
                    </label>
                    <div class="input-group">
                        <i class="fas fa-briefcase"></i>
                        <input 
                            type="text" 
                            id="headline" 
                            placeholder="예: 소프트웨어 엔지니어"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <!-- Terms -->
                <div class="space-y-2">
                    <label class="flex items-start cursor-pointer">
                        <input type="checkbox" id="termsAll" class="checkbox-custom mr-2 mt-0.5">
                        <span class="text-sm font-semibold text-gray-700">전체 동의</span>
                    </label>
                    <div class="ml-7 space-y-2">
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" class="checkbox-custom mr-2 mt-0.5" required>
                            <span class="text-sm text-gray-600">[필수] 이용약관 동의</span>
                        </label>
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" class="checkbox-custom mr-2 mt-0.5" required>
                            <span class="text-sm text-gray-600">[필수] 개인정보 처리방침 동의</span>
                        </label>
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" class="checkbox-custom mr-2 mt-0.5">
                            <span class="text-sm text-gray-600">[선택] 마케팅 정보 수신 동의</span>
                        </label>
                    </div>
                </div>
                
                <!-- Error Message -->
                <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorText"></span>
                </div>
                
                <!-- Register Button -->
                <button 
                    type="submit" 
                    class="btn-primary w-full text-white font-semibold py-3 rounded-lg"
                >
                    회원가입
                </button>
            </form>
            
            <!-- Login Link -->
            <div class="text-center mt-6 pt-6 border-t border-gray-200">
                <p class="text-gray-600">
                    이미 회원이신가요?
                    <a href="/login" class="text-purple-600 hover:text-purple-700 font-semibold ml-1">
                        로그인
                    </a>
                </p>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/register.js"></script>
    </body>
    </html>
  `)
})

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>CHON-Network - 전문가 네트워킹 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          /* Base styles */
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          /* Responsive card */
          .card { 
            @apply bg-white rounded-lg shadow-md p-4 md:p-6 mb-4; 
          }
          
          /* Responsive buttons */
          .btn-primary { 
            @apply bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base; 
          }
          .btn-secondary { 
            @apply bg-gray-200 text-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-300 transition text-sm md:text-base; 
          }
          
          /* Tab buttons */
          .tab-button {
            @apply px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-gray-600 hover:text-blue-600 transition border-b-2 border-transparent;
          }
          .tab-button.active {
            @apply text-blue-600 border-blue-600 font-semibold;
          }
          
          /* Responsive modal */
          .modal-overlay {
            @apply fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50;
          }
          .modal-content {
            @apply bg-white rounded-t-2xl md:rounded-lg shadow-xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto;
            animation: slideUp 0.3s ease-out;
          }
          
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          
          /* Mobile navigation */
          .mobile-nav {
            @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
          }
          
          .mobile-nav-item {
            @apply flex flex-col items-center justify-center py-2 text-gray-600 hover:text-blue-600 transition;
          }
          
          .mobile-nav-item.active {
            @apply text-blue-600;
          }
          
          /* Hamburger menu */
          .hamburger {
            @apply md:hidden cursor-pointer p-2;
          }
          
          .hamburger-line {
            @apply w-6 h-0.5 bg-gray-700 mb-1 transition-all;
          }
          
          .hamburger.active .hamburger-line:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
          }
          
          .hamburger.active .hamburger-line:nth-child(2) {
            opacity: 0;
          }
          
          .hamburger.active .hamburger-line:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
          }
          
          /* Mobile menu */
          .mobile-menu {
            @apply fixed top-16 left-0 right-0 bg-white shadow-lg z-40 md:hidden;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out;
          }
          
          .mobile-menu.active {
            max-height: 500px;
          }
          
          /* Responsive grid */
          .responsive-grid {
            @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6;
          }
          
          /* Touch-friendly */
          .touch-target {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Line clamp */
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          /* Sticky header adjustment for mobile nav */
          body {
            padding-bottom: 60px;
          }
          
          @media (min-width: 768px) {
            body {
              padding-bottom: 0;
            }
          }
          
          /* Improved scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        </style>
    </head>
    <body class="bg-gray-100">
        <!-- Top Navigation -->
        <nav class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <h1 class="text-xl md:text-2xl font-bold text-blue-600">
                            <i class="fas fa-network-wired mr-1 md:mr-2"></i>
                            <span class="hidden sm:inline">CHON-Network</span>
                            <span class="sm:hidden">CHON</span>
                        </h1>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center space-x-4">
                        <a href="#" class="nav-link text-gray-700 hover:text-blue-600 transition" data-page="feed">
                            <i class="fas fa-home mr-1"></i>홈
                        </a>
                        <a href="#" class="nav-link text-gray-700 hover:text-blue-600 transition" data-page="nodes">
                            <i class="fas fa-sitemap mr-1"></i>노드
                        </a>
                        <a href="#" class="nav-link text-gray-700 hover:text-blue-600 transition" data-page="family">
                            <i class="fas fa-users mr-1"></i>가족
                        </a>
                        <a href="#" class="nav-link text-gray-700 hover:text-blue-600 transition" data-page="profile">
                            <i class="fas fa-user mr-1"></i>프로필
                        </a>
                    </div>
                    
                    <!-- Right Side Actions -->
                    <div class="flex items-center space-x-2">
                        <!-- Search (Desktop) -->
                        <div class="hidden lg:block">
                            <input type="text" id="searchInput" placeholder="사람 검색..." 
                                   class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        </div>
                        
                        <!-- Notifications -->
                        <button class="p-2 text-gray-700 hover:text-blue-600 transition touch-target">
                            <i class="fas fa-bell text-lg"></i>
                        </button>
                        
                        <!-- Hamburger Menu (Mobile) -->
                        <button class="hamburger md:hidden" onclick="toggleMobileMenu()">
                            <div class="hamburger-line"></div>
                            <div class="hamburger-line"></div>
                            <div class="hamburger-line"></div>
                        </button>
                        
                        <!-- Logout (Desktop) -->
                        <a href="/login" id="logoutBtn" class="hidden md:block btn-secondary">
                            <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobileMenu" class="mobile-menu">
                <div class="py-2">
                    <!-- Search (Mobile) -->
                    <div class="px-4 py-2">
                        <input type="text" placeholder="사람 검색..." 
                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    </div>
                    
                    <!-- Family Menu Items -->
                    <a href="#" class="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition" data-page="albums" onclick="toggleMobileMenu()">
                        <i class="fas fa-images mr-2"></i>가족 앨범
                    </a>
                    <a href="#" class="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition" data-page="timeline" onclick="toggleMobileMenu()">
                        <i class="fas fa-calendar-alt mr-2"></i>가족 타임라인
                    </a>
                    <a href="#" class="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition" data-page="invitations" onclick="toggleMobileMenu()">
                        <i class="fas fa-link mr-2"></i>초대 링크
                    </a>
                    
                    <div class="border-t my-2"></div>
                    
                    <!-- Logout -->
                    <a href="/login" class="block px-4 py-3 text-red-600 hover:bg-red-50 transition">
                        <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                <!-- Left Sidebar (Hidden on Mobile) -->
                <div class="hidden md:block md:col-span-3">
                    <!-- Profile Card -->
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
                    
                    <!-- Family Tree Card -->
                    <div class="card mt-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg">
                                <i class="fas fa-project-diagram mr-2 text-indigo-600"></i>
                                가족 관계도
                            </h3>
                            <button onclick="toggleFamilyNetwork()" class="text-sm text-blue-600 hover:text-blue-800">
                                <i class="fas fa-expand-alt"></i>
                            </button>
                        </div>
                        
                        <!-- Compact Family Network Visualization -->
                        <div id="compactFamilyNetwork" class="relative" style="height: 300px;">
                            <div class="text-center py-12 text-gray-400">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p class="text-xs">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- Family Stats -->
                        <div class="mt-4 pt-4 border-t text-sm">
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-600">등록된 가족</span>
                                <span id="familyMemberCount" class="font-bold text-indigo-600">-</span>
                            </div>
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-600">인증 완료</span>
                                <span id="verifiedMemberCount" class="font-bold text-green-600">-</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">인증 대기</span>
                                <span id="pendingMemberCount" class="font-bold text-yellow-600">-</span>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="mt-4 pt-4 border-t flex gap-2">
                            <button onclick="showAddMemberModal()" class="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                                <i class="fas fa-plus mr-1"></i>가족 추가
                            </button>
                            <button onclick="viewFullFamilyTree()" class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                                <i class="fas fa-sitemap mr-1"></i>전체 보기
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="md:col-span-9 lg:col-span-6">
                    <div id="mainContent"></div>
                </div>

                <!-- Right Sidebar (Hidden on Mobile & Tablet) -->
                <div class="hidden lg:block lg:col-span-3">
                    <div class="card">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-sm">추천 연결</h3>
                            <button onclick="refreshSuggestedConnections()" class="text-blue-600 hover:text-blue-800 transition" title="새로고침">
                                <i class="fas fa-sync-alt text-sm"></i>
                            </button>
                        </div>
                        <div id="suggestedConnections"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Mobile Bottom Navigation -->
        <nav class="mobile-nav md:hidden">
            <div class="grid grid-cols-5 h-16">
                <a href="#" class="mobile-nav-item" data-page="feed">
                    <i class="fas fa-home text-xl mb-1"></i>
                    <span class="text-xs">홈</span>
                </a>
                <a href="#" class="mobile-nav-item" data-page="nodes">
                    <i class="fas fa-sitemap text-xl mb-1"></i>
                    <span class="text-xs">노드</span>
                </a>
                <a href="#" class="mobile-nav-item" data-page="family">
                    <i class="fas fa-users text-xl mb-1"></i>
                    <span class="text-xs">가족</span>
                </a>
                <a href="#" class="mobile-nav-item" data-page="albums">
                    <i class="fas fa-images text-xl mb-1"></i>
                    <span class="text-xs">앨범</span>
                </a>
                <a href="#" class="mobile-nav-item" data-page="profile">
                    <i class="fas fa-user text-xl mb-1"></i>
                    <span class="text-xs">프로필</span>
                </a>
            </div>
        </nav>

        <script>
          // Mobile menu toggle
          function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            const hamburger = document.querySelector('.hamburger');
            menu.classList.toggle('active');
            hamburger.classList.toggle('active');
          }
          
          // Mobile navigation active state
          document.addEventListener('DOMContentLoaded', () => {
            const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
            const desktopNavLinks = document.querySelectorAll('.nav-link');
            
            function setActiveNav(page) {
              // Mobile nav
              mobileNavItems.forEach(item => {
                if (item.getAttribute('data-page') === page) {
                  item.classList.add('active');
                } else {
                  item.classList.remove('active');
                }
              });
              
              // Desktop nav
              desktopNavLinks.forEach(link => {
                if (link.getAttribute('data-page') === page) {
                  link.classList.add('text-blue-600', 'font-semibold');
                } else {
                  link.classList.remove('text-blue-600', 'font-semibold');
                }
              });
            }
            
            // Set active on click
            [...mobileNavItems, ...desktopNavLinks].forEach(item => {
              item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                setActiveNav(page);
                
                // Close mobile menu if open
                const menu = document.getElementById('mobileMenu');
                const hamburger = document.querySelector('.hamburger');
                if (menu.classList.contains('active')) {
                  menu.classList.remove('active');
                  hamburger.classList.remove('active');
                }
              });
            });
            
            // Set initial active state
            setActiveNav('feed');
          });
        </script>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/korean-family-tree.js"></script>
        <script src="/static/family-network.js"></script>
        <script src="/static/nodes.js"></script>
        <script src="/static/profile-edit.js"></script>
        <script src="/static/family-advanced.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// ============================================
// Family Advanced Features APIs
// ============================================

// Family Albums APIs
// Get all albums
app.get('/api/family/albums', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth
  
  // Get user's family member id
  const member = await DB.prepare(`
    SELECT id FROM family_members WHERE user_id = ?
  `).bind(userId).first()
  
  if (!member) {
    return c.json({ albums: [] })
  }
  
  const { results } = await DB.prepare(`
    SELECT a.*, fm.name_ko as creator_name, 
           (SELECT COUNT(*) FROM family_photos WHERE album_id = a.id) as photo_count
    FROM family_albums a
    JOIN family_members fm ON a.family_member_id = fm.id
    ORDER BY a.created_at DESC
  `).all()
  
  return c.json({ albums: results })
})

// Get album with photos
app.get('/api/family/albums/:id', async (c) => {
  const { DB } = c.env
  const albumId = c.req.param('id')
  
  const album = await DB.prepare(`
    SELECT a.*, fm.name_ko as creator_name
    FROM family_albums a
    JOIN family_members fm ON a.family_member_id = fm.id
    WHERE a.id = ?
  `).bind(albumId).first()
  
  if (!album) {
    return c.json({ error: 'Album not found' }, 404)
  }
  
  const { results: photos } = await DB.prepare(`
    SELECT p.*, fm.name_ko as uploader_name
    FROM family_photos p
    JOIN family_members fm ON p.uploaded_by = fm.id
    WHERE p.album_id = ?
    ORDER BY p.created_at DESC
  `).bind(albumId).all()
  
  return c.json({ album, photos })
})

// Create album
app.post('/api/family/albums', async (c) => {
  const { DB } = c.env
  const { family_member_id, title, description } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO family_albums (family_member_id, title, description)
    VALUES (?, ?, ?)
  `).bind(family_member_id, title, description || '').run()
  
  return c.json({ success: true, album_id: result.meta.last_row_id })
})

// Upload photo to album
app.post('/api/family/photos', async (c) => {
  const { DB } = c.env
  const { album_id, uploaded_by, image_url, caption, photo_date, is_public } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO family_photos (album_id, uploaded_by, image_url, caption, photo_date, is_public)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(album_id, uploaded_by, image_url, caption || '', photo_date || null, is_public ? 1 : 0).run()
  
  return c.json({ success: true, photo_id: result.meta.last_row_id })
})

// Delete photo
app.delete('/api/family/photos/:id', async (c) => {
  const { DB } = c.env
  const photoId = c.req.param('id')
  
  await DB.prepare(`DELETE FROM family_photos WHERE id = ?`).bind(photoId).run()
  
  return c.json({ success: true, message: 'Photo deleted' })
})

// Family Events APIs
// Get all events (timeline)
app.get('/api/family/events', async (c) => {
  const { DB } = c.env
  
  const { results } = await DB.prepare(`
    SELECT e.*, fm.name_ko as creator_name,
           GROUP_CONCAT(ep.family_member_id) as participant_ids
    FROM family_events e
    JOIN family_members fm ON e.created_by = fm.id
    LEFT JOIN event_participants ep ON e.id = ep.event_id
    WHERE e.is_public = 1
    GROUP BY e.id
    ORDER BY e.event_date DESC
    LIMIT 100
  `).all()
  
  return c.json({ events: results })
})

// Get event details
app.get('/api/family/events/:id', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('id')
  
  const event = await DB.prepare(`
    SELECT e.*, fm.name_ko as creator_name
    FROM family_events e
    JOIN family_members fm ON e.created_by = fm.id
    WHERE e.id = ?
  `).bind(eventId).first()
  
  if (!event) {
    return c.json({ error: 'Event not found' }, 404)
  }
  
  const { results: participants } = await DB.prepare(`
    SELECT ep.*, fm.name_ko, fm.name_en
    FROM event_participants ep
    JOIN family_members fm ON ep.family_member_id = fm.id
    WHERE ep.event_id = ?
  `).bind(eventId).all()
  
  return c.json({ event, participants })
})

// Create event
app.post('/api/family/events', async (c) => {
  const { DB } = c.env
  const { created_by, event_type, title, description, event_date, location, image_url, participant_ids, is_public } = await c.req.json()
  
  const result = await DB.prepare(`
    INSERT INTO family_events (created_by, event_type, title, description, event_date, location, image_url, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(created_by, event_type, title, description || '', event_date, location || '', image_url || '', is_public !== false ? 1 : 0).run()
  
  const eventId = result.meta.last_row_id
  
  // Add participants
  if (participant_ids && participant_ids.length > 0) {
    for (const memberId of participant_ids) {
      await DB.prepare(`
        INSERT INTO event_participants (event_id, family_member_id)
        VALUES (?, ?)
      `).bind(eventId, memberId).run()
    }
  }
  
  return c.json({ success: true, event_id: eventId })
})

// Delete event
app.delete('/api/family/events/:id', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('id')
  
  await DB.prepare(`DELETE FROM family_events WHERE id = ?`).bind(eventId).run()
  
  return c.json({ success: true, message: 'Event deleted' })
})

// Family Invitation APIs
// Create invitation link
app.post('/api/family/invitations', async (c) => {
  const { DB } = c.env
  const { created_by, relationship_type, max_uses, expires_in_days } = await c.req.json()
  
  // Generate unique token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  // Calculate expiration date
  let expiresAt = null
  if (expires_in_days) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + expires_in_days)
    expiresAt = expiryDate.toISOString()
  }
  
  const result = await DB.prepare(`
    INSERT INTO family_invitations (created_by, invitation_token, relationship_type, max_uses, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(created_by, token, relationship_type || null, max_uses || 1, expiresAt).run()
  
  return c.json({ 
    success: true, 
    invitation_id: result.meta.last_row_id,
    token,
    invitation_url: `/family/invite/${token}`
  })
})

// Get invitation details
app.get('/api/family/invitations/:token', async (c) => {
  const { DB } = c.env
  const token = c.req.param('token')
  
  const invitation = await DB.prepare(`
    SELECT i.*, fm.name_ko as creator_name
    FROM family_invitations i
    JOIN family_members fm ON i.created_by = fm.id
    WHERE i.invitation_token = ? AND i.is_active = 1
  `).bind(token).first()
  
  if (!invitation) {
    return c.json({ error: 'Invitation not found or expired' }, 404)
  }
  
  // Check if expired
  if (invitation.expires_at) {
    const expiryDate = new Date(invitation.expires_at)
    if (expiryDate < new Date()) {
      return c.json({ error: 'Invitation has expired' }, 400)
    }
  }
  
  // Check if max uses reached
  if (invitation.uses_count >= invitation.max_uses) {
    return c.json({ error: 'Invitation has reached maximum uses' }, 400)
  }
  
  return c.json({ invitation })
})

// Accept invitation
app.post('/api/family/invitations/:token/accept', async (c) => {
  const { DB } = c.env
  const token = c.req.param('token')
  const { family_member_id } = await c.req.json()
  
  // Get invitation
  const invitation = await DB.prepare(`
    SELECT * FROM family_invitations
    WHERE invitation_token = ? AND is_active = 1
  `).bind(token).first()
  
  if (!invitation) {
    return c.json({ error: 'Invalid invitation' }, 404)
  }
  
  // Check expiry and uses
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return c.json({ error: 'Invitation expired' }, 400)
  }
  
  if (invitation.uses_count >= invitation.max_uses) {
    return c.json({ error: 'Invitation fully used' }, 400)
  }
  
  // Record acceptance
  await DB.prepare(`
    INSERT INTO invitation_acceptances (invitation_id, family_member_id)
    VALUES (?, ?)
  `).bind(invitation.id, family_member_id).run()
  
  // Update uses count
  await DB.prepare(`
    UPDATE family_invitations
    SET uses_count = uses_count + 1
    WHERE id = ?
  `).bind(invitation.id).run()
  
  // Create relationship if specified
  if (invitation.relationship_type) {
    await DB.prepare(`
      INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type)
      VALUES (?, ?, ?)
    `).bind(invitation.created_by, family_member_id, invitation.relationship_type).run()
  }
  
  return c.json({ success: true, message: 'Invitation accepted' })
})

// Get my invitations
app.get('/api/family/my-invitations', async (c) => {
  const { DB } = c.env
  const userId = 1 // TODO: Get from auth
  
  const member = await DB.prepare(`
    SELECT id FROM family_members WHERE user_id = ?
  `).bind(userId).first()
  
  if (!member) {
    return c.json({ invitations: [] })
  }
  
  const { results } = await DB.prepare(`
    SELECT * FROM family_invitations
    WHERE created_by = ?
    ORDER BY created_at DESC
  `).bind(member.id).all()
  
  return c.json({ invitations: results })
})

export default app
