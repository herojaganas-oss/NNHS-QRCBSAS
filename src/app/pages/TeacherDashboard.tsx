import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LogOut,
  ScanBarcode,
  FileText,
  Users,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import { type Teacher, type ClassSchedule, type AttendanceRecord } from '../data/schoolData';
import * as api from '../services/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [totalEnrolledStudents, setTotalEnrolledStudents] = useState(0);

  useEffect(() => {
    const teacherData = sessionStorage.getItem('teacherData');
    const teacherId = sessionStorage.getItem('teacherId');

    if (!teacherData || !teacherId) {
      navigate('/');
      return;
    }

    const foundTeacher = JSON.parse(teacherData);

    // Ensure schedules is always an array
    if (!foundTeacher.schedules || !Array.isArray(foundTeacher.schedules)) {
      foundTeacher.schedules = [];
    }

    setTeacher(foundTeacher);

    if (foundTeacher.schedules.length > 0) {
      setSelectedSchedule(foundTeacher.schedules[0]);
    }

    // Load attendance records and enrolled students
    loadAttendance(teacherId);
    loadEnrolledStudents(foundTeacher.id);
  }, [navigate]);

  const loadAttendance = async (teacherId: string) => {
    const result = await api.getTeacherAttendance(teacherId);
    if (result.data) {
      setAttendanceRecords(result.data);
    }
  };

  const loadEnrolledStudents = async (teacherId: string) => {
    const result = await api.getTeacherStudents(parseInt(teacherId));
    if (result.data) {
      setTotalEnrolledStudents(result.data.totalStudents || 0);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleScanForClass = (schedule: ClassSchedule) => {
    sessionStorage.setItem('selectedScheduleId', schedule.id);
    navigate('/teacher/scanner');
  };

  const handleViewAttendance = (schedule: ClassSchedule) => {
    sessionStorage.setItem('selectedScheduleId', schedule.id);
    navigate('/teacher/attendance');
  };

  if (!teacher) {
    return <div>Loading...</div>;
  }

  // Get today's date dynamically
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === todayDate);

  // Get UNIQUE students from today's attendance records (avoid counting duplicates)
  const uniqueStudentIdsToday = new Set(todayRecords.map(r => r.studentId));
  const uniquePresentStudentIds = new Set(
    todayRecords
      .filter(r => ['present', 'late', 'on-time'].includes(r.status))
      .map(r => r.studentId)
  );
  const uniqueAbsentStudentIds = new Set(
    todayRecords
      .filter(r => r.status === 'absent')
      .map(r => r.studentId)
  );

  const presentToday = uniquePresentStudentIds.size;
  const absentToday = uniqueAbsentStudentIds.size;
  const scannedToday = uniqueStudentIdsToday.size;

  // Attendance rate based on total enrolled students
  // Cap at 100% to prevent errors from duplicate records or data issues
  const rawRate = totalEnrolledStudents > 0
    ? (presentToday / totalEnrolledStudents) * 100
    : 0;
  const attendanceRate = Math.min(Math.round(rawRate), 100);

  // Get recent scans (today's present students, most recent first)
  const recentScans = todayRecords
    .filter(r => r.status === 'present')
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-green-100 text-sm">NNHS Student Attendance Monitoring System - {teacher.name}</p>
              <p className="text-green-200 text-xs">{teacher.rank}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-800 text-sm font-medium">Present Today</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{presentToday}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-800 text-sm font-medium">Absent Today</p>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{absentToday}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-800 text-sm font-medium">Total Students</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalEnrolledStudents}</p>
            <p className="text-xs text-gray-500 mt-1">Enrolled in your classes</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-800 text-sm font-medium">Attendance Rate</p>
              <Calendar className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-indigo-600">{attendanceRate}%</p>
          </div>
        </div>

        {/* Class Schedules */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">My Class Schedules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacher.schedules && teacher.schedules.length > 0 ? teacher.schedules.map((schedule) => {
              // Get attendance stats for this specific class (using unique students only)
              const classRecords = todayRecords.filter(
                r => r.gradeLevel === schedule.gradeLevel &&
                     r.section === schedule.section &&
                     r.subject === schedule.subject
              );

              // Count unique present students only
              const uniqueClassPresentIds = new Set(
                classRecords
                  .filter(r => ['present', 'late', 'on-time'].includes(r.status))
                  .map(r => r.studentId)
              );
              const uniqueClassStudentIds = new Set(classRecords.map(r => r.studentId));

              const classPresent = uniqueClassPresentIds.size;
              const classScanned = uniqueClassStudentIds.size;
              // Cap rate at 100% to prevent display errors
              const rawClassRate = classScanned > 0 ? (classPresent / classScanned) * 100 : 0;
              const classRate = Math.min(Math.round(rawClassRate), 100);

              return (
                <div 
                  key={schedule.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-800 text-lg">{schedule.subject}</h3>
                    <p className="text-sm text-gray-600">{schedule.gradeLevel} - {schedule.section}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{schedule.days}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{schedule.room}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Today's Attendance</p>
                    <p className="text-lg font-bold text-gray-800">
                      {classPresent}/{classScanned} <span className="text-sm text-green-600">({classRate}%)</span>
                    </p>
                    <p className="text-xs text-gray-400">Present / Scanned</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScanForClass(schedule)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <ScanBarcode className="w-4 h-4" />
                      Scan
                    </button>
                    <button
                      onClick={() => handleViewAttendance(schedule)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Records
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No class schedules assigned yet. Please contact your administrator.
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Recent Scans Today</h2>
          </div>

          <div className="space-y-3">
            {recentScans.length > 0 ? (
              recentScans.map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{scan.studentName}</p>
                      <p className="text-sm text-gray-600">
                        ID: {scan.studentId} • {scan.gradeLevel} - {scan.section}
                      </p>
                      <p className="text-xs text-gray-500">{scan.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{scan.time}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Present</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No scans recorded yet today. Start scanning student IDs!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}