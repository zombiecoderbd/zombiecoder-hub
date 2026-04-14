#!/bin/bash

# ============================================================================
# ZombieCoder Hub v2.0 - Database Schema Fix Script
# ============================================================================
# This script fixes all TEXT column size issues in MySQL database
# ============================================================================

DB_USER="root"
DB_PASS="105585"
DB_NAME="zombiecoder"

echo "=========================================="
echo "  ZombieCoder Hub - Database Schema Fix"
echo "=========================================="
echo ""

# Function to execute MySQL command
exec_mysql() {
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$1" 2>/dev/null | grep -v "Warning"
}

# 1. Fix sessions table
echo "📝 Fixing sessions table..."
exec_mysql "ALTER TABLE sessions MODIFY COLUMN token TEXT;"
exec_mysql "ALTER TABLE sessions MODIFY COLUMN contextJson TEXT;"
exec_mysql "ALTER TABLE sessions MODIFY COLUMN metadata TEXT;"
echo "✅ sessions table fixed"
echo ""

# 2. Fix messages table
echo "📝 Fixing messages table..."
exec_mysql "ALTER TABLE messages MODIFY COLUMN content TEXT;"
exec_mysql "ALTER TABLE messages MODIFY COLUMN metadata TEXT;"
echo "✅ messages table fixed"
echo ""

# 3. Fix agents table
echo "📝 Fixing agents table..."
exec_mysql "ALTER TABLE agents MODIFY COLUMN personaJson TEXT;"
exec_mysql "ALTER TABLE agents MODIFY COLUMN description TEXT;"
echo "✅ agents table fixed"
echo ""

# 4. Fix agent_configs table
echo "📝 Fixing agent_configs table..."
exec_mysql "ALTER TABLE agent_configs MODIFY COLUMN configJson TEXT;"
echo "✅ agent_configs table fixed"
echo ""

# 5. Fix agent_memory table
echo "📝 Fixing agent_memory table..."
exec_mysql "ALTER TABLE agent_memory MODIFY COLUMN content TEXT;"
exec_mysql "ALTER TABLE agent_memory MODIFY COLUMN embedding TEXT;"
exec_mysql "ALTER TABLE agent_memory MODIFY COLUMN metadata TEXT;"
echo "✅ agent_memory table fixed"
echo ""

# 6. Fix tools table
echo "📝 Fixing tools table..."
exec_mysql "ALTER TABLE tools MODIFY COLUMN description TEXT;"
exec_mysql "ALTER TABLE tools MODIFY COLUMN \`schema\` TEXT;"
echo "✅ tools table fixed"
echo ""

# 7. Fix tool_executions table
echo "📝 Fixing tool_executions table..."
exec_mysql "ALTER TABLE tool_executions MODIFY COLUMN input TEXT;"
exec_mysql "ALTER TABLE tool_executions MODIFY COLUMN output TEXT;"
exec_mysql "ALTER TABLE tool_executions MODIFY COLUMN errorMessage TEXT;"
echo "✅ tool_executions table fixed"
echo ""

# 8. Fix governance_policies table
echo "📝 Fixing governance_policies table..."
exec_mysql "ALTER TABLE governance_policies MODIFY COLUMN description TEXT;"
exec_mysql "ALTER TABLE governance_policies MODIFY COLUMN ruleJson TEXT;"
echo "✅ governance_policies table fixed"
echo ""

# 9. Fix audit_logs table
echo "📝 Fixing audit_logs table..."
exec_mysql "ALTER TABLE audit_logs MODIFY COLUMN details TEXT;"
echo "✅ audit_logs table fixed"
echo ""

# 10. Fix system_config table
echo "📝 Fixing system_config table..."
exec_mysql "ALTER TABLE system_config MODIFY COLUMN value TEXT;"
exec_mysql "ALTER TABLE system_config MODIFY COLUMN description TEXT;"
echo "✅ system_config table fixed"
echo ""

# 11. Fix tasks table
echo "📝 Fixing tasks table..."
exec_mysql "ALTER TABLE tasks MODIFY COLUMN description TEXT;"
echo "✅ tasks table fixed"
echo ""

# 12. Fix projects table
echo "📝 Fixing projects table..."
exec_mysql "ALTER TABLE projects MODIFY COLUMN description TEXT;"
exec_mysql "ALTER TABLE projects MODIFY COLUMN techStack TEXT;"
echo "✅ projects table fixed"
echo ""

# 13. Fix documentation table
echo "📝 Fixing documentation table..."
exec_mysql "ALTER TABLE documentation MODIFY COLUMN content TEXT;"
echo "✅ documentation table fixed"
echo ""

# Verify changes
echo "=========================================="
echo "  Verification - Column Types"
echo "=========================================="
echo ""
echo "Sessions table TEXT columns:"
exec_mysql "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='sessions' AND COLUMN_TYPE='text';"
echo ""
echo "Messages table TEXT columns:"
exec_mysql "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='messages' AND COLUMN_TYPE='text';"
echo ""
echo "System Config table TEXT columns:"
exec_mysql "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='system_config' AND COLUMN_TYPE='text';"
echo ""

echo "=========================================="
echo "  ✅ All Database Fixes Applied!"
echo "=========================================="
