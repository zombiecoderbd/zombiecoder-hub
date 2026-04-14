#!/bin/bash

# ============================================================================
# ZombieCoder Hub v2.0 - Complete Database Verification Script
# ============================================================================

DB_USER="root"
DB_PASS="105585"
DB_NAME="zombiecoder"

echo "=========================================="
echo "  ZombieCoder Hub - Full DB Verification"
echo "=========================================="
echo ""

# Function to execute MySQL command
exec_mysql() {
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$1" 2>/dev/null | grep -v "Warning"
}

# 1. Check all tables exist
echo "📊 Step 1: Checking Tables..."
TABLES=$(exec_mysql "SHOW TABLES;" | tail -n +2)
TABLE_COUNT=$(echo "$TABLES" | wc -l)
echo "✅ Found $TABLE_COUNT tables:"
echo "$TABLES" | sed 's/^/   - /'
echo ""

# 2. Check column counts
echo "📊 Step 2: Column Counts per Table..."
for table in $TABLES; do
    COL_COUNT=$(exec_mysql "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='$table';")
    echo "   - $table: $COL_COUNT columns"
done
echo ""

# 3. Check TEXT columns (important for large data)
echo "📊 Step 3: TEXT Columns (Large Data Support)..."
exec_mysql "SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND COLUMN_TYPE='text' ORDER BY TABLE_NAME, COLUMN_NAME;" | tail -n +2 | while read line; do
    echo "   ✓ $line"
done
echo ""

# 4. Check data counts
echo "📊 Step 4: Record Counts..."
for table in $TABLES; do
    COUNT=$(exec_mysql "SELECT COUNT(*) FROM $table;")
    echo "   - $table: $COUNT records"
done
echo ""

# 5. Check indexes
echo "📊 Step 5: Indexes..."
exec_mysql "SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME) as COLUMNS FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='$DB_NAME' GROUP BY TABLE_NAME, INDEX_NAME ORDER BY TABLE_NAME;" | tail -n +2 | while read line; do
    echo "   📌 $line"
done
echo ""

# 6. Check foreign keys
echo "📊 Step 6: Foreign Keys..."
exec_mysql "SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='$DB_NAME' AND REFERENCED_TABLE_NAME IS NOT NULL;" | tail -n +2 | while read line; do
    echo "   🔗 $line"
done
echo ""

# 7. Database size
echo "📊 Step 7: Database Size..."
exec_mysql "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size_MB' FROM information_schema.tables WHERE table_schema='$DB_NAME';"
echo ""

# 8. Check Prisma schema matches
echo "📊 Step 8: Expected vs Actual Tables..."
EXPECTED_TABLES="users sessions messages agents agent_configs agent_memory tools agent_tools tool_permissions tool_executions governance_policies audit_logs tasks projects documentation system_config system_health"
MISSING=0
for expected in $EXPECTED_TABLES; do
    if echo "$TABLES" | grep -q "$expected"; then
        echo "   ✅ $expected"
    else
        echo "   ❌ $expected (MISSING!)"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo ""
    echo "   🎉 All expected tables present!"
else
    echo ""
    echo "   ⚠️  $MISSING table(s) missing!"
fi
echo ""

echo "=========================================="
echo "  ✅ Database Verification Complete!"
echo "=========================================="
