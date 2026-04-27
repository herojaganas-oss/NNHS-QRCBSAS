// Teacher and Student Data Structure

export interface ClassSchedule {
  id: string;
  subject: string;
  gradeLevel: string;
  section: string;
  time: string;
  room: string;
  days: string;
  classroomId?: string;
  classroomName?: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  username: string;
  password: string;
  name: string;
  rank: string;
  email: string;
  contactNumber: string;
  schedules: ClassSchedule[];
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  gradeLevel: string;
  strand: string;
  section: string;
  parentGuardian: string;
  contactNumber: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  subject: string;
  teacherId: string;
  date: string;
  time: string;
  status: 'present' | 'absent';
}

// Teachers Database
export const teachers: Teacher[] = [
  {
    id: '1',
    teacherId: 'T-2024-001',
    username: 'etorres',
    password: 'teacher123',
    name: 'Dr. Elizabeth Torres',
    rank: 'Master Teacher IV',
    email: 'e.torres@nahawan.edu.ph',
    contactNumber: '09111222333',
    schedules: [
      {
        id: 's1',
        subject: 'Mathematics',
        gradeLevel: 'Grade 11',
        section: 'HUMSS-A',
        time: '8:00 AM - 9:30 AM',
        room: 'Room 201',
        days: 'Mon, Wed, Fri'
      },
      {
        id: 's2',
        subject: 'Statistics and Probability',
        gradeLevel: 'Grade 11',
        section: 'HUMSS-B',
        time: '10:00 AM - 11:30 AM',
        room: 'Room 201',
        days: 'Mon, Wed, Fri'
      },
      {
        id: 's3',
        subject: 'Mathematics',
        gradeLevel: 'Grade 12',
        section: 'GAS-A',
        time: '1:00 PM - 2:30 PM',
        room: 'Room 201',
        days: 'Tue, Thu'
      }
    ]
  },
  {
    id: '2',
    teacherId: 'T-2024-002',
    username: 'rmendoza',
    password: 'teacher123',
    name: 'Robert Mendoza',
    rank: 'Teacher III',
    email: 'r.mendoza@nahawan.edu.ph',
    contactNumber: '09222333444',
    schedules: [
      {
        id: 's4',
        subject: 'English',
        gradeLevel: 'Grade 7',
        section: 'Section A',
        time: '8:00 AM - 9:00 AM',
        room: 'Room 105',
        days: 'Mon-Fri'
      },
      {
        id: 's5',
        subject: 'English',
        gradeLevel: 'Grade 7',
        section: 'Section B',
        time: '9:00 AM - 10:00 AM',
        room: 'Room 105',
        days: 'Mon-Fri'
      },
      {
        id: 's6',
        subject: 'Filipino',
        gradeLevel: 'Grade 8',
        section: 'Section A',
        time: '1:00 PM - 2:00 PM',
        room: 'Room 105',
        days: 'Mon-Fri'
      }
    ]
  },
  {
    id: '3',
    teacherId: 'T-2024-003',
    username: 'masantos',
    password: 'teacher123',
    name: 'Maria Angela Santos',
    rank: 'Master Teacher I',
    email: 'm.santos@nahawan.edu.ph',
    contactNumber: '09333444555',
    schedules: [
      {
        id: 's7',
        subject: 'Science',
        gradeLevel: 'Grade 9',
        section: 'Section C',
        time: '8:00 AM - 9:30 AM',
        room: 'Science Lab 1',
        days: 'Mon-Fri'
      },
      {
        id: 's8',
        subject: 'Biology',
        gradeLevel: 'Grade 10',
        section: 'Section A',
        time: '10:00 AM - 11:30 AM',
        room: 'Science Lab 1',
        days: 'Mon-Fri'
      },
      {
        id: 's9',
        subject: 'Earth Science',
        gradeLevel: 'Grade 11',
        section: 'TVL-A',
        time: '1:00 PM - 2:30 PM',
        room: 'Science Lab 1',
        days: 'Tue, Thu'
      }
    ]
  },
  {
    id: '4',
    teacherId: 'T-2024-004',
    username: 'jcruz',
    password: 'teacher123',
    name: 'Jennifer Cruz',
    rank: 'Teacher II',
    email: 'j.cruz@nahawan.edu.ph',
    contactNumber: '09444555666',
    schedules: [
      {
        id: 's10',
        subject: 'Araling Panlipunan',
        gradeLevel: 'Grade 8',
        section: 'Section B',
        time: '8:00 AM - 9:00 AM',
        room: 'Room 108',
        days: 'Mon-Fri'
      },
      {
        id: 's11',
        subject: 'History',
        gradeLevel: 'Grade 9',
        section: 'Section A',
        time: '10:00 AM - 11:00 AM',
        room: 'Room 108',
        days: 'Mon-Fri'
      },
      {
        id: 's12',
        subject: 'Philippine Politics and Governance',
        gradeLevel: 'Grade 12',
        section: 'HUMSS-A',
        time: '1:00 PM - 2:30 PM',
        room: 'Room 108',
        days: 'Mon, Wed, Fri'
      }
    ]
  }
];

