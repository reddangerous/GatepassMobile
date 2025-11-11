-- Gate Pass System Database Schema for MSSQL
-- Run this script to create the database structure

-- Create Departments Table
CREATE TABLE departments (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    head_user_id NVARCHAR(50), -- Department head/HOD
    parent_department_id NVARCHAR(50), -- For hierarchical structure
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (parent_department_id) REFERENCES departments(id)
);

-- Create Users Table
CREATE TABLE users (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    payroll_no NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(255) UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('STAFF', 'HOD', 'CTO', 'CEO', 'SECURITY', 'ADMIN')),
    department_id NVARCHAR(50),
    reports_to_user_id NVARCHAR(50), -- Who this user reports to
    is_temp_password BIT DEFAULT 0, -- Flag for temporary password
    must_change_password BIT DEFAULT 0, -- Force password change on next login
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (reports_to_user_id) REFERENCES users(id)
);

-- Create Gate Passes Table
CREATE TABLE gate_passes (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    user_id NVARCHAR(50) NOT NULL,
    hod_id NVARCHAR(50),
    reason NVARCHAR(MAX) NOT NULL,
    destination NVARCHAR(500) NOT NULL,
    expected_return DATETIME2 NOT NULL,
    request_time DATETIME2 DEFAULT GETDATE(),
    approval_time DATETIME2,
    rejection_time DATETIME2,
    out_time DATETIME2,
    in_time DATETIME2,
    total_duration_minutes INT,
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHECKED_OUT', 'RETURNED')),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hod_id) REFERENCES users(id)
);

-- Create Indexes for better performance
CREATE INDEX idx_users_payroll ON users(payroll_no);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_reports_to ON users(reports_to_user_id);
CREATE INDEX idx_departments_head ON departments(head_user_id);
CREATE INDEX idx_gate_passes_user ON gate_passes(user_id);
CREATE INDEX idx_gate_passes_hod ON gate_passes(hod_id);
CREATE INDEX idx_gate_passes_status ON gate_passes(status);
CREATE INDEX idx_gate_passes_created ON gate_passes(created_at);

-- Trigger to update total_duration_minutes when in_time is set
GO
CREATE TRIGGER trg_calculate_duration
ON gate_passes
AFTER UPDATE
AS
BEGIN
    UPDATE gate_passes
    SET total_duration_minutes = DATEDIFF(MINUTE, out_time, in_time)
    FROM gate_passes gp
    INNER JOIN inserted i ON gp.id = i.id
    WHERE i.in_time IS NOT NULL AND i.out_time IS NOT NULL;
END;
GO

-- Trigger to update updated_at timestamp on users table
GO
CREATE TRIGGER trg_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Sample data for testing (optional)
-- Insert sample departments
INSERT INTO departments (id, name, parent_department_id) VALUES 
('dept-1', 'IT Department', NULL),
('dept-2', 'HR Department', NULL),
('dept-3', 'Finance Department', NULL),
('dept-4', 'Operations', NULL),
('dept-5', 'Security', NULL),
('dept-6', 'Management Information Systems', 'dept-1');

-- Insert sample users (password: 'password123' - bcrypt hash)
-- Note: You'll need to generate proper bcrypt hashes for production
INSERT INTO users (id, name, payroll_no, email, password_hash, role, department_id, reports_to_user_id, is_temp_password, must_change_password) VALUES
('user-1', 'John Doe', '4232', 'john.doe@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF', 'dept-1', 'user-2', 0, 0),
('user-2', 'Jane Smith', '5643', 'jane.smith@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HOD', 'dept-1', 'user-5', 0, 0),
('user-3', 'Mike Johnson', '1001', 'mike.johnson@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SECURITY', 'dept-5', 'user-5', 0, 0),
('user-4', 'Sarah Admin', '9999', 'sarah.admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'dept-1', NULL, 0, 0),
('user-5', 'David Wilson', '1000', 'david.wilson@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CTO', 'dept-6', NULL, 0, 0);

-- Set department heads
UPDATE departments SET head_user_id = 'user-2' WHERE id = 'dept-1'; -- Jane Smith as IT HOD
UPDATE departments SET head_user_id = 'user-5' WHERE id = 'dept-6'; -- David Wilson as CTO

PRINT 'Database schema created successfully!';
PRINT 'Sample users created:';
PRINT '  Staff: 4232 / password123 (Reports to Jane)';
PRINT '  IT HOD: 5643 / password123 (Reports to CTO)';
PRINT '  Security: 1001 / password123 (Reports to CTO)';
PRINT '  CTO: 1000 / password123 (Top level)';
PRINT '  Admin: 9999 / password123 (System admin)';
PRINT 'Reporting Structure: Staff → HOD → CTO, Security → CTO, Admin (sees all)';
