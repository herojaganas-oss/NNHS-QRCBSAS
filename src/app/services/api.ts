// API service for backend communication
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If running on Vercel or production environment
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://web-production-fc7223.up.railway.app/api';
  }
  
  // Development or if VITE_API_URL is set
  return envUrl || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Authentication
export const login = async (userType: 'admin' | 'teacher', username: string, password: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType, username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Login failed' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please ensure the backend server is running.' };
  }
};

// Admin Account Management
export const getAdminAccount = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/account`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch admin account' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const updateAdminAccount = async (
  currentPassword: string,
  username?: string,
  newPassword?: string,
  securityQuestion?: string,
  securityAnswer?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/account`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        username,
        newPassword,
        securityQuestion,
        securityAnswer
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update admin account' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const getSecurityQuestion = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/security-question`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get security question' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const resetAdminPassword = async (securityAnswer: string, newPassword: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ securityAnswer, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to reset password' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const registerAdmin = async (
  username: string,
  password: string,
  securityQuestion?: string,
  securityAnswer?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        securityQuestion,
        securityAnswer
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to register admin' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const checkAdminExists = async (): Promise<ApiResponse<{ exists: boolean }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/exists`);
    const data = await response.json();

    if (!response.ok) {
      return { error: 'Failed to check admin status' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Teachers
export const getTeachers = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch teachers' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const createTeacher = async (teacherData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create teacher' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const updateTeacher = async (id: number, teacherData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update teacher' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const deleteTeacher = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete teacher' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Schedules
export const addSchedule = async (teacherId: number, scheduleData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to add schedule' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const deleteSchedule = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete schedule' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Students
export const getStudents = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch students' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const getStudentsByClass = async (gradeLevel: string, section: string): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/class/${encodeURIComponent(gradeLevel)}/${encodeURIComponent(section)}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch students' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const createStudent = async (studentData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create student' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const updateStudent = async (id: number, studentData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update student' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const deleteStudent = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete student' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Attendance
export const recordAttendance = async (attendanceData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendanceData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to record attendance' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const getTeacherAttendance = async (teacherId: string): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/teacher/${teacherId}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch attendance' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const getClassAttendance = async (teacherId: string, gradeLevel: string, section: string, subject: string): Promise<ApiResponse<any[]>> => {
  try {
    const params = new URLSearchParams({
      teacherId,
      gradeLevel,
      section,
      subject
    });

    const response = await fetch(`${API_BASE_URL}/attendance/class?${params}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch class attendance' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const getAttendanceByDate = async (date: string): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/date/${date}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch attendance' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Initialize database with sample data
export const initializeDatabase = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/init-db`, {
      method: 'POST'
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to initialize database' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Classrooms
export const getClassrooms = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/classrooms`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch classrooms' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const createClassroom = async (classroomData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/classrooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classroomData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create classroom' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const updateClassroom = async (id: number, classroomData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/classrooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classroomData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update classroom' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

export const deleteClassroom = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/classrooms/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete classroom' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Validate QR Code
export const validateQRCode = async (qrCode: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCode })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to validate QR code' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Get students by classroom
export const getStudentsByClassroom = async (classroomId: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/students`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch students' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Get attendance by classroom
export const getClassroomAttendance = async (classroomId: number, teacherId?: string, subject?: string): Promise<ApiResponse<any[]>> => {
  try {
    const params = new URLSearchParams();
    if (teacherId) params.append('teacherId', teacherId);
    if (subject) params.append('subject', subject);

    const response = await fetch(`${API_BASE_URL}/attendance/classroom/${classroomId}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch attendance' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Get all students enrolled in a teacher's classrooms
export const getTeacherStudents = async (teacherId: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/students`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch teacher students' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Get detailed attendance for a student
export const getStudentAttendanceDetail = async (studentId: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/attendance`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch student attendance' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Update attendance record (for fixing errors)
export const updateAttendanceRecord = async (id: number, updateData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update attendance record' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Delete attendance record
export const deleteAttendanceRecord = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete attendance record' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Mark absent students who didn't scan
export const markAbsences = async (classroomId: number, subject: string, teacherId: string, date: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/mark-absences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classroomId,
        subject,
        teacherId,
        date
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to mark absences' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};