// Students Database
export const students: Student[] = [
  // Grade 7 Section A
  { id: '1', studentId: 'NNHS-2024-001', name: 'Maria Santos', gradeLevel: 'Grade 7', strand: '', section: 'Section A', parentGuardian: 'Juan Santos', contactNumber: '09123456789' },
  { id: '2', studentId: 'NNHS-2024-002', name: 'Pedro Garcia', gradeLevel: 'Grade 7', strand: '', section: 'Section A', parentGuardian: 'Rosa Garcia', contactNumber: '09123456790' },
  { id: '3', studentId: 'NNHS-2024-003', name: 'Ana Reyes', gradeLevel: 'Grade 7', strand: '', section: 'Section A', parentGuardian: 'Jose Reyes', contactNumber: '09123456791' },
  
  // Grade 7 Section B
  { id: '4', studentId: 'NNHS-2024-004', name: 'Miguel Torres', gradeLevel: 'Grade 7', strand: '', section: 'Section B', parentGuardian: 'Linda Torres', contactNumber: '09123456792' },
  { id: '5', studentId: 'NNHS-2024-005', name: 'Sofia Ramos', gradeLevel: 'Grade 7', strand: '', section: 'Section B', parentGuardian: 'Carlos Ramos', contactNumber: '09123456793' },
  
  // Grade 8 Section A
  { id: '6', studentId: 'NNHS-2024-006', name: 'Luis Cruz', gradeLevel: 'Grade 8', strand: '', section: 'Section A', parentGuardian: 'Maria Cruz', contactNumber: '09123456794' },
  { id: '7', studentId: 'NNHS-2024-007', name: 'Carmen Flores', gradeLevel: 'Grade 8', strand: '', section: 'Section A', parentGuardian: 'Roberto Flores', contactNumber: '09123456795' },
  
  // Grade 8 Section B
  { id: '8', studentId: 'NNHS-2024-008', name: 'Diego Mendoza', gradeLevel: 'Grade 8', strand: '', section: 'Section B', parentGuardian: 'Elena Mendoza', contactNumber: '09123456796' },
  { id: '9', studentId: 'NNHS-2024-009', name: 'Isabel Santos', gradeLevel: 'Grade 8', strand: '', section: 'Section B', parentGuardian: 'Francisco Santos', contactNumber: '09123456797' },
  
  // Grade 9 Section A
  { id: '10', studentId: 'NNHS-2024-010', name: 'Rafael Diaz', gradeLevel: 'Grade 9', strand: '', section: 'Section A', parentGuardian: 'Gloria Diaz', contactNumber: '09123456798' },
  { id: '11', studentId: 'NNHS-2024-011', name: 'Lucia Morales', gradeLevel: 'Grade 9', strand: '', section: 'Section A', parentGuardian: 'Antonio Morales', contactNumber: '09123456799' },
  
  // Grade 9 Section C
  { id: '12', studentId: 'NNHS-2024-012', name: 'Carlos Garcia', gradeLevel: 'Grade 9', strand: '', section: 'Section C', parentGuardian: 'Linda Garcia', contactNumber: '09456789012' },
  { id: '13', studentId: 'NNHS-2024-013', name: 'Elena Ramirez', gradeLevel: 'Grade 9', strand: '', section: 'Section C', parentGuardian: 'Jorge Ramirez', contactNumber: '09123456800' },
  
  // Grade 10 Section A
  { id: '14', studentId: 'NNHS-2024-014', name: 'Gabriel Hernandez', gradeLevel: 'Grade 10', strand: '', section: 'Section A', parentGuardian: 'Patricia Hernandez', contactNumber: '09123456801' },
  { id: '15', studentId: 'NNHS-2024-015', name: 'Valentina Lopez', gradeLevel: 'Grade 10', strand: '', section: 'Section A', parentGuardian: 'Manuel Lopez', contactNumber: '09123456802' },
  
  // Grade 11 HUMSS-A
  { id: '16', studentId: 'NNHS-2024-016', name: 'Jose Reyes', gradeLevel: 'Grade 11', strand: 'HUMSS', section: 'HUMSS-A', parentGuardian: 'Rosa Reyes', contactNumber: '09234567890' },
  { id: '17', studentId: 'NNHS-2024-017', name: 'Andrea Martinez', gradeLevel: 'Grade 11', strand: 'HUMSS', section: 'HUMSS-A', parentGuardian: 'Ricardo Martinez', contactNumber: '09123456803' },
  
  // Grade 11 HUMSS-B
  { id: '18', studentId: 'NNHS-2024-018', name: 'Sebastian Castro', gradeLevel: 'Grade 11', strand: 'HUMSS', section: 'HUMSS-B', parentGuardian: 'Cristina Castro', contactNumber: '09123456804' },
  { id: '19', studentId: 'NNHS-2024-019', name: 'Camila Gutierrez', gradeLevel: 'Grade 11', strand: 'HUMSS', section: 'HUMSS-B', parentGuardian: 'Fernando Gutierrez', contactNumber: '09123456805' },
  
  // Grade 11 TVL-A
  { id: '20', studentId: 'NNHS-2024-020', name: 'Mateo Rivera', gradeLevel: 'Grade 11', strand: 'TVL', section: 'TVL-A', parentGuardian: 'Sandra Rivera', contactNumber: '09123456806' },
  { id: '21', studentId: 'NNHS-2024-021', name: 'Victoria Moreno', gradeLevel: 'Grade 11', strand: 'TVL', section: 'TVL-A', parentGuardian: 'Alejandro Moreno', contactNumber: '09123456807' },
  
  // Grade 12 HUMSS-A
  { id: '22', studentId: 'NNHS-2024-022', name: 'Daniel Vargas', gradeLevel: 'Grade 12', strand: 'HUMSS', section: 'HUMSS-A', parentGuardian: 'Monica Vargas', contactNumber: '09123456808' },
  { id: '23', studentId: 'NNHS-2024-023', name: 'Natalia Ortiz', gradeLevel: 'Grade 12', strand: 'HUMSS', section: 'HUMSS-A', parentGuardian: 'Felipe Ortiz', contactNumber: '09123456809' },
  
  // Grade 12 GAS-A
  { id: '24', studentId: 'NNHS-2024-024', name: 'Ana Cruz', gradeLevel: 'Grade 12', strand: 'GAS', section: 'GAS-A', parentGuardian: 'Pedro Cruz', contactNumber: '09345678901' },
  { id: '25', studentId: 'NNHS-2024-025', name: 'Leonardo Silva', gradeLevel: 'Grade 12', strand: 'GAS', section: 'GAS-A', parentGuardian: 'Teresa Silva', contactNumber: '09123456810' },
];

