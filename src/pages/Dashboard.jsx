import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Target, TrendingUp, Calendar, Plus, Minus, Settings, BookOpen, Clock, Save, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AttendanceChart from '@/components/AttendanceChart';
import FloatingShapes from '@/components/FloatingShapes';
import { format } from 'date-fns';

// Dummy data - will be replaced with API call
const studentData = {
  "23IT101": {
    rollNo: "23IT101",
    name: "Alex Johnson",
    semester: 5,
    attended: 45,
    total: 60,
    percentage: 75,
    targetPercentage: 75,
    safeBunks: 2,
    mustAttend: 10,
    remainingClasses: 20,
    subjects: [
      { name: "Data Structures", attended: 12, total: 15, percentage: 80 },
      { name: "Operating Systems", attended: 8, total: 12, percentage: 67 },
      { name: "Database Management", attended: 15, total: 18, percentage: 83 },
      { name: "Computer Networks", attended: 10, total: 15, percentage: 67 }
    ],
    holidays: ["2024-01-15", "2024-01-26"]
  },
  "23IT102": {
    rollNo: "23IT102", 
    name: "Sarah Wilson",
    semester: 4,
    attended: 32,
    total: 40,
    percentage: 80,
    targetPercentage: 75,
    safeBunks: 5,
    mustAttend: 8,
    remainingClasses: 15,
    subjects: [
      { name: "Java Programming", attended: 9, total: 10, percentage: 90 },
      { name: "Web Development", attended: 8, total: 10, percentage: 80 },
      { name: "Software Engineering", attended: 7, total: 10, percentage: 70 },
      { name: "Mobile Computing", attended: 8, total: 10, percentage: 80 }
    ],
    holidays: ["2024-01-15", "2024-02-14"]
  }
};

