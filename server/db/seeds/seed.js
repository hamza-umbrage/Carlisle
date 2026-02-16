const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME || 'carlisle_ccm',
        user: process.env.DB_USER || 'carlisle_user',
        password: process.env.DB_PASSWORD || 'password',
      }
);

const SALT_ROUNDS = 12;

// Demo users matching index.html
const demoUsers = [
  { name: 'Alex Morgan', email: 'alex@contractor.com', password: 'contractor1', role: 'contractor', phone: '(555) 123-4567' },
  { name: 'Priya Singh', email: 'priya@contractor.com', password: 'contractor2', role: 'contractor', phone: '(555) 234-5678' },
  { name: 'Jordan Blake', email: 'jordan@sales.com', password: 'sales123', role: 'sales_rep', phone: '(555) 345-6789' },
  { name: 'Samira Khan', email: 'samira@sales.com', password: 'sales456', role: 'sales_rep', phone: '(555) 456-7890' },
  { name: 'Miguel Torres', email: 'miguel@inspect.com', password: 'inspect1', role: 'inspector', phone: '(555) 567-8901' },
  { name: 'Taylor Reed', email: 'taylor@internal.com', password: 'internal', role: 'ccm_employee', phone: '(555) 678-9012' },
  { name: 'Chris P.', email: 'chris@internal.com', password: 'internal2', role: 'ccm_employee', phone: '(555) 789-0123' },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Clearing existing data...');
    await client.query('TRUNCATE activity_timeline, job_documents, warranty_products, warranties, inspections, job_products, jobs, product_documents, products, inspectors, sales_reps, contractors, refresh_tokens, users CASCADE');

    // ── Users ──
    console.log('Creating users...');
    const userIds = {};
    for (const u of demoUsers) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      const result = await client.query(
        'INSERT INTO users (email, password_hash, name, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [u.email, hash, u.name, u.role, u.phone]
      );
      userIds[u.email] = result.rows[0].id;
    }

    // ── Contractors ──
    console.log('Creating contractor profiles...');
    const contractorIds = {};

    const c1 = await client.query(
      `INSERT INTO contractors (user_id, company_name, contact_name, join_date, rating, specialties)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userIds['alex@contractor.com'], 'ABC Roofing Solutions', 'John Smith', '2020-03-15', 4.80, ['Commercial Roofing', 'TPO Installation', 'EPDM Systems']]
    );
    contractorIds['ABC Roofing Solutions'] = c1.rows[0].id;

    const c2 = await client.query(
      `INSERT INTO contractors (user_id, company_name, contact_name, join_date, rating, specialties)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userIds['priya@contractor.com'], 'Elite Construction Group', 'Sarah Johnson', '2021-06-20', 4.90, ['Residential Roofing', 'Metal Roofing', 'Warranty Services']]
    );
    contractorIds['Elite Construction Group'] = c2.rows[0].id;

    // ── Sales Reps ──
    console.log('Creating sales rep profiles...');
    const salesRepIds = {};

    const s1 = await client.query(
      `INSERT INTO sales_reps (user_id, territory, customers, active_leads, sales_ytd, quota, top_products)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userIds['jordan@sales.com'], 'Northeast Region', 45, 12, 2850000, 3500000, ['TPO Systems', 'Metal Roofing', 'Insulation']]
    );
    salesRepIds['SALES001'] = s1.rows[0].id;

    const s2 = await client.query(
      `INSERT INTO sales_reps (user_id, territory, customers, active_leads, sales_ytd, quota, top_products)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userIds['samira@sales.com'], 'Southeast Region', 38, 8, 3200000, 3200000, ['EPDM Systems', 'Coatings', 'Accessories']]
    );
    salesRepIds['SALES002'] = s2.rows[0].id;

    // ── Inspectors ──
    console.log('Creating inspector profiles...');
    const inspectorIds = {};

    const i1 = await client.query(
      `INSERT INTO inspectors (user_id, certifications)
       VALUES ($1, $2) RETURNING id`,
      [userIds['miguel@inspect.com'], ['Roofing Inspector', 'OSHA Certified']]
    );
    inspectorIds['INSP001'] = i1.rows[0].id;

    // ── Products ──
    console.log('Creating products...');
    const productIds = {};

    const p1 = await client.query(
      `INSERT INTO products (code, name, category, description, spec_thickness, spec_width, spec_color, spec_warranty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['PROD-TPO-001', 'Sure-Weld TPO Membrane', 'Roofing Membrane', 'Premium thermoplastic polyolefin single-ply roofing membrane', '60 mil', '10 ft', 'White', 'Up to 30 years']
    );
    productIds['PROD-TPO-001'] = p1.rows[0].id;

    const p2 = await client.query(
      `INSERT INTO products (code, name, category, description, spec_thickness, spec_width, spec_color, spec_warranty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['PROD-EPD-001', 'Sure-Seal EPDM Membrane', 'Roofing Membrane', 'High-performance ethylene propylene diene monomer roofing system', '45-60 mil', '10-30 ft', 'Black', 'Up to 25 years']
    );
    productIds['PROD-EPD-001'] = p2.rows[0].id;

    // Product documents
    await client.query(
      `INSERT INTO product_documents (product_id, name, file_type, file_size, url) VALUES
        ($1, 'Installation Guide', 'PDF', '2.3 MB', '#'),
        ($1, 'Technical Data Sheet', 'PDF', '450 KB', '#'),
        ($1, 'Safety Data Sheet', 'PDF', '320 KB', '#')`,
      [productIds['PROD-TPO-001']]
    );

    await client.query(
      `INSERT INTO product_documents (product_id, name, file_type, file_size, url) VALUES
        ($1, 'Installation Manual', 'PDF', '3.1 MB', '#'),
        ($1, 'Product Specifications', 'PDF', '680 KB', '#')`,
      [productIds['PROD-EPD-001']]
    );

    // ── Jobs ──
    console.log('Creating jobs...');
    const jobIds = {};

    const j1 = await client.query(
      `INSERT INTO jobs (code, name, contractor_id, status, type, start_date, estimated_completion, square_feet, progress)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      ['JOB2024-0156', 'Downtown Office Complex Reroof', contractorIds['ABC Roofing Solutions'], 'In Progress', 'Commercial', '2024-01-15', '2024-03-30', 25000, 65]
    );
    jobIds['JOB2024-0156'] = j1.rows[0].id;

    const j2 = await client.query(
      `INSERT INTO jobs (code, name, contractor_id, status, type, start_date, estimated_completion, square_feet, progress)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      ['JOB2024-0157', 'Residential Home - Metal Roof', contractorIds['Elite Construction Group'], 'Planning', 'Residential', '2024-02-20', '2024-03-15', 3500, 10]
    );
    jobIds['JOB2024-0157'] = j2.rows[0].id;

    const j3 = await client.query(
      `INSERT INTO jobs (code, name, contractor_id, status, type, start_date, completion_date, square_feet, progress)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      ['JOB2024-0158', 'Warehouse Roof Repair', contractorIds['ABC Roofing Solutions'], 'Completed', 'Industrial', '2024-01-05', '2024-01-28', 50000, 100]
    );
    jobIds['JOB2024-0158'] = j3.rows[0].id;

    // Job products
    await client.query(
      `INSERT INTO job_products (job_id, product_name) VALUES
        ($1, 'TPO Membrane'), ($1, 'Insulation Board'), ($1, 'Fasteners')`,
      [jobIds['JOB2024-0156']]
    );
    await client.query(
      `INSERT INTO job_products (job_id, product_name) VALUES
        ($1, 'Metal Roofing Panels'), ($1, 'Underlayment')`,
      [jobIds['JOB2024-0157']]
    );
    await client.query(
      `INSERT INTO job_products (job_id, product_name) VALUES
        ($1, 'EPDM Membrane'), ($1, 'Adhesive')`,
      [jobIds['JOB2024-0158']]
    );

    // ── Inspections ──
    console.log('Creating inspections...');

    // Embedded inspection for JOB2024-0156 (Pre-Installation, Completed)
    await client.query(
      `INSERT INTO inspections (code, job_id, inspector_id, type, status, scheduled_date, checklist)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['INS2024-0088', jobIds['JOB2024-0156'], inspectorIds['INSP001'], 'Pre-Installation', 'Completed', '2024-01-10', []]
    );

    // Standalone inspections from demoData.inspections
    await client.query(
      `INSERT INTO inspections (code, job_id, inspector_id, type, status, scheduled_date, checklist)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['INS2024-0089', jobIds['JOB2024-0156'], inspectorIds['INSP001'], 'Mid-Installation', 'Scheduled', '2024-02-15',
       ['Substrate preparation', 'Insulation installation', 'Membrane application', 'Seam integrity', 'Flashing details']]
    );

    // INS2024-0090 references JOB2024-0159 which doesn't exist — we'll reference JOB2024-0157 instead
    await client.query(
      `INSERT INTO inspections (code, job_id, type, status, scheduled_date)
       VALUES ($1, $2, $3, $4, $5)`,
      ['INS2024-0090', jobIds['JOB2024-0157'], 'Pre-Installation', 'Pending', '2024-02-12']
    );

    await client.query(
      `INSERT INTO inspections (code, job_id, inspector_id, type, status, scheduled_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['INS2024-0091', jobIds['JOB2024-0158'], inspectorIds['INSP001'], 'Final', 'Passed', '2024-02-09', 'Conducting final walkthrough']
    );

    // ── Warranties ──
    console.log('Creating warranties...');

    const w1 = await client.query(
      `INSERT INTO warranties (code, job_id, contractor_id, warranty_type, registration_date, duration, status, square_feet)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['WAR2024-0234', jobIds['JOB2024-0158'], contractorIds['ABC Roofing Solutions'], 'Total System', '2024-01-30', '20 years', 'Active', 50000]
    );

    await client.query(
      `INSERT INTO warranty_products (warranty_id, product_name) VALUES
        ($1, 'EPDM Membrane'), ($1, 'Insulation'), ($1, 'Fasteners')`,
      [w1.rows[0].id]
    );

    // WAR2024-0235 references JOB2024-0145 which doesn't exist — use JOB2024-0157
    const w2 = await client.query(
      `INSERT INTO warranties (code, job_id, contractor_id, warranty_type, registration_date, duration, status, square_feet)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['WAR2024-0235', jobIds['JOB2024-0157'], contractorIds['Elite Construction Group'], 'Standard', '2024-02-01', '15 years', 'Active', 12000]
    );

    await client.query(
      `INSERT INTO warranty_products (warranty_id, product_name) VALUES ($1, 'TPO Membrane')`,
      [w2.rows[0].id]
    );

    // ── Job Documents ──
    console.log('Creating job documents...');

    await client.query(
      `INSERT INTO job_documents (job_id, type, name, url, uploaded_by, uploaded_at) VALUES
        ($1, 'Product Document', 'TPO Spec Sheet.pdf', 'docs/JOB2024-0156-tpo-spec.pdf', 'John Smith', '2024-01-12'),
        ($1, 'Photo', 'Site-Before.jpg', 'https://via.placeholder.com/800x480?text=JOB2024-0156+Before', 'Foreman', '2024-01-14'),
        ($1, 'Photo', 'Site-Progress-01.jpg', 'https://via.placeholder.com/800x480?text=JOB2024-0156+Progress+1', 'Crew', '2024-02-01')`,
      [jobIds['JOB2024-0156']]
    );

    await client.query(
      `INSERT INTO job_documents (job_id, type, name, url, uploaded_by, uploaded_at) VALUES
        ($1, 'Product Document', 'Metal Panel Data.pdf', 'docs/JOB2024-0157-metal-data.pdf', 'Sarah Johnson', '2024-01-20')`,
      [jobIds['JOB2024-0157']]
    );

    await client.query(
      `INSERT INTO job_documents (job_id, type, name, url, uploaded_by, uploaded_at) VALUES
        ($1, 'Warranty Document', 'EPDM Warranty.pdf', 'docs/JOB2024-0158-warranty.pdf', 'Admin', '2024-01-29'),
        ($1, 'Photo', 'Final.jpg', 'https://via.placeholder.com/800x480?text=JOB2024-0158+Final', 'Inspector', '2024-01-28')`,
      [jobIds['JOB2024-0158']]
    );

    // ── Activity Timeline ──
    console.log('Creating activity timeline...');

    const activities = [
      { type: 'inspection', user: 'Mike Williams', action: 'Completed inspection for Job #2024-0160', details: 'All criteria passed. Ready for warranty registration.', ts: '2024-02-09T14:30:00Z' },
      { type: 'job', user: 'John Smith', action: 'Created new job: Commercial Building Reroof', details: '25,000 sq ft TPO system installation', ts: '2024-02-09T11:15:00Z' },
      { type: 'warranty', user: 'Sarah Johnson', action: 'Registered warranty for Roof System Installation', details: '20-year total system warranty activated', ts: '2024-02-08T16:45:00Z' },
      { type: 'document', user: 'John Smith', action: 'Downloaded TPO Installation Guide', details: 'Document accessed for job planning', ts: '2024-02-08T09:30:00Z' },
      { type: 'inspection', user: 'Lisa Chen', action: 'Scheduled inspection for next Tuesday', details: 'Pre-installation inspection for residential project', ts: '2024-02-07T13:20:00Z' },
    ];

    for (const a of activities) {
      await client.query(
        `INSERT INTO activity_timeline (type, user_name, action, details, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [a.type, a.user, a.action, a.details, a.ts]
      );
    }

    await client.query('COMMIT');
    console.log('\nSeed completed successfully!');
    console.log('\nDemo login credentials:');
    console.log('  Contractor:  alex@contractor.com / contractor1');
    console.log('  Contractor:  priya@contractor.com / contractor2');
    console.log('  Sales Rep:   jordan@sales.com / sales123');
    console.log('  Sales Rep:   samira@sales.com / sales456');
    console.log('  Inspector:   miguel@inspect.com / inspect1');
    console.log('  Admin:       taylor@internal.com / internal');
    console.log('  Admin:       chris@internal.com / internal2');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
