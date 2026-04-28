from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ============================================================================
# MYSQL CONFIGURATION - EDIT THESE VALUES DIRECTLY
# ============================================================================
# IMPORTANT: Change these to match YOUR MySQL setup
# For XAMPP/WAMP: Usually root with empty password
# ============================================================================

MYSQL_USER = 'root'                    # Your MySQL username
MYSQL_PASSWORD = hubTVCoOMjBRSSdJLpIARuIrYdRhBpEc'                    # Your MySQL password (empty for XAMPP/WAMP)
MYSQL_HOST = 'mysql.railway.internal'               # Usually localhost
MYSQL_DB = 'nnhs_attendance'          # Database name

# Generate a random secret key for production:
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = 'dev-secret-key-change-in-production'

# ============================================================================
# You can optionally override these with .env file if you prefer
# ============================================================================
MYSQL_USER = os.getenv('MYSQL_USER', MYSQL_USER)
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', MYSQL_PASSWORD)
MYSQL_HOST = os.getenv('MYSQL_HOST', MYSQL_HOST)
MYSQL_DB = os.getenv('MYSQL_DB', MYSQL_DB)
SECRET_KEY = os.getenv('SECRET_KEY', SECRET_KEY)

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = SECRET_KEY

print(f"✓ Connecting to MySQL: {MYSQL_USER}@{MYSQL_HOST}/{MYSQL_DB}")

# Enable CORS
CORS(app)

db = SQLAlchemy(app)

# Helper function for password hashing
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Database Models
class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Hashed password
    security_question = db.Column(db.String(255), nullable=True)
    security_answer = db.Column(db.String(255), nullable=True)  # Hashed answer

    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'hasSecurityQuestion': self.security_question is not None
        }


class Classroom(db.Model):
    __tablename__ = 'classrooms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Grade 11 HUMSS-A"
    grade_level = db.Column(db.String(50), nullable=False)
    section = db.Column(db.String(50), nullable=False)
    strand = db.Column(db.String(50))  # For Senior High
    room_number = db.Column(db.String(20))
    capacity = db.Column(db.Integer)

    # Relationships
    students = db.relationship('Student', backref='classroom', lazy=True)
    teacher_assignments = db.relationship('TeacherClassroom', backref='classroom', lazy=True)
    schedules = db.relationship('Schedule', backref='classroom', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'gradeLevel': self.grade_level,
            'section': self.section,
            'strand': self.strand or '',
            'roomNumber': self.room_number or '',
            'capacity': self.capacity or 0,
            'studentCount': len(self.students)
        }


class Teacher(db.Model):
    __tablename__ = 'teachers'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Hashed password
    name = db.Column(db.String(100), nullable=False)
    rank = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    subjects = db.Column(db.Text, nullable=False)  # Comma-separated

    # Relationships with cascade delete
    classroom_assignments = db.relationship('TeacherClassroom', backref='teacher', lazy=True, cascade='all, delete-orphan')
    schedules = db.relationship('Schedule', backref='teacher', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        # Get assigned classrooms
        classrooms = []
        grade_levels_set = set()  # Track unique grade levels
        for assignment in self.classroom_assignments:
            classroom = assignment.classroom
            classrooms.append({
                'id': str(classroom.id),
                'name': classroom.name,
                'gradeLevel': classroom.grade_level,
                'section': classroom.section,
                'strand': classroom.strand or '',
                'subject': assignment.subject
            })
            grade_levels_set.add(classroom.grade_level)

        # Also get grade levels from schedules
        for schedule in self.schedules:
            classroom = schedule.classroom
            if classroom:
                grade_levels_set.add(classroom.grade_level)

        return {
            'id': str(self.id),
            'teacherId': self.teacher_id,
            'username': self.username,
            'name': self.name,
            'rank': self.rank,
            'email': self.email,
            'contactNumber': self.contact_number,
            'subjects': self.subjects.split(',') if self.subjects else [],
            'gradeLevels': sorted(list(grade_levels_set)),  # Sorted list of unique grade levels
            'classrooms': classrooms,
            'schedules': [s.to_dict() for s in self.schedules]
        }


class TeacherClassroom(db.Model):
    """Many-to-many relationship between teachers and classrooms"""
    __tablename__ = 'teacher_classrooms'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)  # Is this the primary/adviser

    def to_dict(self):
        return {
            'id': str(self.id),
            'teacherId': str(self.teacher_id),
            'classroomId': str(self.classroom_id),
            'subject': self.subject,
            'isPrimary': self.is_primary
        }


