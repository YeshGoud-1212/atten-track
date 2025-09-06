import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AttendanceChart from '@/components/AttendanceChart';
import FloatingShapes from '@/components/FloatingShapes';

// Dummy data - will be replaced with API call
const studentData = {
  "23IT101": {
    rollNo: "23IT101",
    name: "Alex Johnson",
    semester: 5,
    attended: 45,
    total: 60,
    percentage: 75,
    safeBunks: 2,
    mustAttend: 10,
    remainingClasses: 20
  },
  "23IT102": {
    rollNo: "23IT102", 
    name: "Sarah Wilson",
    semester: 4,
    attended: 32,
    total: 40,
    percentage: 80,
    safeBunks: 5,
    mustAttend: 8,
    remainingClasses: 15
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
  const student = studentData[rollNo as keyof typeof studentData] || studentData["23IT101"];
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <FloatingShapes />
      
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
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart */}
          <div className="lg:col-span-1">
            <AttendanceChart attended={student.attended} total={student.total} />
          </div>

          {/* Bunk Calculator & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bunk Calculator */}
            <div className="glass-card hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <h3 className="text-xl font-bold">🎯 Bunk Calculator</h3>
              </div>
              
              {student.safeBunks > 0 ? (
                <div className="text-center">
                  <div className="text-6xl font-bold text-success neon-text animate-pulse-neon mb-2">
                    {student.safeBunks}
                  </div>
                  <p className="text-lg text-success font-semibold">Safe Bunks Left! ✅</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can miss {student.safeBunks} more classes and still maintain 75%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-destructive neon-text animate-pulse-neon mb-2">
                    ⚠️ 0 ⚠️
                  </div>
                  <p className="text-lg text-destructive font-semibold">No more bunks allowed!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Attend all remaining classes to maintain 75%
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
                  You must attend <span className="text-primary font-bold text-2xl neon-text">{student.mustAttend}</span> out of <span className="font-bold">{student.remainingClasses}</span> remaining classes to stay above 75%
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
                    <span className="font-bold">75% Target</span>
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