import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  UserPlus,
  LogOut,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  Phone,
  Hash,
  BookOpen,
  Clock,
  Award,
  X,
  Save,
  Calendar,
  MapPin,
  Plus,
  Settings,
  Eye,
  EyeOff,
  FileText,
  Upload
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import * as api from '../services/api';

interface Student {
  id: string;
  studentId: string;
  name: string;
  gradeLevel: string;
  strand: string;
  section: string;
  classroomId?: string;
  classroomName?: string;
  parentGuardian: string;
  contactNumber: string;
}

interface Classroom {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  strand: string;
  roomNumber: string;
  capacity: number;
  studentCount: number;
}

interface Schedule {
  id: string;
  subject: string;
  gradeLevel: string;
  section: string;
  time: string;
  room: string;
  days: string;
}

interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  rank: string;
  subjects: string[];
  gradeLevels: string[];
  contactNumber: string;
  email: string;
  username: string;
  password: string;
  schedules: Schedule[];
}

// System data
const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Statistics and Probability',
  'English',
  'Filipino',
  'Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Earth Science',
  'Araling Panlipunan',
  'History',
  'Philippine Politics and Governance',
  'Physical Education',
  'Music',
  'Arts',
  'Technology and Livelihood Education',
  'Computer Science',
  'Entrepreneurship',
  'Reading and Writing'
];