class Schedule(db.Model):
    __tablename__ = 'schedules'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    days = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        classroom = Classroom.query.get(self.classroom_id)
        return {
            'id': str(self.id),
            'subject': self.subject,
            'gradeLevel': classroom.grade_level,
            'section': classroom.section,
            'strand': classroom.strand or '',
            'time': self.time,
            'room': classroom.room_number or '',
            'days': self.days,
            'classroomId': str(self.classroom_id),
            'classroomName': classroom.name
        }


class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    parent_guardian = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        classroom = self.classroom
        return {
            'id': str(self.id),
            'studentId': self.student_id,
            'name': self.name,
            'gradeLevel': classroom.grade_level,
            'strand': classroom.strand or '',
            'section': classroom.section,
            'classroomId': str(self.classroom_id),
            'classroomName': classroom.name,
            'parentGuardian': self.parent_guardian,
            'contactNumber': self.contact_number
        }


class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        classroom = Classroom.query.get(self.classroom_id)
        return {
            'id': str(self.id),
            'studentId': self.student_id,
            'studentName': self.student_name,
            'gradeLevel': classroom.grade_level if classroom else 'N/A',
            'section': classroom.section if classroom else 'N/A',
            'subject': self.subject,
            'teacherId': self.teacher_id,
            'date': self.date,
            'time': self.time,
            'status': self.status
        }


# Authentication Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user_type = data.get('userType')
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400

    if user_type == 'admin':
        admin = Admin.query.filter_by(username=username).first()
        if admin and verify_password(password, admin.password):
            return jsonify({
                'success': True,
                'userType': 'admin',
                'admin': admin.to_dict()
            }), 200
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    elif user_type == 'teacher':
        teacher = Teacher.query.filter_by(username=username).first()
        if teacher and verify_password(password, teacher.password):
            return jsonify({
                'success': True,
                'userType': 'teacher',
                'teacher': teacher.to_dict()
            }), 200
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    return jsonify({'success': False, 'message': 'Invalid user type'}), 400


# Admin Routes
@app.route('/api/admin/account', methods=['GET'])
def get_admin_account():
    admin = Admin.query.first()
    if admin:
        return jsonify(admin.to_dict()), 200
    return jsonify({'error': 'Admin account not found'}), 404


