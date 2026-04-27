import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Keyboard, ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react';
import { type ClassSchedule, type Teacher, type Student } from '../data/schoolData';
import * as api from '../services/api';
import { toast } from 'sonner';
import QrScanner from 'react-qr-scanner';

interface ScanResult {
  studentId: string;
  name: string;
  gradeLevel: string;
  time: string;
  success: boolean;
  status?: string;
}

// Helper function to determine attendance status
// NEW LOGIC: on-time ≤15min from start, late >15min until end, absent if not scanned
function determineAttendanceStatus(scheduleTime: string, currentTime: string): string {
  try {
    // Parse schedule time (e.g., "8:00 AM - 9:30 AM")
    const timeParts = scheduleTime.split('-').map(t => t.trim());
    const startTime = timeParts[0];
    const endTime = timeParts[1];

    // Convert times to minutes for comparison
    const scheduleStartMinutes = timeToMinutes(startTime);
    const scheduleEndMinutes = timeToMinutes(endTime);
    const currentMinutes = timeToMinutes(currentTime);

    const diffFromStart = currentMinutes - scheduleStartMinutes;
    const diffFromEnd = currentMinutes - scheduleEndMinutes;

    // Before class starts: too early, mark as on-time anyway
    if (diffFromStart < 0) {
      return 'on-time';
    }
    // Within first 15 minutes of class start: ON-TIME
    else if (diffFromStart >= 0 && diffFromStart <= 15) {
      return 'on-time';
    }
    // After 15 minutes but before class ends: LATE
    else if (diffFromStart > 15 && diffFromEnd <= 0) {
      return 'late';
    }
    // After class ended: also LATE
    else if (diffFromEnd > 0) {
      return 'late';
    }
    else {
      return 'on-time'; // Default
    }
  } catch (error) {
    console.error('Error determining attendance status:', error);
    return 'on-time'; // Default to on-time if time parsing fails
  }
}

// Convert time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Check if today matches the schedule days
function isScheduledDay(scheduleDays: string): boolean {
  const today = new Date();
  const dayIndex = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[dayIndex];
  const todayShort = todayName.substring(0, 3); // Mon, Tue, etc.

  // Normalize schedule days string (remove spaces, convert to lowercase)
  const normalizedDays = scheduleDays.toLowerCase().replace(/\s/g, '');

  // Check for common patterns
  if (normalizedDays.includes('mon-fri') || normalizedDays.includes('monday-friday')) {
    // Monday to Friday (weekdays)
    return dayIndex >= 1 && dayIndex <= 5;
  }

  if (normalizedDays.includes('daily') || normalizedDays.includes('everyday')) {
    return true;
  }

  // Special handling for abbreviated day patterns (MWF, TTh, etc.)
  const dayAbbreviations: { [key: string]: number[] } = {
    'm': [1],    // Monday
    't': [2],    // Tuesday
    'w': [3],    // Wednesday
    'th': [4],   // Thursday
    'f': [5],    // Friday
    's': [6],    // Saturday
    'su': [0]    // Sunday
  };

  // Check if it's an abbreviated format like "MWF" or "TTh"
  if (normalizedDays.length <= 4 && /^[mtwfs]+$/.test(normalizedDays)) {
    // Parse abbreviated days
    let pos = 0;
    const scheduledDayIndices: number[] = [];

    while (pos < normalizedDays.length) {
      // Check for two-letter abbreviations first (Th)
      if (pos < normalizedDays.length - 1 && normalizedDays.substring(pos, pos + 2) === 'th') {
        scheduledDayIndices.push(4); // Thursday
        pos += 2;
      } else if (pos < normalizedDays.length - 1 && normalizedDays.substring(pos, pos + 2) === 'su') {
        scheduledDayIndices.push(0); // Sunday
        pos += 2;
      } else {
        // Single letter abbreviation
        const letter = normalizedDays[pos];
        if (dayAbbreviations[letter]) {
          scheduledDayIndices.push(...dayAbbreviations[letter]);
        }
        pos += 1;
      }
    }

    return scheduledDayIndices.includes(dayIndex);
  }

  // Check if today's day is in the schedule string (full name or short form)
  return normalizedDays.includes(todayName.toLowerCase()) ||
         normalizedDays.includes(todayShort.toLowerCase());
}