const motivationalQuotes = [
  "📚 Consistency is the key to success!",
  "🎯 Every class attended is a step closer to your dreams!",
  "💫 Excellence is not an act, but a habit!",
  "🚀 Your future self will thank you for showing up today!",
  "⭐ Small steps daily lead to big results yearly!"
];

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const rollNo = searchParams.get('roll') || '23IT101';
  const student = studentData[rollNo] || studentData["23IT101"];
  
  const [targetPercentage, setTargetPercentage] = useState(student.targetPercentage);
  const [editingTarget, setEditingTarget] = useState(false);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [showRemoveHoliday, setShowRemoveHoliday] = useState(false);
  const [mustAttend, setMustAttend] = useState(student.mustAttend);
  const [safeBunks, setSafeBunks] = useState(student.safeBunks);
  const [subjectTargets, setSubjectTargets] = useState(
    student.subjects.reduce((acc, subject) => {
      acc[subject.name] = targetPercentage;
      return acc;
    }, {})
  );
  const [editingSubject, setEditingSubject] = useState(null);
  
  // New features state
  const [classesPerDay, setClassesPerDay] = useState({
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  });
  const [bunkClasses, setBunkClasses] = useState(0);
  const [projectedAttendance, setProjectedAttendance] = useState(null);
  const [showScheduleSetup, setShowScheduleSetup] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // Load timetable data from localStorage on mount and check if first-time user
  useEffect(() => {
    const savedTimetable = localStorage.getItem('classesPerDay');
    if (savedTimetable) {
      setClassesPerDay(JSON.parse(savedTimetable));
      setIsFirstTimeUser(false);
    } else {
      // First-time user, show the setup dialog
      setIsFirstTimeUser(true);
      setShowScheduleSetup(true);
    }
  }, []);
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Recalculate stats when target changes
  useEffect(() => {
    const currentPercentage = (student.attended / student.total) * 100;
    const requiredPercentage = targetPercentage;
    const totalClassesNeeded = Math.ceil((requiredPercentage * student.total - 100 * student.attended) / (100 - requiredPercentage));
    const newMustAttend = Math.max(0, totalClassesNeeded);
    const newSafeBunks = Math.max(0, student.remainingClasses - newMustAttend);
    
    setMustAttend(newMustAttend);
    setSafeBunks(newSafeBunks);
  }, [targetPercentage, student]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Save timetable to localStorage
  const saveClassesPerDay = () => {
    localStorage.setItem('classesPerDay', JSON.stringify(classesPerDay));
    setShowScheduleSetup(false);
    setIsFirstTimeUser(false);
  };
  
  // Calculate remaining classes from timetable
  const calculateRemainingClasses = () => {
    return Object.values(classesPerDay).reduce((sum, count) => sum + parseInt(count || 0), 0);
  };
  
  // Handle bunk calculator
  const calculateBunkProjection = () => {
    const remainingClasses = calculateRemainingClasses();
    
    if (bunkClasses > remainingClasses) {
      setProjectedAttendance({ error: "Cannot bunk more than remaining classes!" });
      return;
    }
    
    const newAttended = student.attended + (remainingClasses - bunkClasses);
    const newTotal = student.total + remainingClasses;
    const newPercentage = ((newAttended / newTotal) * 100).toFixed(2);
    
    setProjectedAttendance({
      percentage: newPercentage,
      attended: newAttended,
      total: newTotal
    });
  };
  
  useEffect(() => {
    if (bunkClasses > 0) {
      calculateBunkProjection();
    } else {
      setProjectedAttendance(null);
    }
  }, [bunkClasses]);

  const getSubjectStatus = (percentage, subjectTarget) => {
    if (percentage >= subjectTarget) return 'success';
    if (percentage >= subjectTarget - 5) return 'warning';
    return 'destructive';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'hsl(var(--success))';
      case 'warning': return 'hsl(var(--warning))';
      case 'destructive': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--primary))';
    }
  };

  const handleAddHoliday = (date) => {
    if (date) {
      console.log('Adding holiday for:', format(date, 'yyyy-MM-dd'));
      setShowAddHoliday(false);
      setSelectedDate(undefined);
    }
  };

  const handleRemoveHoliday = (date) => {
    if (date) {
      console.log('Removing holiday for:', format(date, 'yyyy-MM-dd'));
      setShowRemoveHoliday(false);
      setSelectedDate(undefined);
    }
  };

  const isHoliday = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return student.holidays.includes(dateStr);
  };


  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <FloatingShapes />
      
      {/* First-Time User Schedule Setup Dialog */}
      <Dialog open={showScheduleSetup} onOpenChange={setShowScheduleSetup}>
        <DialogContent className="max-w-4xl glass-card max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => isFirstTimeUser && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold neon-text text-center mb-2">
              📚 Welcome! Let's Set Up Your Weekly Schedule
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              Enter the number of classes you have on each weekday. This helps us calculate your attendance accurately.
            </p>
          </DialogHeader>

          <Alert className="my-4">
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              💡 <strong>Tip:</strong> Count only academic classes. Exclude breaks, sports, or library periods. You can edit this anytime later!
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-6">
            {days.map((day) => (
              <div key={day} className="glass-card p-4 space-y-3 hover-lift">
                <label className="text-lg font-bold text-primary block">{day}</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={classesPerDay[day]}
                  onChange={(e) => setClassesPerDay({
                    ...classesPerDay,
                    [day]: parseInt(e.target.value) || 0
                  })}
                  placeholder="0"
                  className="h-16 text-2xl text-center font-bold"
                />
                <p className="text-xs text-muted-foreground text-center">classes per day</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-foreground">Total Classes per Week</p>
                <p className="text-sm text-muted-foreground">Sum of all weekdays</p>
              </div>
              <div className="text-5xl font-bold text-primary neon-text animate-pulse-neon">
                {calculateRemainingClasses()}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {!isFirstTimeUser && (
              <Button 
                onClick={() => setShowScheduleSetup(false)} 
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={saveClassesPerDay} 
              variant="neon" 
              size="xl"
              className="flex-1 flex items-center gap-2"
              disabled={calculateRemainingClasses() === 0}
            >
              <Save className="h-5 w-5" />
              {isFirstTimeUser ? 'Continue to Dashboard' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="max-w-6xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="glass" size="icon" className="hover-lift">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold neon-text">
            📊 Dashboard
          </h1>
        </div>

        {/* Student Info Card */}
        <div className="glass-card hover-lift mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">{student.name}</h2>
              <p className="text-muted-foreground">Roll No: {student.rollNo} • Semester {student.semester}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-4xl font-bold neon-text">{student.percentage}%</div>
              <p className="text-sm text-muted-foreground">Current Attendance</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">Target:</p>
                {editingTarget ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={targetPercentage}
                      onChange={(e) => setTargetPercentage(Number(e.target.value))}
                      className="w-16 h-6 text-xs bg-background/50"
                      min="0"
                      max="100"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setEditingTarget(false)}
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-accent">{targetPercentage}%</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setEditingTarget(true)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart */}
          <div className="lg:col-span-1">
            <AttendanceChart attended={student.attended} total={student.total} target={targetPercentage} />
          </div>

          {/* Bunk Calculator & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bunk Calculator */}
            <div className="glass-card hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <h3 className="text-xl font-bold">🎯 Bunk Calculator</h3>
              </div>
              
              {safeBunks > 0 ? (
                <div className="text-center">
                  <div className="text-6xl font-bold text-success neon-text animate-pulse-neon mb-2">
                    {safeBunks}
                  </div>
                  <p className="text-lg text-success font-semibold">Safe Bunks Left! ✅</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can miss {safeBunks} more classes and still maintain {targetPercentage}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-destructive neon-text animate-pulse-neon mb-2">
                    ⚠️ 0 ⚠️
                  </div>
                  <p className="text-lg text-destructive font-semibold">No more bunks allowed!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Attend all remaining classes to maintain {targetPercentage}%
                  </p>
                </div>
              )}
            </div>

            {/* Future Projection */}
            <div className="glass-card hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-bold">🔮 Future Projection</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-center text-lg">
                  You must attend <span className="text-primary font-bold text-2xl neon-text">{mustAttend}</span> out of <span className="font-bold">{student.remainingClasses}</span> remaining classes to stay above {targetPercentage}%
                </p>
                
                <p className="text-xs text-muted-foreground text-center italic">
                  Unexpected holidays may decrease your allowable bunks.
                </p>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-neon animate-glow transition-all duration-1000 ease-out"
                      style={{ width: `${student.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span>0%</span>
                    <span className="font-bold">{targetPercentage}% Target</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card text-center">
                <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{student.attended}/{student.total}</div>
                <p className="text-sm text-muted-foreground">Classes Ratio</p>
              </div>
              <div className="glass-card text-center">
                <Target className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{student.remainingClasses}</div>
                <p className="text-sm text-muted-foreground">Classes Left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold neon-text mb-6">📚 Subject-wise Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {student.subjects.map((subject, index) => {
              const subjectTarget = subjectTargets[subject.name] || targetPercentage;
              const status = getSubjectStatus(subject.percentage, subjectTarget);
              const isEditingThis = editingSubject === subject.name;
              
              return (
                <div key={index} className="glass-card hover-lift">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-primary">{subject.name}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold ${
                        status === 'success' ? 'text-success' : 
                        status === 'warning' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {subject.percentage}%
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Target:</span>
                        {isEditingThis ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={subjectTarget}
                              onChange={(e) => setSubjectTargets({
                                ...subjectTargets,
                                [subject.name]: Number(e.target.value)
                              })}
                              className="w-12 h-5 text-xs bg-background/50 px-1"
                              min="0"
                              max="100"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => setEditingSubject(null)}
                            >
                              ✓
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-accent">{subjectTarget}%</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => setEditingSubject(subject.name)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={subject.percentage} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{subject.attended}/{subject.total} classes</span>
                      <span className={`font-medium ${
                        status === 'success' ? 'text-success' : 
                        status === 'warning' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {status === 'success' ? '✅ Above Target' : 
                         status === 'warning' ? '⚠️ Near Target' : '❌ Below Target'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Holiday Management */}
        <div className="glass-card hover-lift mb-8">
          <h3 className="text-xl font-bold neon-text mb-4">🗓️ Holiday Management</h3>
          <div className="flex flex-wrap gap-4">
            <Popover open={showAddHoliday} onOpenChange={setShowAddHoliday}>
              <PopoverTrigger asChild>
                <Button variant="glass" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Holiday
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    handleAddHoliday(date);
                  }}
                  initialFocus
                  className="rounded-md border glass-card"
                  modifiers={{
                    holiday: (date) => isHoliday(date)
                  }}
                  modifiersStyles={{
                    holiday: { backgroundColor: 'hsl(var(--destructive))', color: 'white', borderRadius: '4px' }
                  }}
                />
              </PopoverContent>
            </Popover>

            <Popover open={showRemoveHoliday} onOpenChange={setShowRemoveHoliday}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  Remove Holiday
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    handleRemoveHoliday(date);
                  }}
                  initialFocus
                  className="rounded-md border glass-card"
                  modifiers={{
                    holiday: (date) => isHoliday(date)
                  }}
                  modifiersStyles={{
                    holiday: { backgroundColor: 'hsl(var(--destructive))', color: 'white', borderRadius: '4px' }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="mt-4 p-3 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📅 Current holidays: {student.holidays.length} days marked
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Default: Every 2nd and 4th Saturday are holidays
            </p>
          </div>
        </div>

        {/* Edit Schedule Button */}
        <div className="glass-card hover-lift mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold neon-text mb-2">📚 Weekly Class Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Total classes per week: <span className="font-bold text-primary">{calculateRemainingClasses()}</span>
              </p>
            </div>
            <Button 
              onClick={() => setShowScheduleSetup(true)} 
              variant="glass"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Schedule
            </Button>
          </div>
        </div>

        {/* Attendance If I Bunk X Classes */}
        <div className="glass-card hover-lift mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-6 w-6 text-warning" />
            <h3 className="text-xl font-bold neon-text">🔮 Bunk Impact Calculator</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Check what your attendance will be if you bunk a certain number of classes
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Number of classes to bunk
              </label>
              <Input
                type="number"
                min="0"
                max={calculateRemainingClasses()}
                value={bunkClasses}
                onChange={(e) => setBunkClasses(parseInt(e.target.value) || 0)}
                placeholder="Enter number of classes"
                className="h-12"
              />
            </div>

            {projectedAttendance && (
              <Card className={`border-2 ${projectedAttendance.error ? 'border-destructive' : 'border-primary'}`}>
                <CardHeader>
                  <CardTitle className={projectedAttendance.error ? 'text-destructive' : 'text-primary'}>
                    {projectedAttendance.error ? '⚠️ Error' : '📊 Projected Attendance'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projectedAttendance.error ? (
                    <p className="text-destructive font-medium">{projectedAttendance.error}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className={`text-5xl font-bold neon-text ${
                          projectedAttendance.percentage >= targetPercentage ? 'text-success' : 'text-destructive'
                        }`}>
                          {projectedAttendance.percentage}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your attendance will be
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Attended</p>
                          <p className="text-lg font-bold text-foreground">{projectedAttendance.attended}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-foreground">{projectedAttendance.total}</p>
                        </div>
                      </div>

                      {projectedAttendance.percentage < targetPercentage && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Warning: Your attendance will fall below the {targetPercentage}% target!
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="glass-card text-center hover-lift">
          <div className="text-2xl font-bold neon-text animate-glow">
            {randomQuote}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Stay motivated and keep attending! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
