import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Download,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  BookOpen,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { type Teacher, type ClassSchedule, type AttendanceRecord } from '../data/schoolData';
import * as api from '../services/api';
import { toast } from 'sonner';

export default function AttendanceRecords() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedTime, setEditedTime] = useState('');

  useEffect(() => {
    const teacherData = sessionStorage.getItem('teacherData');
    const teacherId = sessionStorage.getItem('teacherId');
    const scheduleId = sessionStorage.getItem('selectedScheduleId');

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

    // If a schedule was selected, use it; otherwise use the first one
    const foundSchedule = scheduleId
      ? foundTeacher.schedules.find((s: ClassSchedule) => s.id === scheduleId)
      : foundTeacher.schedules[0];

    if (foundSchedule) {
      setSelectedSchedule(foundSchedule);
      loadAttendanceForSchedule(teacherId, foundSchedule);
      loadAllStudents(foundSchedule.classroomId);
    }
  }, [navigate]);

  const loadAttendanceForSchedule = async (teacherId: string, schedule: ClassSchedule) => {
    const result = await api.getClassAttendance(
      teacherId,
      schedule.gradeLevel,
      schedule.section,
      schedule.subject
    );

    if (result.data) {
      setRecords(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const loadAllStudents = async (classroomId: string) => {
    const result = await api.getStudentsByClassroom(parseInt(classroomId));
    if (result.data && result.data.students) {
      setAllStudents(result.data.students);
    }
  };

  const handleScheduleChange = (scheduleId: string) => {
    if (!teacher) return;

    const schedule = teacher.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      sessionStorage.setItem('selectedScheduleId', scheduleId);
      loadAttendanceForSchedule(teacher.teacherId, schedule);
      loadAllStudents(schedule.classroomId);
      setSearchQuery('');
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditedStatus(record.status);
    setEditedTime(record.time);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    const result = await api.updateAttendanceRecord(parseInt(editingRecord.id), {
      status: editedStatus,
      time: editedTime
    });

    if (result.data) {
      toast.success('Attendance record updated successfully');
      setEditingRecord(null);
      // Reload attendance records
      if (teacher && selectedSchedule) {
        loadAttendanceForSchedule(teacher.teacherId, selectedSchedule);
      }
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    const result = await api.deleteAttendanceRecord(parseInt(recordId));

    if (result.data !== undefined) {
      toast.success('Attendance record deleted successfully');
      // Reload attendance records
      if (teacher && selectedSchedule) {
        loadAttendanceForSchedule(teacher.teacherId, selectedSchedule);
      }
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleMarkAbsences = async () => {
    if (!teacher || !selectedSchedule) return;

    const today = new Date().toISOString().split('T')[0];
    const confirmed = confirm(
      'This will mark all students who haven\'t scanned today as ABSENT. Continue?'
    );

    if (!confirmed) return;

    const result = await api.markAbsences(
      parseInt(selectedSchedule.classroomId),
      selectedSchedule.subject,
      teacher.teacherId,
      today
    );

    if (result.data) {
      toast.success(
        `Marked ${result.data.markedCount} students as absent (${result.data.scannedCount} already scanned)`,
        { duration: 5000 }
      );
      // Reload attendance records
      loadAttendanceForSchedule(teacher.teacherId, selectedSchedule);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleExportCSV = () => {
    if (!selectedSchedule) return;

    const filteredData = getFilteredRecords();

    // CSV Headers
    const headers = ['Date', 'Time', 'Student ID', 'Student Name', 'Grade Level', 'Section', 'Subject', 'Status'];

    // CSV Rows - Format student ID as text to prevent Excel scientific notation
    const rows = filteredData.map(record => [
      record.date,
      record.time,
      `'${record.studentId}`,  // Prepend apostrophe to force text format in Excel
      record.studentName,
      record.gradeLevel,
      record.section,
      record.subject,
      record.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `attendance_${selectedSchedule.subject.replace(/\s+/g, '_')}_${selectedSchedule.gradeLevel}_${selectedSchedule.section}_${new Date().toISOString().split('T')[0]}.csv`;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredRecords = () => {
    // Get current date dynamically
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let displayRecords: any[] = [];

    // For "today" filter, merge all students with attendance records
    if (dateFilter === 'today' && selectedSchedule) {
      const todayRecords = records.filter(r => r.date === todayStr);
      const scannedStudentIds = new Set(todayRecords.map(r => r.studentId));

      // Add all students - either with their attendance record or as "Not Scanned"
      displayRecords = allStudents.map(student => {
        const attendanceRecord = todayRecords.find(r => r.studentId === student.studentId);
        if (attendanceRecord) {
          return attendanceRecord;
        } else {
          // Create a placeholder for students who haven't scanned yet
          return {
            id: `placeholder-${student.id}`,
            studentId: student.studentId,
            studentName: student.name,
            gradeLevel: student.gradeLevel,
            section: student.section,
            subject: selectedSchedule.subject,
            date: todayStr,
            time: '-',
            status: 'not-scanned',
            isPlaceholder: true
          };
        }
      });
    } else {
      // For other date filters, just show attendance records
      displayRecords = records;

      if (dateFilter === 'yesterday') {
        displayRecords = displayRecords.filter(r => r.date === yesterdayStr);
      }
    }

    // Search filter
    if (searchQuery) {
      displayRecords = displayRecords.filter(record =>
        record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return displayRecords;
  };

  if (!teacher || !selectedSchedule) {
    return <div>Loading...</div>;
  }

  const filteredRecords = getFilteredRecords();

  // Calculate stats for the selected schedule
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayDate);
  const presentToday = todayRecords.filter(r => ['present', 'late', 'on-time'].includes(r.status)).length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;
  const totalStudents = allStudents.length; // Total students enrolled in classroom

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/teacher')}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Attendance Records</h1>
                <p className="text-green-100 text-sm">Nahawan National High School</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Select Class
          </h2>
          <select
            value={selectedSchedule.id}
            onChange={(e) => handleScheduleChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            {teacher.schedules.map(schedule => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.subject} - {schedule.gradeLevel} {schedule.section} ({schedule.time}, {schedule.room})
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name or ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 md:flex-initial px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>

              <button
                onClick={handleMarkAbsences}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors font-medium whitespace-nowrap"
                title="Mark all unscanned students as absent for today"
              >
                <XCircle className="w-5 h-5" />
                Mark Absences
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade & Section</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{record.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.time}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.gradeLevel} - {record.section}
                      </td>
                      <td className="px-4 py-3">
                        {record.status === 'late' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-300 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Late
                          </span>
                        ) : record.status === 'on-time' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            On Time
                          </span>
                        ) : record.status === 'absent' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                            <XCircle className="w-4 h-4" />
                            Absent
                          </span>
                        ) : record.status === 'not-scanned' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                            <XCircle className="w-4 h-4" />
                            Not Scanned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!record.isPlaceholder ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit record"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No attendance records found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Class: <span className="font-semibold text-gray-800">{selectedSchedule.subject}</span></p>
              <p className="text-gray-600">Grade & Section: <span className="font-semibold text-gray-800">{selectedSchedule.gradeLevel} - {selectedSchedule.section}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Schedule: <span className="font-semibold text-gray-800">{selectedSchedule.time}</span></p>
              <p className="text-gray-600">Room: <span className="font-semibold text-gray-800">{selectedSchedule.room}</span></p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600">Total Records Showing: <span className="font-semibold text-gray-800">{filteredRecords.length}</span></p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Attendance Record</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Student</p>
                <p className="text-lg font-semibold text-gray-900">{editingRecord.studentName}</p>
                <p className="text-sm text-gray-600">ID: {editingRecord.studentId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="on-time">On Time</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  placeholder="HH:MM AM/PM"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}