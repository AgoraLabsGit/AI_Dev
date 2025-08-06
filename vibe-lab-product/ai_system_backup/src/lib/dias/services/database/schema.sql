-- DIAS Database Schema
-- Persistence layer for SuperClaude and TaskMaster integration

-- SuperClaude Sessions Table
CREATE TABLE IF NOT EXISTS superclaude_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  persona VARCHAR(50) NOT NULL,
  commands_executed JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  flags JSONB DEFAULT '{}'::jsonb,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0.0000,
  mcp_servers_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- TaskMaster Configuration Table
CREATE TABLE IF NOT EXISTS task_master_config (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  tasks_json JSONB DEFAULT '{}'::jsonb,
  complexity_report JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table (Enhanced from existing structure)
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  test_strategy TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  complexity INTEGER DEFAULT NULL,
  estimated_time VARCHAR(100),
  dependencies JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  mcp_integration JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in-progress', 'done', 'deferred', 'cancelled', 'review')),
  CONSTRAINT valid_priority CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT valid_complexity CHECK (complexity IS NULL OR (complexity >= 1 AND complexity <= 10))
);

-- Context Manager Cache Table
CREATE TABLE IF NOT EXISTS context_cache (
  cache_key VARCHAR(255) PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  compressed BOOLEAN DEFAULT FALSE,
  context_type VARCHAR(50) NOT NULL,
  file_paths JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Command History Table
CREATE TABLE IF NOT EXISTS ai_command_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES superclaude_sessions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  command VARCHAR(50) NOT NULL,
  args JSONB DEFAULT '[]'::jsonb,
  flags JSONB DEFAULT '{}'::jsonb,
  context TEXT,
  persona VARCHAR(50) NOT NULL,
  mcp_servers_used JSONB DEFAULT '[]'::jsonb,
  model_used VARCHAR(50),
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0.0000,
  execution_time INTEGER NOT NULL, -- milliseconds
  success BOOLEAN NOT NULL,
  error_message TEXT,
  result_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MCP Server Metrics Table
CREATE TABLE IF NOT EXISTS mcp_server_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_type VARCHAR(50) NOT NULL,
  operation VARCHAR(100) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  execution_time INTEGER NOT NULL, -- milliseconds
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DIAS Events Table
CREATE TABLE IF NOT EXISTS dias_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Learning System Table
CREATE TABLE IF NOT EXISTS dias_learning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(100) NOT NULL,
  pattern_data JSONB NOT NULL,
  success_rate DECIMAL(5,4) DEFAULT 1.0000,
  usage_count INTEGER DEFAULT 1,
  confidence_score DECIMAL(5,4) DEFAULT 0.5000,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS dias_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,6) NOT NULL,
  unit VARCHAR(50),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tags JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_superclaude_sessions_user_id ON superclaude_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_superclaude_sessions_project_id ON superclaude_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_superclaude_sessions_session_id ON superclaude_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_superclaude_sessions_expires_at ON superclaude_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_context_cache_project_id ON context_cache(project_id);
CREATE INDEX IF NOT EXISTS idx_context_cache_expires_at ON context_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_context_cache_context_type ON context_cache(context_type);
CREATE INDEX IF NOT EXISTS idx_context_cache_last_accessed ON context_cache(last_accessed);

