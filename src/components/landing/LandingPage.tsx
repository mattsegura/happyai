import { useState } from 'react';
import {
  Sparkles,
  Heart,
  Brain,
  Trophy,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  Flame,
  Award,
  Clock,
  Smile
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Sparkles,
      title: "Morning Pulse Check",
      description: "Start your day with a quick emotional check-in. Build streaks, earn 15 points, and track your wellness journey.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: MessageSquare,
      title: "Class Pulse Questions",
      description: "Teachers create engaging questions, students respond before midnight. Earn 20 points and share your thoughts.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Hapi Moments",
      description: "Recognize classmates for kindness and support. Both sender and recipient earn 5 points while building community.",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: Brain,
      title: "AI-Powered Support",
      description: "Chat with Hapi AI for emotional support, study tips, task planning, and personalized guidance anytime.",
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: Trophy,
      title: "Class Leaderboards",
      description: "Compete with classmates in a positive way. Track rankings, celebrate achievements, and stay motivated.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Sentiment Analytics",
      description: "Visualize your emotional journey with beautiful charts. Understand patterns and celebrate your growth.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Points & Levels",
      description: "Earn points for every action, level up every 100 points, and unlock achievements as you grow.",
      color: "from-orange-400 to-yellow-500"
    },
    {
      icon: Target,
      title: "Daily Tasks Hub",
      description: "See all your tasks in one place. Morning pulses, class questions, meetings, and moments organized perfectly.",
      color: "from-teal-400 to-cyan-500"
    }
  ];

  const studentBenefits = [
    { icon: TrendingUp, text: "Track your emotional wellness journey with beautiful visualizations" },
    { icon: Trophy, text: "Earn points, level up, and compete on class leaderboards" },
    { icon: Heart, text: "Connect with classmates through Hapi Moments peer recognition" },
    { icon: Brain, text: "Get AI-powered support for stress, studying, and task management" },
    { icon: Flame, text: "Build healthy daily habits with streak tracking and rewards" },
    { icon: CheckCircle, text: "Stay organized with a centralized daily tasks dashboard" }
  ];

  const teacherBenefits = [
    { icon: BarChart3, text: "Monitor real-time class sentiment and emotional wellness trends" },
    { icon: MessageSquare, text: "Create engaging pulse questions to check in with students" },
    { icon: Users, text: "Foster supportive classroom communities and peer connections" },
    { icon: Target, text: "Identify students who may need additional support or resources" },
    { icon: Award, text: "Track class engagement with detailed analytics and insights" },
    { icon: BookOpen, text: "Use AI-powered insights to inform teaching strategies" }
  ];

  const stats = [
    { number: "10k+", label: "Daily Check-ins" },
    { number: "95%", label: "Student Engagement" },
    { number: "500+", label: "Active Classes" },
    { number: "50k+", label: "Hapi Moments Sent" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smile className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Hapi.ai
                </h1>
                <p className="hidden sm:block text-xs text-gray-600 font-medium">Emotional Wellness Platform</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-cyan-600 font-semibold transition-colors">
                Features
              </a>
              <a href="#students" className="text-gray-600 hover:text-cyan-600 font-semibold transition-colors">
                For Students
              </a>
              <a href="#teachers" className="text-gray-600 hover:text-cyan-600 font-semibold transition-colors">
                For Teachers
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onGetStarted}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                Get Started
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-cyan-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 space-y-2 animate-in slide-in-from-top duration-300">
              <a
                href="#features"
                className="block px-4 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg font-semibold transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#students"
                className="block px-4 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg font-semibold transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Students
              </a>
              <a
                href="#teachers"
                className="block px-4 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg font-semibold transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Teachers
              </a>
            </div>
          )}
        </div>
      </nav>

      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/40 via-blue-100/40 to-teal-100/40"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-cyan-100 px-4 py-2 rounded-full mb-6 sm:mb-8">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-bold text-cyan-700">Transforming Student Wellness</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Where Emotional Wellness
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Meets Academic Success
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 sm:mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
              Hapi empowers students and teachers to build supportive communities through daily check-ins,
              AI-powered guidance, and meaningful peer connections. Track emotions, earn rewards, and grow together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-white text-cyan-600 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl border-2 border-cyan-200 hover:border-cyan-400 transform hover:scale-105 transition-all duration-300"
              >
                Try Demo Account
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-cyan-100 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-3xl mx-auto">
              A comprehensive platform designed to support emotional wellness, foster connections, and celebrate growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl border-2 border-gray-100 hover:border-cyan-200 transform hover:scale-105 transition-all duration-300"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="students" className="relative overflow-hidden py-12 sm:py-20 lg:py-24 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">For Students</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Your Personal Wellness Journey
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                Take control of your emotional wellness while earning points, building streaks, and connecting with classmates
                in meaningful ways. Hapi makes wellness engaging and rewarding.
              </p>

              <div className="space-y-4">
                {studentBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-4 bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed pt-1">{benefit.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-cyan-200">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold opacity-90">Your Level</div>
                        <div className="text-4xl font-black">12</div>
                      </div>
                      <Zap className="w-12 h-12 opacity-80" />
                    </div>
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                      <div className="bg-white h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="text-xs font-semibold mt-2 opacity-90">65/100 points to next level</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200">
                      <Flame className="w-8 h-8 text-blue-600 mb-2" />
                      <div className="text-2xl font-black text-blue-600">14</div>
                      <div className="text-xs text-blue-700 font-semibold">Day Streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 border-2 border-cyan-200">
                      <Trophy className="w-8 h-8 text-cyan-600 mb-2" />
                      <div className="text-2xl font-black text-cyan-600">1,165</div>
                      <div className="text-xs text-cyan-700 font-semibold">Points</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 border-2 border-teal-200">
                      <Heart className="w-8 h-8 text-teal-600 mb-2" />
                      <div className="text-2xl font-black text-teal-600">23</div>
                      <div className="text-xs text-teal-700 font-semibold">Moments</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Sarah sent you a Hapi Moment!</div>
                        <div className="text-xs text-gray-600 font-medium">Thanks for helping with homework</div>
                      </div>
                    </div>
                    <div className="text-sm text-pink-700 font-semibold">+5 points earned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="teachers" className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-blue-200">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-8 h-8" />
                      <div>
                        <div className="text-sm font-semibold opacity-90">Biology II</div>
                        <div className="text-2xl font-black">Class Overview</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-3xl font-black">28</div>
                        <div className="text-xs opacity-90">Students</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black">95%</div>
                        <div className="text-xs opacity-90">Response Rate</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black">4.2</div>
                        <div className="text-xs opacity-90">Avg Sentiment</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">Recent Pulse Question</h3>
                      <Clock className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-4">
                      "How confident do you feel about tomorrow's quiz?"
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-cyan-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-cyan-600">24/28</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                      <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                      <div className="text-xl font-black text-green-600">Improving</div>
                      <div className="text-xs text-green-700 font-semibold">Class Sentiment</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                      <Award className="w-8 h-8 text-blue-600 mb-2" />
                      <div className="text-xl font-black text-blue-600">High</div>
                      <div className="text-xs text-blue-700 font-semibold">Engagement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 bg-cyan-100 px-4 py-2 rounded-full mb-6">
                <Users className="w-5 h-5 text-cyan-600" />
                <span className="text-sm font-bold text-cyan-700">For Teachers</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                Understand and Support Every Student
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                Get real-time insights into class sentiment, identify students who need support, and foster a positive
                learning environment with data-driven emotional intelligence.
              </p>

              <div className="space-y-4">
                {teacherBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-4 bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed pt-1">{benefit.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32 bg-gradient-to-br from-cyan-500 via-blue-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Ready to Transform Your Classroom Experience?
          </h2>
          <p className="text-lg sm:text-xl text-cyan-50 mb-10 leading-relaxed font-medium">
            Join thousands of students and teachers building healthier, more connected learning communities.
            Start your journey today with a free demo account.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto group px-8 py-5 bg-white text-cyan-600 text-lg font-black rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Create Demo Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-5 bg-transparent text-white text-lg font-black rounded-2xl border-3 border-white/40 hover:bg-white/10 hover:border-white transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Sign In to Account
            </button>
          </div>

          <p className="mt-8 text-cyan-100 text-sm font-medium">
            No credit card required • Start using in 60 seconds • Full-featured demo with sample data
          </p>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Smile className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Hapi.ai
                </h3>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                Empowering students and teachers to build supportive communities through emotional wellness.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-cyan-400">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#students" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    For Students
                  </a>
                </li>
                <li>
                  <a href="#teachers" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    For Teachers
                  </a>
                </li>
                <li>
                  <button onClick={onGetStarted} className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-cyan-400">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-cyan-400">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm font-medium">
                © 2025 Hapi.ai. All rights reserved. Built with care for student wellness.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-gray-400 text-sm font-medium">Made for educators and students</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
