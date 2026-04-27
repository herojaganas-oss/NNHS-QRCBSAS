"""
Database Initialization Script for NNHS Attendance System
Run this script to create a fresh database with sample data.

Usage: python init_database.py
"""

import pymysql
import bcrypt
from getpass import getpass

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Database configuration
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''  # Default for XAMPP/WAMP
DB_NAME = 'nnhs_attendance'

print("=" * 60)
print("NNHS ATTENDANCE SYSTEM - DATABASE INITIALIZATION")
print("=" * 60)
print()

# Get database credentials
print("Enter your MySQL credentials (press Enter to use defaults):")
host = input(f"MySQL Host [{DB_HOST}]: ").strip() or DB_HOST
user = input(f"MySQL User [{DB_USER}]: ").strip() or DB_USER
password = getpass(f"MySQL Password [{'' if not DB_PASSWORD else '****'}]: ").strip()
if not password:
    password = DB_PASSWORD

db_name = input(f"Database Name [{DB_NAME}]: ").strip() or DB_NAME

print()
print("Connecting to MySQL...")

try:
    # Connect to MySQL server (without database)
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    cursor = connection.cursor()
    
    # Create database if not exists
    print(f"Creating database '{db_name}'...")
    cursor.execute(f"DROP DATABASE IF EXISTS `{db_name}`")
    cursor.execute(f"CREATE DATABASE `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute(f"USE `{db_name}`")
    
    print("✓ Database created successfully!")
    print()
    print("Creating tables...")
    
    # Create admin table
    cursor.execute("""
        CREATE TABLE `admin` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(50) UNIQUE NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `security_question` VARCHAR(255),
            `security_answer` VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    # Create classrooms table
    cursor.execute("""
        CREATE TABLE `classrooms` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `grade_level` VARCHAR(50) NOT NULL,
            `section` VARCHAR(50) NOT NULL,
            `strand` VARCHAR(50),
            `room_number` VARCHAR(20),
            `capacity` INT DEFAULT 40
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    # Create teachers table
    cursor.execute("""
        CREATE TABLE `teachers` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `teacher_id` VARCHAR(50) UNIQUE NOT NULL,
            `username` VARCHAR(50) UNIQUE NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `name` VARCHAR(100) NOT NULL,
            `rank` VARCHAR(100) NOT NULL,
            `email` VARCHAR(100) NOT NULL,
            `contact_number` VARCHAR(20) NOT NULL,
            `subjects` TEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    # Create teacher_classrooms junction table
    cursor.execute("""
        CREATE TABLE `teacher_classrooms` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `teacher_id` INT NOT NULL,
            `classroom_id` INT NOT NULL,
            `subject` VARCHAR(100) NOT NULL,
            `is_primary` BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    # Create schedules table
    cursor.execute("""
        CREATE TABLE `schedules` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `teacher_id` INT NOT NULL,
            `classroom_id` INT NOT NULL,
            `subject` VARCHAR(100) NOT NULL,
            `time` VARCHAR(50) NOT NULL,
            `days` VARCHAR(50) NOT NULL,
            FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    # Create students table
    cursor.execute("""
        CREATE TABLE `students` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `student_id` VARCHAR(50) UNIQUE NOT NULL,
            `name` VARCHAR(100) NOT NULL,
            `classroom_id` INT NOT NULL,
            `parent_guardian` VARCHAR(100) NOT NULL,
            `contact_number` VARCHAR(20) NOT NULL,
            FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    # Create attendance table
    cursor.execute("""
        CREATE TABLE `attendance` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `student_id` VARCHAR(50) NOT NULL,
            `student_name` VARCHAR(100) NOT NULL,
            `classroom_id` INT NOT NULL,
            `subject` VARCHAR(100) NOT NULL,
            `teacher_id` VARCHAR(50) NOT NULL,
            `date` VARCHAR(20) NOT NULL,
            `time` VARCHAR(20) NOT NULL,
            `status` VARCHAR(20) NOT NULL,
            FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    print("✓ Tables created successfully!")
    print()
    print("Inserting sample data...")
    
    # Insert default admin account
    admin_password = hash_password('admin123')
    cursor.execute("""
        INSERT INTO `admin` (`username`, `password`)
        VALUES ('admin', %s)
    """, (admin_password,))
    
    print("✓ Admin account created (username: admin, password: admin123)")
    
    # Insert ALL classrooms for the school
    # Junior High (Grades 7-10): 4 sections each (A, B, C, D)
    # Senior High (Grades 11-12): 3 strands with 2 sections each
    classrooms_data = []
    room_counter = 101

    # Junior High School - Grades 7-10, 4 sections each
    for grade in [7, 8, 9, 10]:
        for section in ['A', 'B', 'C', 'D']:
            classrooms_data.append((
                f'Grade {grade} Section {section}',
                f'Grade {grade}',
                f'Section {section}',
                '',  # No strand for junior high
                f'Room {room_counter}',
                40
            ))
            room_counter += 1

    # Senior High School - Grades 11 & 12, 3 strands with 2 sections each
    strands = ['HUMSS', 'ABM', 'GAS']
    for grade in [11, 12]:
        for strand in strands:
            for section in ['A', 'B']:
                classrooms_data.append((
                    f'Grade {grade} {strand}-{section}',
                    f'Grade {grade}',
                    f'{strand}-{section}',
                    strand,
                    f'Room {room_counter}',
                    40
                ))
                room_counter += 1

    for classroom in classrooms_data:
        cursor.execute("""
            INSERT INTO `classrooms` (`name`, `grade_level`, `section`, `strand`, `room_number`, `capacity`)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, classroom)

    print(f"✓ Created {len(classrooms_data)} classrooms:")
    print(f"  - Junior High (Grades 7-10): 16 classrooms (4 sections each)")
    print(f"  - Senior High (Grades 11-12): {len(classrooms_data) - 16} classrooms (3 strands × 2 sections × 2 grades)")
    
    # Insert a sample teacher
    teacher_password = hash_password('teacher123')
    cursor.execute("""
        INSERT INTO `teachers` (`teacher_id`, `username`, `password`, `name`, `rank`, `email`, `contact_number`, `subjects`)
        VALUES ('T001', 'teacher1', %s, 'Sample Teacher', 'Teacher I', 'teacher@nnhs.edu.ph', '09123456789', 'Mathematics,Science')
    """, (teacher_password,))
    
    teacher_id = cursor.lastrowid
    print(f"✓ Sample teacher created (username: teacher1, password: teacher123)")
    
    # Assign teacher to Grade 7 Section A for Mathematics
    cursor.execute("""
        INSERT INTO `teacher_classrooms` (`teacher_id`, `classroom_id`, `subject`, `is_primary`)
        VALUES (%s, 1, 'Mathematics', TRUE)
    """, (teacher_id,))
    
    # Create a schedule for the teacher
    cursor.execute("""
        INSERT INTO `schedules` (`teacher_id`, `classroom_id`, `subject`, `time`, `days`)
        VALUES (%s, 1, 'Mathematics', '8:00 AM - 9:00 AM', 'Mon, Wed, Fri')
    """, (teacher_id,))
    
    print("✓ Assigned teacher to Grade 7 Section A")
    
    # Insert sample students for Grade 7 Section A
    sample_students = [
        ('123456789012', 'Juan Dela Cruz', 1, 'Maria Dela Cruz', '09111111111'),
        ('234567890123', 'Maria Santos', 1, 'Pedro Santos', '09222222222'),
        ('345678901234', 'Jose Garcia', 1, 'Ana Garcia', '09333333333'),
    ]
    
    for student in sample_students:
        cursor.execute("""
            INSERT INTO `students` (`student_id`, `name`, `classroom_id`, `parent_guardian`, `contact_number`)
            VALUES (%s, %s, %s, %s, %s)
        """, student)
    
    print(f"✓ Created {len(sample_students)} sample students in Grade 7 Section A")
    
    # Commit all changes
    connection.commit()
    
    print()
    print("=" * 60)
    print("DATABASE INITIALIZATION COMPLETE!")
    print("=" * 60)
    print()
    print("✓ Database Name:", db_name)
    print("✓ Admin Login: admin / admin123")
    print("✓ Teacher Login: teacher1 / teacher123")
    print("✓ Sample Students: 3 students in Grade 7 Section A")
    print()
    print("Next Steps:")
    print("1. Update /backend/app.py with your database credentials")
    print("2. Run: cd backend && python app.py")
    print("3. In another terminal, run: npm run dev")
    print("4. Open http://localhost:5173 in your browser")
    print()
    
except Exception as e:
    print(f"✗ Error: {e}")
    print()
    print("Please check your MySQL credentials and try again.")
    
finally:
    if 'connection' in locals():
        connection.close()
