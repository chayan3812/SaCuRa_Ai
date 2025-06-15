/**
 * SaCuRa AI - Database Integrity Test Suite
 * Tests database operations, constraints, and data consistency
 */

const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');

class DatabaseIntegrityTester {
  constructor() {
    this.results = [];
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle({ client: this.pool });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = { info: '🔍', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${emoji[type] || '🔍'} [${timestamp}] ${message}`);
  }

  async recordTest(name, status, details = '') {
    this.results.push({ name, status, details, timestamp: new Date().toISOString() });
    this.log(`${status}: ${name} - ${details}`, status === 'PASS' ? 'success' : 'error');
  }

  async testDatabaseConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      if (result.rows.length > 0) {
        await this.recordTest('Database Connection', 'PASS', 'Successfully connected to database');
        return true;
      }
      await this.recordTest('Database Connection', 'FAIL', 'No response from database');
      return false;
    } catch (error) {
      await this.recordTest('Database Connection', 'FAIL', error.message);
      return false;
    }
  }

  async testTableStructure() {
    const tables = [
      'users', 'facebook_pages', 'customer_interactions', 'employees',
      'ad_metrics', 'restriction_alerts', 'ai_recommendations',
      'content_queue', 'ai_suggestion_feedback', 'training_prompts'
    ];

    for (const table of tables) {
      try {
        const result = await this.pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table]);

        if (result.rows.length > 0) {
          await this.recordTest(`Table Structure: ${table}`, 'PASS', `${result.rows.length} columns found`);
        } else {
          await this.recordTest(`Table Structure: ${table}`, 'FAIL', 'Table not found or no columns');
        }
      } catch (error) {
        await this.recordTest(`Table Structure: ${table}`, 'FAIL', error.message);
      }
    }
  }

  async testDataConstraints() {
    const constraints = [
      {
        name: 'User Email Unique',
        query: `SELECT COUNT(*) as count FROM users WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1`,
        expectEmpty: true
      },
      {
        name: 'Facebook Page ID Unique',
        query: `SELECT COUNT(*) as count FROM facebook_pages GROUP BY "pageId" HAVING COUNT(*) > 1`,
        expectEmpty: true
      },
      {
        name: 'Customer Interactions Data Integrity',
        query: `SELECT COUNT(*) as count FROM customer_interactions WHERE "pageId" IS NULL OR message IS NULL`,
        expectEmpty: true
      }
    ];

    for (const constraint of constraints) {
      try {
        const result = await this.pool.query(constraint.query);
        const isEmpty = result.rows.length === 0;
        
        if (constraint.expectEmpty && isEmpty) {
          await this.recordTest(constraint.name, 'PASS', 'Constraint satisfied');
        } else if (constraint.expectEmpty && !isEmpty) {
          await this.recordTest(constraint.name, 'FAIL', `Constraint violated: ${result.rows.length} violations`);
        } else {
          await this.recordTest(constraint.name, 'PASS', `Data integrity check passed`);
        }
      } catch (error) {
        await this.recordTest(constraint.name, 'FAIL', error.message);
      }
    }
  }

  async testIndexPerformance() {
    const indexTests = [
      {
        name: 'Users by ID lookup',
        query: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE id = $1',
        params: ['43354582']
      },
      {
        name: 'Customer interactions by page',
        query: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM customer_interactions WHERE "pageId" = $1 LIMIT 10',
        params: ['test_page']
      },
      {
        name: 'Facebook pages by user',
        query: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM facebook_pages WHERE "userId" = $1',
        params: ['43354582']
      }
    ];

    for (const test of indexTests) {
      try {
        const result = await this.pool.query(test.query, test.params);
        const executionTime = result.rows.find(row => row['QUERY PLAN']?.includes('Execution Time:'));
        
        if (executionTime) {
          const time = parseFloat(executionTime['QUERY PLAN'].match(/(\d+\.\d+) ms/)?.[1] || '0');
          if (time < 10) {
            await this.recordTest(`Index Performance: ${test.name}`, 'PASS', `${time}ms execution time`);
          } else {
            await this.recordTest(`Index Performance: ${test.name}`, 'FAIL', `${time}ms execution time (too slow)`);
          }
        } else {
          await this.recordTest(`Index Performance: ${test.name}`, 'PASS', 'Query executed successfully');
        }
      } catch (error) {
        await this.recordTest(`Index Performance: ${test.name}`, 'FAIL', error.message);
      }
    }
  }

  async testDataConsistency() {
    const consistencyChecks = [
      {
        name: 'Orphaned Customer Interactions',
        query: `
          SELECT COUNT(*) as count 
          FROM customer_interactions ci 
          LEFT JOIN facebook_pages fp ON ci."pageId" = fp."pageId" 
          WHERE fp."pageId" IS NULL
        `
      },
      {
        name: 'Invalid Employee References',
        query: `
          SELECT COUNT(*) as count 
          FROM employees e 
          LEFT JOIN users u ON e."userId" = u.id 
          WHERE u.id IS NULL
        `
      },
      {
        name: 'Disconnected AI Feedback',
        query: `
          SELECT COUNT(*) as count 
          FROM ai_suggestion_feedback af 
          WHERE af."messageId" NOT IN (SELECT id FROM customer_interactions)
        `
      }
    ];

    for (const check of consistencyChecks) {
      try {
        const result = await this.pool.query(check.query);
        const count = parseInt(result.rows[0]?.count || 0);
        
        if (count === 0) {
          await this.recordTest(`Data Consistency: ${check.name}`, 'PASS', 'No orphaned records found');
        } else {
          await this.recordTest(`Data Consistency: ${check.name}`, 'FAIL', `${count} orphaned records found`);
        }
      } catch (error) {
        await this.recordTest(`Data Consistency: ${check.name}`, 'FAIL', error.message);
      }
    }
  }

  async runAllTests() {
    this.log('🗄️ Starting Database Integrity Tests');
    
    const connected = await this.testDatabaseConnection();
    if (!connected) {
      this.log('❌ Cannot proceed without database connection');
      return this.results;
    }

    await this.testTableStructure();
    await this.testDataConstraints();
    await this.testIndexPerformance();
    await this.testDataConsistency();

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    this.log(`✅ Database Tests Complete: ${passed} passed, ${failed} failed`);
    return this.results;
  }
}

module.exports = DatabaseIntegrityTester;