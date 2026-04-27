"""
Simple script to add a classroom to the database
Run this script to add classrooms without using the API directly

Usage: python add_classroom.py
"""

import requests
import sys

API_URL = 'http://localhost:5000/api/classrooms'

def add_classroom():
    print("=" * 60)
    print("ADD NEW CLASSROOM TO NNHS ATTENDANCE SYSTEM")
    print("=" * 60)
    print()
    
    # Available options
    print("Available Grade Levels:")
    print("  - Grade 7, Grade 8, Grade 9, Grade 10 (Junior High)")
    print("  - Grade 11, Grade 12 (Senior High)")
    print()
    
    grade_level = input("Enter Grade Level (e.g., Grade 10): ").strip()
    section = input("Enter Section (e.g., A, B, C, or HUMSS-A): ").strip()
    
    # For senior high
    strand = ''
    if grade_level in ['Grade 11', 'Grade 12']:
        print("\nAvailable Strands: HUMSS, GAS, TVL, ABM, STEM")
        strand = input("Enter Strand (press Enter to skip): ").strip()
    
    room_number = input("Enter Room Number (e.g., Room 105): ").strip()
    capacity = input("Enter Capacity (default 40): ").strip()
    
    # Build classroom name
    if strand:
        name = f"{grade_level} {strand}-{section}"
    else:
        name = f"{grade_level} Section {section}"
    
    # Confirm
    print()
    print("=" * 60)
    print("CLASSROOM TO BE CREATED:")
    print("-" * 60)
    print(f"  Name:         {name}")
    print(f"  Grade Level:  {grade_level}")
    print(f"  Section:      {section}")
    if strand:
        print(f"  Strand:       {strand}")
    print(f"  Room:         {room_number}")
    print(f"  Capacity:     {capacity or '40'}")
    print("=" * 60)
    print()
    
    confirm = input("Create this classroom? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("Cancelled.")
        return
    
    # Prepare data
    data = {
        'name': name,
        'gradeLevel': grade_level,
        'section': section,
        'strand': strand,
        'roomNumber': room_number,
        'capacity': int(capacity) if capacity else 40
    }
    
    # Send request
    try:
        print("\nCreating classroom...")
        response = requests.post(API_URL, json=data)
        
        if response.status_code == 201:
            result = response.json()
            print("✓ Classroom created successfully!")
            print()
            print("Created Classroom:")
            print(f"  ID:           {result.get('id')}")
            print(f"  Name:         {result.get('name')}")
            print(f"  Grade Level:  {result.get('gradeLevel')}")
            print(f"  Section:      {result.get('section')}")
            if result.get('strand'):
                print(f"  Strand:       {result.get('strand')}")
            print(f"  Room:         {result.get('roomNumber')}")
            print(f"  Capacity:     {result.get('capacity')}")
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
        add_classroom()
    except KeyboardInterrupt:
        print("\n\nCancelled by user.")
        sys.exit(0)