export default function Scanner() {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualId, setManualId] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  useEffect(() => {
    const teacherData = sessionStorage.getItem('teacherData');
    const scheduleId = sessionStorage.getItem('selectedScheduleId');

    if (!teacherData) {
      navigate('/');
      return;
    }

    const foundTeacher = JSON.parse(teacherData);

    // Ensure schedules is always an array
    if (!foundTeacher.schedules || !Array.isArray(foundTeacher.schedules)) {
      foundTeacher.schedules = [];
    }

    const foundSchedule = foundTeacher.schedules.find((s: ClassSchedule) => s.id === scheduleId);

    if (!foundSchedule) {
      navigate('/teacher');
      return;
    }

    setTeacher(foundTeacher);
    setSchedule(foundSchedule);

    // Load students for this classroom
    if (foundSchedule.classroomId) {
      loadStudents(parseInt(foundSchedule.classroomId));
    } else {
      // Fallback to old method if no classroomId (for backward compatibility)
      loadStudentsByGradeSection(foundSchedule.gradeLevel, foundSchedule.section);
    }
  }, [navigate]);

  const loadStudents = async (classroomId: number) => {
    const result = await api.getStudentsByClassroom(classroomId);
    if (result.data && result.data.students) {
      setClassStudents(result.data.students);
      console.log(`✓ Loaded ${result.data.students.length} students from classroom ${classroomId}`);
    } else if (result.error) {
      toast.error(result.error);
      console.error('Error loading students:', result.error);
    }
  };

  const loadStudentsByGradeSection = async (gradeLevel: string, section: string) => {
    const result = await api.getStudentsByClass(gradeLevel, section);
    if (result.data) {
      setClassStudents(result.data);
      console.log(`✓ Loaded ${result.data.length} students from ${gradeLevel} - ${section}`);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleScan = async (studentId: string) => {
    if (!schedule || !teacher) return;

    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toISOString().split('T')[0];

    // CHECK 1: Validate if today is a scheduled day
    if (!isScheduledDay(schedule.days)) {
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = dayNames[today.getDay()];

      const errorMessage = `This class is not scheduled for ${todayName}. Schedule: ${schedule.days}`;
      const newResult: ScanResult = {
        studentId,
        name: errorMessage,
        gradeLevel: 'WRONG DAY',
        time: currentTime,
        success: false
      };
      setScanResults([newResult, ...scanResults]);
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#fff3cd',
          border: '2px solid #ffc107',
          color: '#856404'
        }
      });
      setManualId('');
      return;
    }

    // CHECK 2: Validate the QR code format and existence
    const validation = await api.validateQRCode(studentId);

    if (!validation.data || !validation.data.valid) {
      // Invalid QR code
      const errorMessage = validation.data?.error || 'Invalid QR code';
      const newResult: ScanResult = {
        studentId,
        name: errorMessage,
        gradeLevel: 'ERROR',
        time: currentTime,
        success: false
      };
      setScanResults([newResult, ...scanResults]);
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#fee',
          border: '2px solid #f44',
          color: '#900'
        }
      });
      setManualId('');
      return;
    }

    const student = validation.data.student;

    // Check if student is in this class
    const isInClass = classStudents.some(s => s.studentId === studentId);
    if (!isInClass) {
      const newResult: ScanResult = {
        studentId,
        name: `${student.name} (Wrong Class)`,
        gradeLevel: student.gradeLevel,
        time: currentTime,
        success: false
      };
      setScanResults([newResult, ...scanResults]);
      toast.error(`${student.name} is not enrolled in this class`, {
        duration: 4000
      });
      setManualId('');
      return;
    }

    // Determine attendance status based on time
    const attendanceStatus = determineAttendanceStatus(schedule.time, currentTime);

    // Valid student in correct class - record attendance
    const attendanceData = {
      studentId: student.studentId,
      studentName: student.name,
      gradeLevel: student.gradeLevel,
      section: student.section,
      classroomId: student.classroomId,
      subject: schedule.subject,
      teacherId: teacher.teacherId,
      date: currentDate,
      time: currentTime,
      status: attendanceStatus
    };

    const result = await api.recordAttendance(attendanceData);

    if (result.data) {
      const newResult: ScanResult = {
        studentId,
        name: student.name,
        gradeLevel: student.gradeLevel,
        time: currentTime,
        success: true,
        status: attendanceStatus
      };
      setScanResults([newResult, ...scanResults]);

      // Different messages and colors based on status
      let message = `✓ ${student.name}`;
      let toastStyle = {
        background: '#efe',
        border: '2px solid #4a4',
        color: '#060'
      };

      if (attendanceStatus === 'late') {
        message += ' - LATE';
        toastStyle = {
          background: '#ffe',
          border: '2px solid #f90',
          color: '#630'
        };
      } else {
        message += ' - On Time';
      }

      toast.success(message, {
        duration: 3000,
        style: toastStyle
      });
    } else if (result.error) {
      toast.error(result.error);
    }

    setManualId('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      handleScan(manualId.trim());
    }
  };

  const handleQRScan = (data: any) => {
    if (data && data.text) {
      setIsScanning(false);
      handleScan(data.text);
    }
  };

  const handleQRError = (err: any) => {
    console.error(err);
    toast.error('Error accessing camera. Please check permissions.');
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  if (!teacher || !schedule) {
    return <div>Loading...</div>;
  }

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
                <h1 className="text-2xl font-bold">QR Code Scanner</h1>
                <p className="text-green-100 text-sm">Nahawan National High School</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-800 font-medium">Subject</p>
              <p className="text-lg font-semibold text-gray-900">{schedule.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">Class</p>
              <p className="text-lg font-semibold text-gray-900">{schedule.gradeLevel} - {schedule.section}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">Schedule</p>
              <p className="text-lg font-semibold text-gray-900">{schedule.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">Room</p>
              <p className="text-lg font-semibold text-gray-900">{schedule.room}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{classStudents.length}</span> students enrolled in this class
            </p>
          </div>
        </div>

        {/* Scan Mode Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Scan Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setScanMode('camera')}
              className={`p-6 rounded-xl border-2 transition-all ${
                scanMode === 'camera'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Camera className={`w-12 h-12 mx-auto mb-3 ${
                scanMode === 'camera' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-800 mb-1">QR Code Scanner</h3>
              <p className="text-sm text-gray-600">Use camera to scan QR codes</p>
            </button>

            <button
              onClick={() => setScanMode('manual')}
              className={`p-6 rounded-xl border-2 transition-all ${
                scanMode === 'manual'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Keyboard className={`w-12 h-12 mx-auto mb-3 ${
                scanMode === 'manual' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-800 mb-1">Manual Entry</h3>
              <p className="text-sm text-gray-600">Type student ID manually</p>
            </button>
          </div>
        </div>

        {/* Scanner Interface */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {scanMode === 'camera' ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code Camera Scanner</h3>
              {isScanning ? (
                <div className="space-y-4">
                  <div className="bg-black rounded-xl overflow-hidden" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <QrScanner
                      delay={300}
                      onError={handleQRError}
                      onScan={handleQRScan}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button
                    onClick={stopScanning}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Stop Scanning
                  </button>
                  <p className="text-sm text-gray-600">Position the QR code within the camera frame</p>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-12 mb-6">
                  <Camera className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-6">
                    Start the camera to scan student QR codes
                  </p>
                  <button
                    onClick={startScanning}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Start QR Scanner
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Student ID</h3>
              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter 12-digit LRN (e.g., 177109400001)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Scan
                </button>
              </form>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
                <p className="font-semibold mb-2">Students in this class:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {classStudents && classStudents.length > 0 ? classStudents.slice(0, 6).map(student => (
                    <div key={student.id} className="text-xs">
                      • {student.studentId} - {student.name}
                    </div>
                  )) : <div className="text-xs text-gray-500">No students enrolled</div>}
                  {classStudents && classStudents.length > 6 && (
                    <div className="text-xs text-gray-500">
                      ...and {classStudents.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scan Results */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Scan Results ({scanResults.length})
          </h2>
          
          {scanResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>No scans yet. Start scanning student IDs!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scanResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      result.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {result.success ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${
                          result.success ? 'text-gray-800' : 'text-red-800'
                        }`}>
                          {result.name}
                        </p>
                        {result.success && result.status && (
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            result.status === 'late'
                              ? 'bg-orange-100 text-orange-700 border border-orange-300'
                              : 'bg-green-100 text-green-700 border border-green-300'
                          }`}>
                            {result.status === 'late' ? 'LATE' : 'On Time'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        ID: {result.studentId} • {result.gradeLevel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{result.time}</p>
                    <p className={`text-sm font-semibold ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? 'Success' : 'Not Found'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}