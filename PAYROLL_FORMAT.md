# Payroll Number Format

## ✅ Correct Format

Payroll numbers in this system are **simple numeric values** (4 digits recommended):

✅ **Examples:**
- `4232`
- `5643`
- `1001`
- `9999`
- `1234`
- `8765`

## ❌ Incorrect Formats

Do NOT use:
- ❌ `EMP001` (alphanumeric)
- ❌ `SEC-001` (with special characters)
- ❌ `ADM001` (prefixed)
- ❌ `STAFF123` (text prefix)

## 📝 Test Accounts

The system comes with these pre-configured payroll numbers:

| Payroll | Name | Role | Password |
|---------|------|------|----------|
| **4232** | John Doe | Staff | password123 |
| **5643** | Jane Smith | HOD | password123 |
| **1001** | Mike Johnson | Security | password123 |
| **9999** | Sarah Admin | Admin | password123 |

## 🔧 Adding New Users

When adding new users to the database, use simple numeric payroll numbers:

```sql
INSERT INTO users (id, name, payroll_no, email, password_hash, role, department_id)
VALUES (
  NEWID(),
  'Employee Name',
  '1234',  -- Simple numeric payroll number
  'email@company.com',
  '$2a$10$...',  -- Bcrypt hash of password
  'STAFF',
  'dept-1'
);
```

## 📱 Login Screen

Users login with just their numeric payroll number:

```
Payroll Number: 4232
Password: ••••••••••••
```

## 💡 Recommended Format

- Use **4-digit numbers** for consistency
- Start from `1000` to `9999` for regular staff
- Reserve `9000-9999` for admin/management
- Reserve `1000-1999` for security staff
- Use `2000-8999` for general employees

Example allocation:
- `1000-1999` → Security Personnel
- `2000-4999` → Department Staff
- `5000-7999` → Department Heads
- `8000-8999` → Special Roles
- `9000-9999` → Administrators

## 🔄 Migration from Old Format

If you had alphanumeric payroll numbers, convert them:

```sql
-- Example conversion (run carefully!)
UPDATE users SET payroll_no = '4232' WHERE payroll_no = 'EMP001';
UPDATE users SET payroll_no = '5643' WHERE payroll_no = 'EMP002';
UPDATE users SET payroll_no = '1001' WHERE payroll_no = 'SEC001';
UPDATE users SET payroll_no = '9999' WHERE payroll_no = 'ADM001';
```

## ✨ Benefits of Numeric Format

- ✅ Simple and easy to remember
- ✅ Quick to type on mobile
- ✅ Universal format (no special characters)
- ✅ Consistent across systems
- ✅ No confusion with prefixes
- ✅ Works well with security scanners

---

**Note:** This system uses numeric payroll numbers only. Make sure all user accounts follow this format!