// Generate mock attendance records
export const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = '2026-03-18';
  const yesterday = '2026-03-17';
  
  // For each teacher, generate attendance for their students
  teachers.forEach(teacher => {
    teacher.schedules.forEach(schedule => {
      // Get students for this class
      const classStudents = students.filter(
        s => s.gradeLevel === schedule.gradeLevel && s.section === schedule.section
      );
      
      classStudents.forEach((student, index) => {
        // Today's attendance - 85% present rate
        records.push({
          id: `att-${teacher.id}-${schedule.id}-${student.id}-today`,
          studentId: student.studentId,
          studentName: student.name,
          gradeLevel: student.gradeLevel,
          section: student.section,
          subject: schedule.subject,
          teacherId: teacher.teacherId,
          date: today,
          time: Math.random() > 0.15 ? '8:15 AM' : '-',
          status: Math.random() > 0.15 ? 'present' : 'absent'
        });
        
        // Yesterday's attendance
        records.push({
          id: `att-${teacher.id}-${schedule.id}-${student.id}-yesterday`,
          studentId: student.studentId,
          studentName: student.name,
          gradeLevel: student.gradeLevel,
          section: student.section,
          subject: schedule.subject,
          teacherId: teacher.teacherId,
          date: yesterday,
          time: Math.random() > 0.12 ? '8:20 AM' : '-',
          status: Math.random() > 0.12 ? 'present' : 'absent'
        });
      });
    });
  });
  
  return records;
};

// Get teacher by username
export const getTeacherByUsername = (username: string): Teacher | undefined => {
  return teachers.find(t => t.username === username);
};

// Get students for a specific class
export const getStudentsForClass = (gradeLevel: string, section: string): Student[] => {
  return students.filter(s => s.gradeLevel === gradeLevel && s.section === section);
};

// Get attendance for teacher's classes
export const getAttendanceForTeacher = (teacherId: string): AttendanceRecord[] => {
  const allRecords = generateAttendanceRecords();
  return allRecords.filter(r => r.teacherId === teacherId);
};

// Get attendance for specific class
export const getAttendanceForClass = (teacherId: string, gradeLevel: string, section: string, subject: string): AttendanceRecord[] => {
  const allRecords = generateAttendanceRecords();
  return allRecords.filter(
    r => r.teacherId === teacherId && 
         r.gradeLevel === gradeLevel && 
         r.section === section &&
         r.subject === subject
  );
};
