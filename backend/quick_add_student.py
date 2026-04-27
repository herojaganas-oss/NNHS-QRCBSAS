"""
Quick script to add a student to a classroom
Useful for testing and quick data entry

Usage: python quick_add_student.py
"""

import requests
import sys

API_URL_CLASSROOMS = 'http://localhost:5000/api/classrooms'
API_URL_STUDENTS = 'http://localhost:5000/api/students'

def get_classrooms():
    """Fetch all classrooms from the API"""
    try:
        response = requests.get(API_URL_CLASSROOMS)
        if response.status_code == 200:
            return response.json()
        return []
    except:
        return []

def add_student():
    print("=" * 60)
    print("ADD NEW STUDENT TO NNHS ATTENDANCE SYSTEM")
    print("=" * 60)
    print()
    
    # Fetch classrooms
    print("Fetching classrooms...")
    classrooms = get_classrooms()
    
    if not classrooms:
        print("✗ No classrooms found!")
        print("  Add classrooms first using: python add_classroom.py")
        print()
        return
    
    print()
    print("Available Classrooms:")
    print("-" * 60)
    for i, classroom in enumerate(classrooms, 1):
        print(f"  {i}. {classroom.get('name')} (Room: {classroom.get('roomNumber', 'N/A')})")
    print()
    
    # Get student details
    student_id = input("Enter Student ID (12-digit LRN, e.g., 123456789012): ").strip()
    
    # Validate LRN format
    if not student_id.isdigit() or len(student_id) != 12:
        print("✗ Invalid Student ID! Must be exactly 12 digits.")
        print()
        return
    
    name = input("Enter Student Name: ").strip()
    
    # Select classroom
    while True:
        try:
            classroom_choice = int(input(f"Select Classroom (1-{len(classrooms)}): ").strip())
            if 1 <= classroom_choice <= len(classrooms):
                selected_classroom = classrooms[classroom_choice - 1]
                break
            else:
                print(f"Please enter a number between 1 and {len(classrooms)}")
        except ValueError:
            print("Please enter a valid number")
    
    parent_guardian = input("Enter Parent/Guardian Name: ").strip()
    contact_number = input("Enter Contact Number: ").strip()
    
    # Confirm
    print()
    print("=" * 60)
    print("STUDENT TO BE CREATED:")
    print("-" * 60)
    print(f"  Student ID:       {student_id}")
    print(f"  Name:             {name}")
    print(f"  Classroom:        {selected_classroom.get('name')}")
    print(f"  Grade:            {selected_classroom.get('gradeLevel')}")
    print(f"  Section:          {selected_classroom.get('section')}")
    if selected_classroom.get('strand'):
        print(f"  Strand:           {selected_classroom.get('strand')}")
    print(f"  Parent/Guardian:  {parent_guardian}")
    print(f"  Contact:          {contact_number}")
    print("=" * 60)
    print()
    
    confirm = input("Create this student? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("Cancelled.")
        return
    
    # Prepare data
    data = {
        'studentId': student_id,
        'name': name,
        'classroomId': selected_classroom.get('id'),
        'parentGuardian': parent_guardian,
        'contactNumber': contact_number
    }
    
    # Send request
    try:
        print("\nCreating student...")
        response = requests.post(API_URL_STUDENTS, json=data)
        
        if response.status_code == 201:
            result = response.json()
            print("✓ Student created successfully!")
            print()
            print("Created Student:")
            print(f"  ID:               {result.get('id')}")
            print(f"  Student ID:       {result.get('studentId')}")
            print(f"  Name:             {result.get('name')}")
            print(f"  Classroom:        {result.get('classroomName')}")
            print(f"  Grade Level:      {result.get('gradeLevel')}")
            print(f"  Section:          {result.get('section')}")
            if result.get('strand'):
                print(f"  Strand:           {result.get('strand')}")
            print()
        else:
            error_data = response.json()
            print(f"✗ Error: {error_data.get('error', 'Unknown error')}")
            print()
            
    except requests.exceptions.ConnectionError:
        print("✗ Error: Cannot connect to backend server!")
        print("  Make sure the backend is running:")
        print("  1. cd backend")
        print("  2. python app.py")
        print()
    except Exception as e:
        print(f"✗ Error: {e}")
        print()

if __name__ == '__main__':
    try:
        add_student()
    except KeyboardInterrupt:
        print("\n\nCancelled by user.")
        sys.exit(0)