CREATE INDEX IF NOT EXISTS idx_ai_command_history_session_id ON ai_command_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_command_history_project_id ON ai_command_history(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_command_history_user_id ON ai_command_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_command_history_command ON ai_command_history(command);
CREATE INDEX IF NOT EXISTS idx_ai_command_history_created_at ON ai_command_history(created_at);

CREATE INDEX IF NOT EXISTS idx_mcp_server_metrics_server_type ON mcp_server_metrics(server_type);
CREATE INDEX IF NOT EXISTS idx_mcp_server_metrics_operation ON mcp_server_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_mcp_server_metrics_project_id ON mcp_server_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_mcp_server_metrics_created_at ON mcp_server_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_dias_events_event_type ON dias_events(event_type);
CREATE INDEX IF NOT EXISTS idx_dias_events_source ON dias_events(source);
CREATE INDEX IF NOT EXISTS idx_dias_events_project_id ON dias_events(project_id);
CREATE INDEX IF NOT EXISTS idx_dias_events_processed ON dias_events(processed);
CREATE INDEX IF NOT EXISTS idx_dias_events_created_at ON dias_events(created_at);

CREATE INDEX IF NOT EXISTS idx_dias_learning_project_id ON dias_learning(project_id);
CREATE INDEX IF NOT EXISTS idx_dias_learning_user_id ON dias_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_dias_learning_pattern_type ON dias_learning(pattern_type);
CREATE INDEX IF NOT EXISTS idx_dias_learning_success_rate ON dias_learning(success_rate);
CREATE INDEX IF NOT EXISTS idx_dias_learning_last_used ON dias_learning(last_used);

CREATE INDEX IF NOT EXISTS idx_dias_performance_metrics_metric_type ON dias_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_dias_performance_metrics_metric_name ON dias_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_dias_performance_metrics_project_id ON dias_performance_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_dias_performance_metrics_recorded_at ON dias_performance_metrics(recorded_at);

-- Cleanup functions for expired data
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM superclaude_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM context_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
CREATE TRIGGER update_superclaude_sessions_updated_at
  BEFORE UPDATE ON superclaude_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_master_config_updated_at
  BEFORE UPDATE ON task_master_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dias_learning_updated_at
  BEFORE UPDATE ON dias_learning
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW active_tasks AS
SELECT 
  t.*,
  u.name as assignee_name,
  cb.name as created_by_name
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
LEFT JOIN users cb ON t.created_by = cb.id
WHERE t.status IN ('pending', 'in-progress', 'review');

CREATE OR REPLACE VIEW task_dependencies AS
WITH RECURSIVE task_deps AS (
  -- Base case: tasks with no dependencies
  SELECT 
    id,
    title,
    status,
    dependencies,
    0 as depth,
    ARRAY[id] as path
  FROM tasks 
  WHERE jsonb_array_length(dependencies) = 0
  
  UNION ALL
  
  -- Recursive case: tasks that depend on other tasks
  SELECT 
    t.id,
    t.title,
    t.status,
    t.dependencies,
    td.depth + 1,
    td.path || t.id
  FROM tasks t
  INNER JOIN task_deps td ON td.id = ANY(
    SELECT jsonb_array_elements_text(t.dependencies)::varchar
  )
  WHERE NOT (t.id = ANY(td.path)) -- Prevent cycles
)
SELECT * FROM task_deps ORDER BY depth, id;

CREATE OR REPLACE VIEW project_ai_usage_summary AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  COUNT(ach.id) as total_commands,
  SUM(ach.tokens_used) as total_tokens,
  SUM(ach.cost) as total_cost,
  AVG(ach.execution_time) as avg_execution_time,
  COUNT(CASE WHEN ach.success THEN 1 END) as successful_commands,
  COUNT(CASE WHEN NOT ach.success THEN 1 END) as failed_commands
FROM projects p
LEFT JOIN ai_command_history ach ON p.id = ach.project_id
WHERE ach.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name;

-- Comments for documentation
COMMENT ON TABLE superclaude_sessions IS 'Stores SuperClaude AI session data with context and execution history';
COMMENT ON TABLE task_master_config IS 'TaskMaster configuration and state per project';
COMMENT ON TABLE tasks IS 'Enhanced task management with complexity analysis and MCP integration';
COMMENT ON TABLE context_cache IS 'LRU cache for context data with compression and metadata';
COMMENT ON TABLE ai_command_history IS 'Complete history of AI command executions for analytics';
COMMENT ON TABLE mcp_server_metrics IS 'Performance metrics for MCP server operations';
COMMENT ON TABLE dias_events IS 'Event bus for DIAS system communication and monitoring';
COMMENT ON TABLE dias_learning IS 'Machine learning patterns and success rates for system improvement';
COMMENT ON TABLE dias_performance_metrics IS 'System performance metrics for monitoring and optimization';