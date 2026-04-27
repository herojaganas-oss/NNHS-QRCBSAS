"""
View all classrooms in the database
Quick utility to see what classrooms exist

Usage: python view_classrooms.py
"""

import requests
import sys

API_URL = 'http://localhost:5000/api/classrooms'

def view_classrooms():
    print("=" * 80)
    print("CLASSROOMS IN NNHS ATTENDANCE SYSTEM")
    print("=" * 80)
    print()
    
    try:
        response = requests.get(API_URL)
        
        if response.status_code == 200:
            classrooms = response.json()
            
            if not classrooms:
                print("No classrooms found in the database.")
                print()
                print("To add a classroom, run: python add_classroom.py")
                print()
                return
            
            # Display classrooms in a table format
            print(f"{'ID':<5} {'Name':<30} {'Grade':<12} {'Section':<15} {'Strand':<8} {'Room':<12} {'Students':<10}")
            print("-" * 80)
            
            for classroom in classrooms:
                c_id = classroom.get('id', '')
                name = classroom.get('name', '')[:29]
                grade = classroom.get('gradeLevel', '')
                section = classroom.get('section', '')
                strand = classroom.get('strand', '-')
                room = classroom.get('roomNumber', '')
                students = f"{classroom.get('studentCount', 0)}/{classroom.get('capacity', 0)}"
                
                print(f"{c_id:<5} {name:<30} {grade:<12} {section:<15} {strand:<8} {room:<12} {students:<10}")
            
            print()
            print(f"Total classrooms: {len(classrooms)}")
            print()
            print("To add a new classroom, run: python add_classroom.py")
            print()
            
        else:
            print("✗ Error fetching classrooms")
            print(f"  Status: {response.status_code}")
            print()
            
    except requests.exceptions.ConnectionError:
        print("✗ Error: Cannot connect to backend server!")
        print()
        print("Make sure the backend is running:")
        print("  1. cd backend")
        print("  2. python app.py")
        print()
    except Exception as e:
        print(f"✗ Error: {e}")
        print()

if __name__ == '__main__':
    try:
        view_classrooms()
    except KeyboardInterrupt:
        print("\n\nCancelled by user.")
        sys.exit(0)