@app.route('/api/admin/account', methods=['PUT'])
def update_admin_account():
    admin = Admin.query.first()
    if not admin:
        return jsonify({'error': 'Admin account not found'}), 404

    data = request.json

    # Verify current password
    if not data.get('currentPassword'):
        return jsonify({'error': 'Current password is required'}), 400

    if not verify_password(data['currentPassword'], admin.password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    # Update username if provided
    if 'username' in data and data['username']:
        existing = Admin.query.filter(Admin.username == data['username'], Admin.id != admin.id).first()
        if existing:
            return jsonify({'error': 'Username already exists'}), 400
        admin.username = data['username']

    # Update password if provided
    if 'newPassword' in data and data['newPassword']:
        if len(data['newPassword']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        admin.password = hash_password(data['newPassword'])

    # Update security question if provided
    if 'securityQuestion' in data and 'securityAnswer' in data:
        if data['securityQuestion'] and data['securityAnswer']:
            admin.security_question = data['securityQuestion']
            admin.security_answer = hash_password(data['securityAnswer'].lower().strip())

    db.session.commit()
    return jsonify(admin.to_dict()), 200


@app.route('/api/admin/security-question', methods=['GET'])
def get_security_question():
    """Get the security question (without revealing the answer)"""
    admin = Admin.query.first()
    if not admin or not admin.security_question:
        return jsonify({'error': 'No security question set'}), 404

    return jsonify({
        'securityQuestion': admin.security_question
    }), 200


@app.route('/api/admin/reset-password', methods=['POST'])
def reset_admin_password():
    """Reset admin password using security question"""
    data = request.json
    admin = Admin.query.first()

    if not admin:
        return jsonify({'error': 'Admin account not found'}), 404

    if not admin.security_question or not admin.security_answer:
        return jsonify({'error': 'No security question configured. Contact system administrator.'}), 400

    # Verify security answer
    provided_answer = data.get('securityAnswer', '').lower().strip()
    if not verify_password(provided_answer, admin.security_answer):
        return jsonify({'error': 'Incorrect security answer'}), 401

    # Reset password
    new_password = data.get('newPassword')
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    admin.password = hash_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password reset successfully'}), 200


@app.route('/api/admin/register', methods=['POST'])
def register_admin():
    """Register first admin account - only works if no admin exists"""
    # Check if admin already exists
    existing_admin = Admin.query.first()
    if existing_admin:
        return jsonify({'error': 'Admin account already exists. Only one admin is allowed.'}), 403

    data = request.json

    # Validate required fields
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    # Validate password length
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Create admin account
    admin = Admin(
        username=data['username'],
        password=hash_password(data['password'])
    )

    # Set security question if provided
    if data.get('securityQuestion') and data.get('securityAnswer'):
        admin.security_question = data['securityQuestion']
        admin.security_answer = hash_password(data['securityAnswer'].lower().strip())

    db.session.add(admin)
    db.session.commit()

    return jsonify({
        'message': 'Admin account created successfully',
        'admin': admin.to_dict()
    }), 201


@app.route('/api/admin/exists', methods=['GET'])
def check_admin_exists():
    """Check if an admin account exists"""
    admin = Admin.query.first()
    return jsonify({'exists': admin is not None}), 200


# Classroom Routes
@app.route('/api/classrooms', methods=['GET'])
def get_classrooms():
    classrooms = Classroom.query.all()
    return jsonify([c.to_dict() for c in classrooms]), 200


@app.route('/api/classrooms', methods=['POST'])
def create_classroom():
    data = request.json

    # Validate required fields
    if not data.get('name') or not data.get('gradeLevel') or not data.get('section'):
        return jsonify({'error': 'Name, grade level, and section are required'}), 400

    classroom = Classroom(
        name=data['name'],
        grade_level=data['gradeLevel'],
        section=data['section'],
        strand=data.get('strand', ''),
        room_number=data.get('roomNumber', ''),
        capacity=data.get('capacity', 40)
    )

    db.session.add(classroom)
    db.session.commit()

    return jsonify(classroom.to_dict()), 201


@app.route('/api/classrooms/<int:id>', methods=['PUT'])
def update_classroom(id):
    classroom = Classroom.query.get(id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    data = request.json

    # Update fields
    if 'name' in data:
        classroom.name = data['name']
    if 'gradeLevel' in data:
        classroom.grade_level = data['gradeLevel']
    if 'section' in data:
        classroom.section = data['section']
    if 'strand' in data:
        classroom.strand = data['strand']
    if 'roomNumber' in data:
        classroom.room_number = data['roomNumber']
    if 'capacity' in data:
        classroom.capacity = data['capacity']

    db.session.commit()
    return jsonify(classroom.to_dict()), 200


@app.route('/api/classrooms/<int:id>', methods=['DELETE'])
def delete_classroom(id):
    classroom = Classroom.query.get(id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if classroom has students
    if len(classroom.students) > 0:
        return jsonify({'error': 'Cannot delete classroom with assigned students'}), 400

    db.session.delete(classroom)
    db.session.commit()
    return jsonify({'message': 'Classroom deleted successfully'}), 200


# Teacher Routes
@app.route('/api/teachers', methods=['GET'])
def get_teachers():
    teachers = Teacher.query.all()
    return jsonify([t.to_dict() for t in teachers]), 200


@app.route('/api/teachers/<teacher_id>', methods=['GET'])
def get_teacher(teacher_id):
    teacher = Teacher.query.filter_by(teacher_id=teacher_id).first()
    if teacher:
        return jsonify(teacher.to_dict()), 200
    return jsonify({'error': 'Teacher not found'}), 404


@app.route('/api/teachers', methods=['POST'])
def create_teacher():
    data = request.json

    # Validate required fields
    required_fields = ['teacherId', 'username', 'password', 'name', 'rank', 'email', 'contactNumber']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check for duplicates
    if Teacher.query.filter_by(teacher_id=data['teacherId']).first():
        return jsonify({'error': 'Teacher ID already exists'}), 400
    if Teacher.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    # Validate password length
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    teacher = Teacher(
        teacher_id=data['teacherId'],
        username=data['username'],
        password=hash_password(data['password']),
        name=data['name'],
        rank=data['rank'],
        email=data['email'],
        contact_number=data['contactNumber'],
        subjects=','.join(data.get('subjects', []))
    )

    db.session.add(teacher)
    db.session.flush()  # Get the teacher ID

    # Assign to classrooms if provided
    if data.get('classrooms'):
        for classroom_data in data['classrooms']:
            assignment = TeacherClassroom(
                teacher_id=teacher.id,
                classroom_id=classroom_data['classroomId'],
                subject=classroom_data['subject'],
                is_primary=classroom_data.get('isPrimary', False)
            )
            db.session.add(assignment)

    db.session.commit()
    return jsonify(teacher.to_dict()), 201


@app.route('/api/teachers/<int:id>', methods=['PUT'])
def update_teacher(id):
    teacher = Teacher.query.get(id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404

    data = request.json

    # Update basic info
    teacher.teacher_id = data.get('teacherId', teacher.teacher_id)
    teacher.name = data.get('name', teacher.name)
    teacher.rank = data.get('rank', teacher.rank)
    teacher.email = data.get('email', teacher.email)
    teacher.contact_number = data.get('contactNumber', teacher.contact_number)
    teacher.username = data.get('username', teacher.username)
    teacher.subjects = ','.join(data.get('subjects', []))

    # Update password if provided
    if data.get('password'):
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        teacher.password = hash_password(data['password'])

    # Update classroom assignments if provided
    if 'classrooms' in data:
        # Remove existing assignments
        TeacherClassroom.query.filter_by(teacher_id=id).delete()

        # Add new assignments
        for classroom_data in data['classrooms']:
            assignment = TeacherClassroom(
                teacher_id=id,
                classroom_id=classroom_data['classroomId'],
                subject=classroom_data['subject'],
                is_primary=classroom_data.get('isPrimary', False)
            )
            db.session.add(assignment)

    db.session.commit()
    return jsonify(teacher.to_dict()), 200


@app.route('/api/teachers/<int:id>', methods=['DELETE'])
def delete_teacher(id):
    teacher = Teacher.query.get(id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404

    db.session.delete(teacher)
    db.session.commit()
    return jsonify({'message': 'Teacher deleted successfully'}), 200


# Schedule Routes
@app.route('/api/teachers/<int:teacher_id>/schedules', methods=['POST'])
def add_schedule(teacher_id):
    """
    Add a schedule to a teacher and assign them to the classroom.
    This creates both:
    1. A schedule entry (when/what they teach)
    2. A teacher-classroom assignment (which classroom they teach)
    """
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404

    data = request.json

    if not data.get('classroomId'):
        return jsonify({'error': 'Classroom ID is required'}), 400

    classroom_id = int(data['classroomId'])

    # Verify classroom exists
    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    subject = data.get('subject', '').strip()
    if not subject:
        return jsonify({'error': 'Subject is required'}), 400

    # Create schedule
    schedule = Schedule(
        teacher_id=teacher_id,
        classroom_id=classroom_id,
        subject=subject,
        time=data.get('time', ''),
        days=data.get('days', '')
    )
    db.session.add(schedule)

    # Check if teacher-classroom relationship already exists
    existing_assignment = TeacherClassroom.query.filter_by(
        teacher_id=teacher_id,
        classroom_id=classroom_id,
        subject=subject
    ).first()

    if not existing_assignment:
        # Create teacher-classroom assignment
        teacher_classroom = TeacherClassroom(
            teacher_id=teacher_id,
            classroom_id=classroom_id,
            subject=subject,
            is_primary=False  # Can be updated later if needed
        )
        db.session.add(teacher_classroom)
        print(f"✓ Assigned teacher {teacher.name} to classroom {classroom.name} for {subject}")
    else:
        print(f"✓ Teacher {teacher.name} already assigned to classroom {classroom.name} for {subject}")

    db.session.commit()

    return jsonify({
        'message': 'Schedule added and teacher assigned to classroom',
        'schedule': schedule.to_dict(),
        'studentsInClassroom': len(classroom.students)
    }), 201


@app.route('/api/schedules/<int:id>', methods=['DELETE'])
def delete_schedule(id):
    schedule = Schedule.query.get(id)
    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404

    db.session.delete(schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule deleted successfully'}), 200


# Student Routes
@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200


@app.route('/api/students/classroom/<int:classroom_id>', methods=['GET'])
def get_students_by_classroom(classroom_id):
    students = Student.query.filter_by(classroom_id=classroom_id).all()
    return jsonify([s.to_dict() for s in students]), 200


@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.json

    # Validate required fields
    required_fields = ['studentId', 'name', 'classroomId', 'parentGuardian', 'contactNumber']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check for duplicate student ID
    if Student.query.filter_by(student_id=data['studentId']).first():
        return jsonify({'error': 'Student ID already exists'}), 400

    # Verify classroom exists
    classroom = Classroom.query.get(data['classroomId'])
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    student = Student(
        student_id=data['studentId'],
        name=data['name'],
        classroom_id=data['classroomId'],
        parent_guardian=data['parentGuardian'],
        contact_number=data['contactNumber']
    )

    db.session.add(student)
    db.session.commit()

    return jsonify(student.to_dict()), 201


@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    data = request.json
    student.student_id = data.get('studentId', student.student_id)
    student.name = data.get('name', student.name)
    student.classroom_id = data.get('classroomId', student.classroom_id)
    student.parent_guardian = data.get('parentGuardian', student.parent_guardian)
    student.contact_number = data.get('contactNumber', student.contact_number)

    db.session.commit()
    return jsonify(student.to_dict()), 200


@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Delete all attendance records for this student first (cascade delete)
    Attendance.query.filter_by(student_id=student.student_id).delete()

    # Then delete the student
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200


@app.route('/api/students/<int:id>/attendance', methods=['GET'])
def get_student_attendance(id):
    """Get detailed attendance records for a specific student"""
    student = Student.query.get(id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Get all attendance records for this student
    records = Attendance.query.filter_by(student_id=student.student_id).order_by(Attendance.date.desc(), Attendance.time.desc()).all()

    # Calculate statistics
    total_records = len(records)
    present_count = len([r for r in records if r.status in ['present', 'on-time']])
    late_count = len([r for r in records if r.status == 'late'])
    early_count = len([r for r in records if r.status == 'early'])
    absent_count = len([r for r in records if r.status == 'absent'])

    attendance_rate = round((present_count + late_count + early_count) / total_records * 100, 1) if total_records > 0 else 0

    return jsonify({
        'student': student.to_dict(),
        'statistics': {
            'totalRecords': total_records,
            'presentCount': present_count,
            'lateCount': late_count,
            'earlyCount': early_count,
            'absentCount': absent_count,
            'attendanceRate': attendance_rate
        },
        'records': [r.to_dict() for r in records]
    }), 200


@app.route('/api/teachers/<int:teacher_id>/students', methods=['GET'])
def get_teacher_students(teacher_id):
    """
    Get all unique students enrolled in this teacher's classrooms.
    This returns the actual student roster, not attendance records.
    """
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404

    # Get all unique classroom IDs from teacher's schedules
    classroom_ids = set()
    for schedule in teacher.schedules:
        classroom_ids.add(schedule.classroom_id)

    # Get all students from these classrooms
    students = []
    unique_student_ids = set()

    for classroom_id in classroom_ids:
        classroom_students = Student.query.filter_by(classroom_id=classroom_id).all()
        for student in classroom_students:
            # Ensure uniqueness (though a student should only be in one classroom)
            if student.student_id not in unique_student_ids:
                unique_student_ids.add(student.student_id)
                students.append(student.to_dict())

    return jsonify({
        'totalStudents': len(students),
        'students': students,
        'classroomCount': len(classroom_ids)
    }), 200


@app.route('/api/classrooms/<int:classroom_id>/students', methods=['GET'])
def get_classroom_students(classroom_id):
    """
    Get all students enrolled in a specific classroom.
    This is used to show complete student roster in attendance records.
    """
    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    students = Student.query.filter_by(classroom_id=classroom_id).all()

    return jsonify({
        'totalStudents': len(students),
        'students': [s.to_dict() for s in students],
        'classroom': {
            'id': str(classroom.id),
            'name': classroom.name,
            'gradeLevel': classroom.grade_level,
            'section': classroom.section,
            'strand': classroom.strand or ''
        }
    }), 200


# Attendance Routes
@app.route('/api/attendance', methods=['POST'])
def record_attendance():
    data = request.json

    # Validate student ID format (must be 12-digit LRN)
    student_id = data.get('studentId', '')
    if not student_id or not student_id.isdigit() or len(student_id) != 12:
        return jsonify({'error': 'Invalid student ID format. Must be a 12-digit LRN'}), 400

    # Verify student exists
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': 'Student not found in system'}), 404

    # Check if attendance already exists for this student, subject, and date
    existing_attendance = Attendance.query.filter_by(
        student_id=data['studentId'],
        subject=data['subject'],
        date=data['date']
    ).first()

    if existing_attendance:
        # Update existing record instead of creating duplicate
        existing_attendance.time = data['time']
        existing_attendance.status = data['status']
        db.session.commit()
        return jsonify(existing_attendance.to_dict()), 200

    # Create new attendance record
    attendance = Attendance(
        student_id=data['studentId'],
        student_name=data['studentName'],
        classroom_id=data['classroomId'],
        subject=data['subject'],
        teacher_id=data['teacherId'],
        date=data['date'],
        time=data['time'],
        status=data['status']
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify(attendance.to_dict()), 201


@app.route('/api/attendance/<int:id>', methods=['PUT'])
def update_attendance(id):
    """Update an existing attendance record (for fixing errors)"""
    attendance = Attendance.query.get(id)
    if not attendance:
        return jsonify({'error': 'Attendance record not found'}), 404

    data = request.json

    # Update allowed fields
    if 'status' in data:
        attendance.status = data['status']
    if 'time' in data:
        attendance.time = data['time']
    if 'date' in data:
        attendance.date = data['date']

    db.session.commit()
    return jsonify(attendance.to_dict()), 200


@app.route('/api/attendance/<int:id>', methods=['DELETE'])
def delete_attendance(id):
    """Delete an attendance record"""
    attendance = Attendance.query.get(id)
    if not attendance:
        return jsonify({'error': 'Attendance record not found'}), 404

    db.session.delete(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance record deleted successfully'}), 200


@app.route('/api/attendance/teacher/<teacher_id>', methods=['GET'])
def get_teacher_attendance(teacher_id):
    records = Attendance.query.filter_by(teacher_id=teacher_id).all()

    # Filter out records for students that no longer exist (orphaned records)
    valid_records = []
    for record in records:
        student = Student.query.filter_by(student_id=record.student_id).first()
        if student:  # Only include if student still exists
            valid_records.append(record.to_dict())

    return jsonify(valid_records), 200


@app.route('/api/attendance/classroom/<int:classroom_id>', methods=['GET'])
def get_classroom_attendance(classroom_id):
    teacher_id = request.args.get('teacherId')
    subject = request.args.get('subject')

    query = Attendance.query.filter_by(classroom_id=classroom_id)

    if teacher_id:
        query = query.filter_by(teacher_id=teacher_id)
    if subject:
        query = query.filter_by(subject=subject)

    records = query.all()
    return jsonify([r.to_dict() for r in records]), 200


@app.route('/api/attendance/class', methods=['GET'])
def get_class_attendance():
    """Get attendance records for a specific class by grade level, section, and subject"""
    teacher_id = request.args.get('teacherId')
    grade_level = request.args.get('gradeLevel')
    section = request.args.get('section')
    subject = request.args.get('subject')

    query = Attendance.query

    if teacher_id:
        query = query.filter_by(teacher_id=teacher_id)
    if grade_level:
        # Match grade level in attendance records
        query = query.filter(Attendance.classroom_id.in_(
            db.session.query(Classroom.id).filter_by(grade_level=grade_level)
        ))
    if section:
        # Match section in attendance records
        query = query.filter(Attendance.classroom_id.in_(
            db.session.query(Classroom.id).filter(Classroom.section.like(f'%{section}%'))
        ))
    if subject:
        query = query.filter_by(subject=subject)

    records = query.order_by(Attendance.date.desc(), Attendance.time.desc()).all()

    # Filter out records for students that no longer exist (orphaned records)
    valid_records = []
    for record in records:
        student = Student.query.filter_by(student_id=record.student_id).first()
        if student:  # Only include if student still exists
            valid_records.append(record.to_dict())

    return jsonify(valid_records), 200


@app.route('/api/attendance/mark-absences', methods=['POST'])
def mark_absences():
    """
    Mark all students who didn't scan as absent for a specific class/date.
    This allows teachers to finalize attendance after class ends.
    """
    data = request.json

    classroom_id = data.get('classroomId')
    subject = data.get('subject')
    teacher_id = data.get('teacherId')
    date = data.get('date')  # e.g., "2026-04-25"
    time = data.get('time', '00:00 AM')  # Default time for absences

    if not all([classroom_id, subject, teacher_id, date]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Get all students in this classroom
    students = Student.query.filter_by(classroom_id=classroom_id).all()

    # Get all students who already have attendance for this subject and date
    existing_attendance = Attendance.query.filter_by(
        classroom_id=classroom_id,
        subject=subject,
        date=date
    ).all()

    scanned_student_ids = set(record.student_id for record in existing_attendance)

    # Find students who didn't scan
    absent_students = [s for s in students if s.student_id not in scanned_student_ids]

    # Mark them as absent
    marked_count = 0
    for student in absent_students:
        absence = Attendance(
            student_id=student.student_id,
            student_name=student.name,
            classroom_id=classroom_id,
            subject=subject,
            teacher_id=teacher_id,
            date=date,
            time=time,
            status='absent'
        )
        db.session.add(absence)
        marked_count += 1

    db.session.commit()

    return jsonify({
        'message': f'Marked {marked_count} students as absent',
        'markedCount': marked_count,
        'totalStudents': len(students),
        'scannedCount': len(scanned_student_ids)
    }), 200


# Validate QR Code
@app.route('/api/validate-qr', methods=['POST'])
def validate_qr():
    """Validate if a QR code/Student ID is valid (LRN format: 12 digits)"""
    data = request.json
    qr_code = data.get('qrCode', '').strip()

    # Check if empty
    if not qr_code:
        return jsonify({
            'valid': False,
            'error': 'Please scan or enter a Student ID'
        }), 200

    # Check format - Should be 12-digit LRN
    if not qr_code.isdigit():
        return jsonify({
            'valid': False,
            'error': 'Invalid Student ID format. Must be 12-digit LRN (numbers only)'
        }), 200

    if len(qr_code) != 12:
        return jsonify({
            'valid': False,
            'error': f'Invalid Student ID length. Must be 12 digits (found {len(qr_code)} digits)'
        }), 200

    # Check if student exists in database
    student = Student.query.filter_by(student_id=qr_code).first()
    if not student:
        return jsonify({
            'valid': False,
            'error': f'Student ID {qr_code} not found in system. Please check the ID or contact admin.'
        }), 200

    # Valid student found
    return jsonify({
        'valid': True,
        'student': student.to_dict()
    }), 200


# Initialize database
@app.route('/api/init-db', methods=['POST'])
def init_database():
    try:
        # Create all tables
        db.create_all()

        # Check if admin already exists
        existing_admin = Admin.query.first()
        if not existing_admin:
            # Create default admin
            admin = Admin(
                username='admin',
                password=hash_password('admin123')
            )
            db.session.add(admin)
            print("✓ Created default admin account (username: admin, password: admin123)")
        else:
            print(f"✓ Admin account already exists (username: {existing_admin.username})")

        # Check if classrooms already exist
        if Classroom.query.count() == 0:
            # Create ALL classrooms for the school
            # Junior High (Grades 7-10): 4 sections each
            # Senior High (Grades 11-12): 3 strands with 2 sections each
            room_counter = 101

            # Junior High School - Grades 7-10, 4 sections each
            for grade in [7, 8, 9, 10]:
                for section in ['A', 'B', 'C', 'D']:
                    classroom = Classroom(
                        name=f'Grade {grade} Section {section}',
                        grade_level=f'Grade {grade}',
                        section=f'Section {section}',
                        strand='',
                        room_number=f'Room {room_counter}',
                        capacity=40
                    )
                    db.session.add(classroom)
                    room_counter += 1

            # Senior High School - Grades 11 & 12, 3 strands with 2 sections each
            strands = ['HUMSS', 'ABM', 'GAS']
            for grade in [11, 12]:
                for strand in strands:
                    for section in ['A', 'B']:
                        classroom = Classroom(
                            name=f'Grade {grade} {strand}-{section}',
                            grade_level=f'Grade {grade}',
                            section=f'{strand}-{section}',
                            strand=strand,
                            room_number=f'Room {room_counter}',
                            capacity=40
                        )
                        db.session.add(classroom)
                        room_counter += 1

            print(f"✓ Created 28 classrooms (16 Junior High + 12 Senior High)")

        db.session.commit()

        return jsonify({'message': 'Database initialized successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Debug endpoint - Check admin account (REMOVE IN PRODUCTION!)
@app.route('/api/debug/admin', methods=['GET'])
def debug_admin():
    """Debug endpoint to check admin account status"""
    try:
        admin = Admin.query.first()
        if admin:
            return jsonify({
                'exists': True,
                'username': admin.username,
                'password_hash_length': len(admin.password),
                'password_starts_with': admin.password[:10] if admin.password else None,
                'total_admins': Admin.query.count()
            }), 200
        else:
            return jsonify({
                'exists': False,
                'message': 'No admin account found. Run /api/init-db to create one.'
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Reset admin password endpoint (for recovery)
@app.route('/api/reset-admin', methods=['POST'])
def reset_admin():
    """Reset admin password to default (admin123)"""
    try:
        admin = Admin.query.filter_by(username='admin').first()
        if admin:
            admin.password = hash_password('admin123')
            db.session.commit()
            return jsonify({'message': 'Admin password reset to admin123'}), 200
        else:
            # Create admin if doesn't exist
            admin = Admin(
                username='admin',
                password=hash_password('admin123')
            )
            db.session.add(admin)
            db.session.commit()
            return jsonify({'message': 'Admin account created with password admin123'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment platforms"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        db.session.commit()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def api_health_check():
    """API health check endpoint"""
    return jsonify({'status': 'ok', 'version': '1.0'}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
