"""
Populate ALL Classrooms for NNHS Attendance System
Run this script to add all classrooms to an existing database.

Usage: python populate_classrooms.py
"""

import pymysql
from getpass import getpass

# Database configuration
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''  # Default for XAMPP/WAMP
DB_NAME = 'nnhs_attendance'

print("=" * 60)
print("NNHS ATTENDANCE SYSTEM - POPULATE ALL CLASSROOMS")
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
    # Connect to MySQL server
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=db_name,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    cursor = connection.cursor()

    print(f"✓ Connected to database '{db_name}'")
    print()

    # Check existing classrooms
    cursor.execute("SELECT COUNT(*) as count FROM `classrooms`")
    existing_count = cursor.fetchone()['count']

    if existing_count > 0:
        print(f"Warning: {existing_count} classrooms already exist in the database.")
        confirm = input("Do you want to DELETE all existing classrooms and recreate them? (yes/no): ").strip().lower()

        if confirm == 'yes':
            cursor.execute("DELETE FROM `classrooms`")
            print(f"✓ Deleted {existing_count} existing classrooms")
        else:
            print("Operation cancelled. No changes were made.")
            connection.close()
            exit(0)

    print("Creating all classrooms...")
    print()

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

    connection.commit()

    print("=" * 60)
    print("CLASSROOMS CREATED SUCCESSFULLY!")
    print("=" * 60)
    print()
    print(f"✓ Total Classrooms Created: {len(classrooms_data)}")
    print()
    print("Junior High School (Grades 7-10):")
    print("  - Grade 7: Sections A, B, C, D (4 classrooms)")
    print("  - Grade 8: Sections A, B, C, D (4 classrooms)")
    print("  - Grade 9: Sections A, B, C, D (4 classrooms)")
    print("  - Grade 10: Sections A, B, C, D (4 classrooms)")
    print("  Subtotal: 16 classrooms")
    print()
    print("Senior High School (Grades 11-12):")
    for strand in strands:
        print(f"  - {strand}: Sections A, B for Grades 11 & 12 (4 classrooms)")
    print(f"  Subtotal: {len(classrooms_data) - 16} classrooms")
    print()
    print("All classrooms are now available for student and teacher assignment!")
    print()

except Exception as e:
    print(f"✗ Error: {e}")
    print()
    print("Please check your MySQL credentials and try again.")

finally:
    if 'connection' in locals():
        connection.close()