const GRADE_LEVELS = [
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

const TEACHER_RANKS = [
  'Teacher I',
  'Teacher II',
  'Teacher III',
  'Master Teacher I',
  'Master Teacher II',
  'Master Teacher III',
  'Master Teacher IV',
  'Head Teacher I',
  'Head Teacher II',
  'Head Teacher III'
];

const STRANDS = [
  { value: 'HUMSS', label: 'HUMSS - Humanities and Social Sciences' },
  { value: 'ABM', label: 'ABM - Accountancy, Business and Management' },
  { value: 'GAS', label: 'GAS - General Academic Strand' }
];

const SECTIONS = ['A', 'B'];

// For classroom creation
const AVAILABLE_GRADE_LEVELS = [
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

const AVAILABLE_STRANDS = [
  'HUMSS',
  'ABM',
  'GAS'
];

const DAYS_OPTIONS = [
  'Mon-Fri',
  'Mon, Wed, Fri',
  'Tue, Thu',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

const TIME_SLOTS = [
  '7:00 AM - 8:00 AM',
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '8:00 AM - 9:30 AM',
  '10:00 AM - 11:30 AM',
  '1:00 PM - 2:30 PM',
  '2:30 PM - 4:00 PM'
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'settings'>('students');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showAddClassroomForm, setShowAddClassroomForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);

  // Student State
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>({
    studentId: '',
    name: '',
    gradeLevel: '',
    strand: '',
    section: '',
    classroomId: '',
    parentGuardian: '',
    contactNumber: ''
  });

  // Teacher State
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load data from backend on component mount
  useEffect(() => {
    loadStudents();
    loadTeachers();
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    const result = await api.getClassrooms();
    if (result.data) {
      setClassrooms(result.data);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    const result = await api.getStudents();
    if (result.data) {
      setStudents(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const loadTeachers = async () => {
    setLoading(true);
    const result = await api.getTeachers();
    if (result.data) {
      setTeachers(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const [teacherForm, setTeacherForm] = useState({
    teacherId: '',
    name: '',
    rank: '',
    subjects: [] as string[],
    gradeLevels: [] as string[],
    contactNumber: '',
    email: '',
    username: '',
    password: ''
  });

  // Password visibility states
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);

  // Student attendance detail view
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // CSV Import
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Schedule Form
  const [scheduleForm, setScheduleForm] = useState({
    classroomId: '',
    subject: '',
    gradeLevel: '',
    section: '',
    time: '',
    room: '',
    days: ''
  });

  // Classroom Form
  const [classroomForm, setClassroomForm] = useState({
    name: '',
    gradeLevel: '',
    section: '',
    strand: '',
    roomNumber: '',
    capacity: 40
  });

  // Admin Settings Form
  const [adminSettings, setAdminSettings] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });

  // Form Validations
  const validateStudentForm = (): boolean => {
    if (!studentForm.studentId.trim()) {
      toast.error('Student ID (LRN) is required');
      return false;
    }
    if (studentForm.studentId.length !== 12 || !/^\d+$/.test(studentForm.studentId)) {
      toast.error('Student ID must be a 12-digit LRN number');
      return false;
    }
    if (!studentForm.name.trim()) {
      toast.error('Student name is required');
      return false;
    }
    if (!studentForm.classroomId) {
      toast.error('Classroom assignment is required');
      return false;
    }
    if (!studentForm.gradeLevel) {
      toast.error('Grade level is required');
      return false;
    }

    // Validate grade level (7-12 only)
    const gradeNum = parseInt(studentForm.gradeLevel.replace('Grade ', ''));
    if (gradeNum < 7 || gradeNum > 12) {
      toast.error('Grade level must be between 7 and 12');
      return false;
    }

    // Check if strand is required for Grade 11 & 12
    if (['Grade 11', 'Grade 12'].includes(studentForm.gradeLevel) && !studentForm.strand) {
      toast.error('Strand is required for Senior High School students');
      return false;
    }

    if (!studentForm.section.trim()) {
      toast.error('Section is required');
      return false;
    }
    if (!studentForm.parentGuardian.trim()) {
      toast.error('Parent/Guardian name is required');
      return false;
    }
    if (!studentForm.contactNumber.trim()) {
      toast.error('Contact number is required');
      return false;
    }

    // Validate phone number format (Philippine mobile number)
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(studentForm.contactNumber.replace(/\s/g, ''))) {
      toast.error('Invalid phone number format. Use: 09XXXXXXXXX');
      return false;
    }

    // Check for duplicate Student ID
    if (!editingStudent && students.some(s => s.studentId === studentForm.studentId)) {
      toast.error('Student ID already exists');
      return false;
    }

    return true;
  };

  const validateTeacherForm = (): boolean => {
    if (!teacherForm.teacherId.trim()) {
      toast.error('Teacher ID (Employee ID) is required');
      return false;
    }
    if (teacherForm.teacherId.length !== 10 || !/^\d+$/.test(teacherForm.teacherId)) {
      toast.error('Teacher ID must be a 10-digit Employee ID number');
      return false;
    }
    if (!teacherForm.name.trim()) {
      toast.error('Teacher name is required');
      return false;
    }
    if (!teacherForm.rank) {
      toast.error('Rank is required');
      return false;
    }
    if (teacherForm.subjects.length === 0) {
      toast.error('At least one subject is required');
      return false;
    }
    if (teacherForm.gradeLevels.length === 0) {
      toast.error('At least one grade level is required');
      return false;
    }
    if (!teacherForm.email.trim()) {
      toast.error('Email is required');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherForm.email)) {
      toast.error('Invalid email format');
      return false;
    }

    if (!teacherForm.contactNumber.trim()) {
      toast.error('Contact number is required');
      return false;
    }

    // Validate phone number
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(teacherForm.contactNumber.replace(/\s/g, ''))) {
      toast.error('Invalid phone number format. Use: 09XXXXXXXXX');
      return false;
    }

    if (!teacherForm.username.trim()) {
      toast.error('Username is required');
      return false;
    }

    // Check for duplicate username
    if (!editingTeacher && teachers.some(t => t.username === teacherForm.username)) {
      toast.error('Username already exists');
      return false;
    }

    if (!teacherForm.password.trim()) {
      toast.error('Password is required');
      return false;
    }

    if (teacherForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    // Check for duplicate Teacher ID
    if (!editingTeacher && teachers.some(t => t.teacherId === teacherForm.teacherId)) {
      toast.error('Teacher ID already exists');
      return false;
    }

    return true;
  };

  const validateScheduleForm = (): boolean => {
    if (!scheduleForm.classroomId) {
      toast.error('Classroom is required');
      return false;
    }
    if (!scheduleForm.subject) {
      toast.error('Subject is required');
      return false;
    }
    if (!scheduleForm.time) {
      toast.error('Time is required');
      return false;
    }
    if (!scheduleForm.days) {
      toast.error('Days are required');
      return false;
    }
    return true;
  };

  // Student Handlers
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStudentForm()) return;

    setLoading(true);
    const result = await api.createStudent(studentForm);

    if (result.data) {
      await loadStudents(); // Reload students from backend
      toast.success('Student added successfully');
      resetStudentForm();
      setShowAddStudentForm(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      studentId: student.studentId,
      name: student.name,
      gradeLevel: student.gradeLevel,
      strand: student.strand,
      section: student.section,
      classroomId: student.classroomId || '',
      parentGuardian: student.parentGuardian,
      contactNumber: student.contactNumber
    });
    setShowAddStudentForm(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !validateStudentForm()) return;

    setLoading(true);
    const result = await api.updateStudent(parseInt(editingStudent.id), studentForm);

    if (result.data) {
      await loadStudents();
      toast.success('Student updated successfully');
      resetStudentForm();
      setEditingStudent(null);
      setShowAddStudentForm(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDeleteStudent = async (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student) return;

    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      setLoading(true);
      const result = await api.deleteStudent(parseInt(id));

      if (result.data !== undefined) {
        await loadStudents();
        toast.success('Student deleted successfully');
      } else if (result.error) {
        toast.error(result.error);
      }
      setLoading(false);
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      studentId: '',
      name: '',
      gradeLevel: '',
      strand: '',
      section: '',
      classroomId: '',
      parentGuardian: '',
      contactNumber: ''
    });
    setEditingStudent(null);
  };

  const handleViewStudentAttendance = async (student: Student) => {
    setAttendanceLoading(true);
    setShowAttendanceDialog(true);

    const result = await api.getStudentAttendanceDetail(parseInt(student.id));

    if (result.data) {
      setSelectedStudentAttendance(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }

    setAttendanceLoading(false);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const [studentId, name, classroomId, parentGuardian, contactNumber] = lines[i].split(',').map(s => s.trim());

        if (studentId && name && classroomId) {
          await api.createStudent({
            studentId,
            name,
            classroomId: parseInt(classroomId),
            parentGuardian: parentGuardian || '',
            contactNumber: contactNumber || '',
            gradeLevel: '',
            strand: '',
            section: ''
          });
        }
      }

      await loadStudents();
      toast.success(`Imported ${lines.length - 1} students successfully`);
      setShowImportDialog(false);
    };
    reader.readAsText(file);
  };

  // Teacher Handlers
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTeacherForm()) return;

    setLoading(true);
    const result = await api.createTeacher(teacherForm);

    if (result.data) {
      await loadTeachers();
      toast.success(`Teacher account created successfully! Username: ${teacherForm.username}`);
      resetTeacherForm();
      setShowAddTeacherForm(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherForm({
      teacherId: teacher.teacherId,
      name: teacher.name,
      rank: teacher.rank,
      subjects: teacher.subjects,
      gradeLevels: teacher.gradeLevels,
      contactNumber: teacher.contactNumber,
      email: teacher.email,
      username: teacher.username,
      password: teacher.password
    });
    setShowAddTeacherForm(true);
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !validateTeacherForm()) return;

    setLoading(true);
    const result = await api.updateTeacher(parseInt(editingTeacher.id), teacherForm);

    if (result.data) {
      await loadTeachers();
      toast.success('Teacher updated successfully');
      resetTeacherForm();
      setEditingTeacher(null);
      setShowAddTeacherForm(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDeleteTeacher = async (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;

    if (window.confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      setLoading(true);
      const result = await api.deleteTeacher(parseInt(id));

      if (result.data !== undefined) {
        await loadTeachers();
        toast.success('Teacher deleted successfully');
      } else if (result.error) {
        toast.error(result.error);
      }
      setLoading(false);
    }
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      teacherId: '',
      name: '',
      rank: '',
      subjects: [],
      gradeLevels: [],
      contactNumber: '',
      email: '',
      username: '',
      password: ''
    });
    setEditingTeacher(null);
  };

  // Schedule Handlers
  const handleManageSchedule = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowScheduleDialog(true);
  };

  const handleAddSchedule = async () => {
    if (!selectedTeacher || !validateScheduleForm()) return;

    setLoading(true);
    const result = await api.addSchedule(parseInt(selectedTeacher.id), scheduleForm);

    if (result.data) {
      await loadTeachers();
      // Update selectedTeacher with fresh data
      const updatedTeacher = teachers.find(t => t.id === selectedTeacher.id);
      if (updatedTeacher) {
        setSelectedTeacher(updatedTeacher);
      }
      toast.success('Schedule added successfully');
      resetScheduleForm();
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedTeacher) return;

    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setLoading(true);
      const result = await api.deleteSchedule(parseInt(scheduleId));

      if (result.data !== undefined) {
        await loadTeachers();
        // Update selectedTeacher with fresh data
        const updatedTeacher = teachers.find(t => t.id === selectedTeacher.id);
        if (updatedTeacher) {
          setSelectedTeacher(updatedTeacher);
        }
        toast.success('Schedule deleted successfully');
      } else if (result.error) {
        toast.error(result.error);
      }
      setLoading(false);
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      classroomId: '',
      subject: '',
      gradeLevel: '',
      section: '',
      time: '',
      room: '',
      days: ''
    });
  };

  // Classroom Handlers
  const handleAddClassroom = async () => {
    if (!validateClassroomForm()) return;

    setLoading(true);
    const result = await api.createClassroom(classroomForm);

    if (result.data) {
      await loadClassrooms();
      toast.success('Classroom created successfully');
      setShowAddClassroomForm(false);
      resetClassroomForm();
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleEditClassroom = async () => {
    if (!editingClassroom || !validateClassroomForm()) return;

    setLoading(true);
    const result = await api.updateClassroom(parseInt(editingClassroom.id), classroomForm);

    if (result.data) {
      await loadClassrooms();
      toast.success('Classroom updated successfully');
      setEditingClassroom(null);
      resetClassroomForm();
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDeleteClassroom = async (id: string) => {
    const classroom = classrooms.find(c => c.id === id);
    if (!classroom) return;

    if (window.confirm(`Are you sure you want to delete ${classroom.name}?\n\nWarning: Students in this classroom will become unassigned!`)) {
      setLoading(true);
      const result = await api.deleteClassroom(parseInt(id));

      if (result.data !== undefined) {
        await loadClassrooms();
        await loadStudents(); // Refresh students since their classroom might have been deleted
        toast.success('Classroom deleted successfully');
      } else if (result.error) {
        toast.error(result.error);
      }
      setLoading(false);
    }
  };

  const validateClassroomForm = (): boolean => {
    if (!classroomForm.gradeLevel) {
      toast.error('Grade level is required');
      return false;
    }
    if (!classroomForm.section) {
      toast.error('Section is required');
      return false;
    }
    if (!classroomForm.roomNumber) {
      toast.error('Room number is required');
      return false;
    }
    if (classroomForm.capacity < 1 || classroomForm.capacity > 100) {
      toast.error('Capacity must be between 1 and 100');
      return false;
    }
    return true;
  };

  const resetClassroomForm = () => {
    setClassroomForm({
      name: '',
      gradeLevel: '',
      section: '',
      strand: '',
      roomNumber: '',
      capacity: 40
    });
    setEditingClassroom(null);
  };

  const startEditClassroom = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setClassroomForm({
      name: classroom.name,
      gradeLevel: classroom.gradeLevel,
      section: classroom.section,
      strand: classroom.strand,
      roomNumber: classroom.roomNumber,
      capacity: classroom.capacity
    });
    setShowAddClassroomForm(true);
  };

  // Admin Settings Handlers
  const handleUpdateAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminSettings.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (adminSettings.newPassword && adminSettings.newPassword !== adminSettings.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (adminSettings.newPassword && adminSettings.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await api.updateAdminAccount(
      adminSettings.currentPassword,
      adminSettings.newUsername || undefined,
      adminSettings.newPassword || undefined
    );

    if (result.data) {
      toast.success('Admin account updated successfully');
      setAdminSettings({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
        securityQuestion: adminSettings.securityQuestion,
        securityAnswer: adminSettings.securityAnswer
      });
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleSetSecurityQuestion = async () => {
    if (!adminSettings.securityQuestion || !adminSettings.securityAnswer) {
      toast.error('Both security question and answer are required');
      return;
    }

    if (!adminSettings.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    setLoading(true);
    const result = await api.updateAdminAccount(
      adminSettings.currentPassword,
      undefined,
      undefined,
      adminSettings.securityQuestion,
      adminSettings.securityAnswer
    );

    if (result.data) {
      toast.success('Security question set successfully');
      setAdminSettings({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: ''
      });
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.rank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const juniorHighCount = students.filter(s => ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(s.gradeLevel)).length;
  const seniorHighCount = students.filter(s => ['Grade 11', 'Grade 12'].includes(s.gradeLevel)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-green-100 text-sm">NNHS QR Code-Based Student Attendance Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-sm font-medium">Junior High</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{juniorHighCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-sm font-medium">Senior High</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{seniorHighCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-sm font-medium">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{teachers.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('students');
                setSearchQuery('');
                setShowAddStudentForm(false);
                resetStudentForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'students'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              Student Management
            </button>
            <button
              onClick={() => {
                setActiveTab('teachers');
                setSearchQuery('');
                setShowAddTeacherForm(false);
                resetTeacherForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'teachers'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-5 h-5" />
              Teacher Management
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setAdminSettings({
                  currentPassword: '',
                  newUsername: '',
                  newPassword: '',
                  confirmPassword: '',
                  securityQuestion: '',
                  securityAnswer: ''
                });
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>

        {/* Student Management */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Student Master List
              </h2>
              <button
                onClick={() => {
                  resetStudentForm();
                  setShowAddStudentForm(!showAddStudentForm);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showAddStudentForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {showAddStudentForm ? 'Cancel' : 'Add Student'}
              </button>
            </div>

            {/* Add/Edit Student Form */}
            {showAddStudentForm && (
              <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent} className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Student ID (LRN Format) *
                    </label>
                    <input
                      type="text"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., 177109400001 (12-digit LRN)"
                      required
                      maxLength={12}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 12-digit Learner Reference Number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., Maria Santos"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Grade Level * (7-12 only)
                    </label>
                    <Select
                      value={studentForm.gradeLevel}
                      onValueChange={(value) => {
                        setStudentForm({
                          ...studentForm,
                          gradeLevel: value,
                          strand: ['Grade 11', 'Grade 12'].includes(value) ? studentForm.strand : ''
                        });
                      }}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 7">Grade 7 (Junior High)</SelectItem>
                        <SelectItem value="Grade 8">Grade 8 (Junior High)</SelectItem>
                        <SelectItem value="Grade 9">Grade 9 (Junior High)</SelectItem>
                        <SelectItem value="Grade 10">Grade 10 (Junior High)</SelectItem>
                        <SelectItem value="Grade 11">Grade 11 (Senior High)</SelectItem>
                        <SelectItem value="Grade 12">Grade 12 (Senior High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {['Grade 11', 'Grade 12'].includes(studentForm.gradeLevel) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Strand *
                      </label>
                      <Select
                        value={studentForm.strand}
                        onValueChange={(value) => setStudentForm({ ...studentForm, strand: value })}
                      >
                        <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                          <SelectValue placeholder="Select Strand" />
                        </SelectTrigger>
                        <SelectContent>
                          {STRANDS.map(strand => (
                            <SelectItem key={strand.value} value={strand.value}>
                              {strand.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Section *
                    </label>
                    <Select
                      value={studentForm.section}
                      onValueChange={(value) => setStudentForm({ ...studentForm, section: value })}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map(section => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Classroom Assignment *
                    </label>
                    <Select
                      value={studentForm.classroomId}
                      onValueChange={(value) => {
                        const classroom = classrooms.find(c => c.id === value);
                        if (classroom) {
                          // Extract section properly for both JH and SH
                          // JH: "Section A" -> "A", SH: "HUMSS-A" -> "A"
                          let sectionValue = classroom.section;
                          if (sectionValue.includes('Section ')) {
                            sectionValue = sectionValue.replace('Section ', '');
                          } else if (sectionValue.includes('-')) {
                            sectionValue = sectionValue.split('-').pop() || sectionValue;
                          }

                          setStudentForm({
                            ...studentForm,
                            classroomId: value,
                            gradeLevel: classroom.gradeLevel,
                            section: sectionValue,
                            strand: classroom.strand || ''
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                        <SelectValue placeholder="Select Classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map(classroom => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name} - Room {classroom.roomNumber} ({classroom.studentCount}/{classroom.capacity})
                          </SelectItem>
                        ))}
                        {classrooms.length === 0 && (
                          <div className="px-2 py-1 text-sm text-gray-500">No classrooms available</div>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Selecting a classroom auto-fills grade and section</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      value={studentForm.parentGuardian}
                      onChange={(e) => setStudentForm({ ...studentForm, parentGuardian: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., Juan Santos"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Contact Number * (09XXXXXXXXX)
                    </label>
                    <input
                      type="tel"
                      value={studentForm.contactNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, contactNumber: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., 09123456789"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStudentForm(false);
                      resetStudentForm();
                    }}
                    className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, student ID, or grade level..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Student ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Grade Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Strand</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Section</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Parent/Guardian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Contact</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.gradeLevel}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.strand || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.section}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.parentGuardian}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.contactNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewStudentAttendance(student)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Attendance"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No students found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teacher Management */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Teacher Master List
              </h2>
              <button
                onClick={() => {
                  resetTeacherForm();
                  setShowAddTeacherForm(!showAddTeacherForm);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showAddTeacherForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {showAddTeacherForm ? 'Cancel' : 'Add Teacher'}
              </button>
            </div>

            {/* Add/Edit Teacher Form */}
            {showAddTeacherForm && (
              <form onSubmit={editingTeacher ? handleUpdateTeacher : handleAddTeacher} className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingTeacher ? 'Edit Teacher' : 'Create Teacher Account'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Teacher ID (Employee ID) *
                    </label>
                    <input
                      type="text"
                      value={teacherForm.teacherId}
                      onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., 2024001234 (10-digit Employee ID)"
                      required
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 10-digit Employee ID Number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., Dr. Elizabeth Torres"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Rank *
                    </label>
                    <Select
                      value={teacherForm.rank}
                      onValueChange={(value) => setTeacherForm({ ...teacherForm, rank: value })}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                        <SelectValue placeholder="Select Rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEACHER_RANKS.map(rank => (
                          <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="teacher@nahawan.edu.ph"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Contact Number * (09XXXXXXXXX)
                    </label>
                    <input
                      type="tel"
                      value={teacherForm.contactNumber}
                      onChange={(e) => setTeacherForm({ ...teacherForm, contactNumber: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., 09123456789"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Username * (for login)
                    </label>
                    <input
                      type="text"
                      value={teacherForm.username}
                      onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="e.g., etorres"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Password * (min 6 characters)
                    </label>
                    <input
                      type="password"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Subjects Handled * (select multiple)
                    </label>
                    <Select
                      value={teacherForm.subjects[0] || ''}
                      onValueChange={(value) => {
                        if (!teacherForm.subjects.includes(value)) {
                          setTeacherForm({ ...teacherForm, subjects: [...teacherForm.subjects, value] });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                        <SelectValue placeholder="Add subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_SUBJECTS.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacherForm.subjects.map((subject, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {subject}
                          <button
                            type="button"
                            onClick={() => setTeacherForm({
                              ...teacherForm,
                              subjects: teacherForm.subjects.filter((_, i) => i !== idx)
                            })}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Grade Levels Handled * (select multiple)
                    </label>
                    <Select
                      value={teacherForm.gradeLevels[0] || ''}
                      onValueChange={(value) => {
                        if (!teacherForm.gradeLevels.includes(value)) {
                          setTeacherForm({ ...teacherForm, gradeLevels: [...teacherForm.gradeLevels, value] });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-800 text-gray-900">
                        <SelectValue placeholder="Add grade levels" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacherForm.gradeLevels.map((grade, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {grade}
                          <button
                            type="button"
                            onClick={() => setTeacherForm({
                              ...teacherForm,
                              gradeLevels: teacherForm.gradeLevels.filter((_, i) => i !== idx)
                            })}
                            className="hover:text-green-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingTeacher ? 'Update Teacher' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTeacherForm(false);
                      resetTeacherForm();
                    }}
                    className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, teacher ID, or rank..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>

            {/* Teachers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Teacher ID
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Rank
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Subjects
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Grade Levels</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Schedules</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{teacher.teacherId}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{teacher.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{teacher.rank}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-wrap gap-1">
                          {(teacher.subjects && Array.isArray(teacher.subjects)) ? teacher.subjects.slice(0, 2).map((subject, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {subject}
                            </span>
                          )) : <span className="text-xs text-gray-500">No subjects</span>}
                          {teacher.subjects && teacher.subjects.length > 2 && (
                            <span className="text-xs text-gray-600">+{teacher.subjects.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-wrap gap-1">
                          {(teacher.gradeLevels && Array.isArray(teacher.gradeLevels)) ? teacher.gradeLevels.slice(0, 2).map((grade, idx) => (
                            <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {grade}
                            </span>
                          )) : <span className="text-xs text-gray-500">Not assigned</span>}
                          {teacher.gradeLevels && teacher.gradeLevels.length > 2 && (
                            <span className="text-xs text-gray-600">+{teacher.gradeLevels.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{teacher.contactNumber}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleManageSchedule(teacher)}
                          className="flex items-center gap-1 text-sm bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-1 rounded transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          Manage ({teacher.schedules.length})
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No teachers found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>

            <form onSubmit={handleUpdateAdminSettings} className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Username/Password</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={adminSettings.currentPassword}
                      onChange={(e) => setAdminSettings({ ...adminSettings, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Username (optional)
                    </label>
                    <input
                      type="text"
                      value={adminSettings.newUsername}
                      onChange={(e) => setAdminSettings({ ...adminSettings, newUsername: e.target.value })}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      value={adminSettings.newPassword}
                      onChange={(e) => setAdminSettings({ ...adminSettings, newPassword: e.target.value })}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={adminSettings.confirmPassword}
                      onChange={(e) => setAdminSettings({ ...adminSettings, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      disabled={!adminSettings.newPassword}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Question</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set a security question to help recover your password if you forget it.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Question
                    </label>
                    <input
                      type="text"
                      value={adminSettings.securityQuestion}
                      onChange={(e) => setAdminSettings({ ...adminSettings, securityQuestion: e.target.value })}
                      placeholder="e.g., What is your mother's maiden name?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Answer
                    </label>
                    <input
                      type="text"
                      value={adminSettings.securityAnswer}
                      onChange={(e) => setAdminSettings({ ...adminSettings, securityAnswer: e.target.value })}
                      placeholder="Your answer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSetSecurityQuestion}
                    disabled={loading || !adminSettings.securityQuestion || !adminSettings.securityAnswer || !adminSettings.currentPassword}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Setting...' : 'Set Security Question'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Schedule Management Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Manage Class Schedules - {selectedTeacher?.name}
            </DialogTitle>
            <DialogDescription>
              Add, view, and manage class schedules for this teacher. Each schedule includes subject, grade level, section, time, room, and days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Schedule Form */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Add New Schedule</h4>
              <p className="text-xs text-gray-600 mb-3">
                Assign this teacher to a classroom with a subject and schedule. Students in the selected classroom will automatically appear in this teacher's class roster.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-800 mb-1">Classroom *</label>
                  <Select
                    value={scheduleForm.classroomId}
                    onValueChange={(value) => {
                      const classroom = classrooms.find(c => c.id === value);
                      if (classroom) {
                        setScheduleForm({
                          ...scheduleForm,
                          classroomId: value,
                          gradeLevel: classroom.gradeLevel,
                          section: classroom.section,
                          room: classroom.roomNumber
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="border-2 border-gray-800 text-gray-900">
                      <SelectValue placeholder="Select Classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map(classroom => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name} - {classroom.roomNumber} ({classroom.studentCount} students)
                        </SelectItem>
                      ))}
                      {classrooms.length === 0 && (
                        <div className="px-2 py-1 text-sm text-gray-500">No classrooms available</div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecting a classroom auto-fills room and students. Students already in this classroom will be assigned to this teacher.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Subject *</label>
                  <Select value={scheduleForm.subject} onValueChange={(value) => setScheduleForm({ ...scheduleForm, subject: value })}>
                    <SelectTrigger className="border-2 border-gray-800 text-gray-900">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Time Slot *</label>
                  <Select value={scheduleForm.time} onValueChange={(value) => setScheduleForm({ ...scheduleForm, time: value })}>
                    <SelectTrigger className="border-2 border-gray-800 text-gray-900">
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Days *</label>
                  <Select value={scheduleForm.days} onValueChange={(value) => setScheduleForm({ ...scheduleForm, days: value })}>
                    <SelectTrigger className="border-2 border-gray-800 text-gray-900">
                      <SelectValue placeholder="Select Days" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OPTIONS.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Room (Auto-filled)</label>
                  <input
                    type="text"
                    value={scheduleForm.room}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-600 text-sm bg-gray-100"
                    placeholder="Select classroom first"
                    readOnly
                  />
                </div>
              </div>
              <button
                onClick={handleAddSchedule}
                disabled={!scheduleForm.classroomId || !scheduleForm.subject || loading}
                className="mt-3 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Adding...' : 'Add Schedule & Assign Students'}
              </button>
              <p className="text-xs text-gray-600 mt-2">
                ✓ Creates schedule for teacher<br />
                ✓ Assigns teacher to classroom<br />
                ✓ All students in classroom automatically assigned to this teacher
              </p>
            </div>

            {/* Existing Schedules */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Current Schedules ({selectedTeacher?.schedules.length || 0})
              </h4>
              {selectedTeacher && selectedTeacher.schedules.length > 0 ? (
                <div className="space-y-3">
                  {selectedTeacher.schedules.map((schedule) => {
                    // Find the classroom to show student count
                    const classroom = classrooms.find(c => c.id === schedule.classroomId);

                    return (
                      <div key={schedule.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-400 transition-colors bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 text-base">{schedule.subject}</h5>
                            <p className="text-sm text-gray-600 mt-1">{schedule.classroomName || `${schedule.gradeLevel} - ${schedule.section}`}</p>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{classroom?.studentCount || 0} students enrolled</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-500" />
                                <span>{schedule.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span>{schedule.room}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span>{schedule.days}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  No schedules added yet. Add a schedule above.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Attendance Detail Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Attendance Details</DialogTitle>
            <DialogDescription>
              View complete attendance history and statistics
            </DialogDescription>
          </DialogHeader>

          {attendanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : selectedStudentAttendance ? (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900">{selectedStudentAttendance.student.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-gray-600">Student ID</p>
                    <p className="font-medium text-gray-900">{selectedStudentAttendance.student.studentId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Grade Level</p>
                    <p className="font-medium text-gray-900">{selectedStudentAttendance.student.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Section</p>
                    <p className="font-medium text-gray-900">{selectedStudentAttendance.student.section}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Strand</p>
                    <p className="font-medium text-gray-900">{selectedStudentAttendance.student.strand || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Attendance Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{selectedStudentAttendance.statistics.presentCount}</p>
                    <p className="text-sm text-gray-700 mt-1">Present</p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-700">{selectedStudentAttendance.statistics.lateCount}</p>
                    <p className="text-sm text-gray-700 mt-1">Late</p>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-700">{selectedStudentAttendance.statistics.absentCount}</p>
                    <p className="text-sm text-gray-700 mt-1">Absent</p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{selectedStudentAttendance.statistics.totalRecords}</p>
                    <p className="text-sm text-gray-700 mt-1">Total Days</p>
                  </div>
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{selectedStudentAttendance.statistics.attendanceRate}%</p>
                    <p className="text-sm text-gray-700 mt-1">Attendance Rate</p>
                  </div>
                </div>
              </div>

              {/* Attendance History Table */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Attendance History</h4>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Subject</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedStudentAttendance.records.length > 0 ? (
                          selectedStudentAttendance.records.map((record: any) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{record.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.time}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.subject}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  record.status === 'on-time' || record.status === 'present'
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : record.status === 'late'
                                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                  {record.status === 'on-time' ? 'On-Time' : record.status === 'late' ? 'Late' : record.status === 'absent' ? 'Absent' : 'Present'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              No attendance records found for this student.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAttendanceDialog(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load attendance data.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
