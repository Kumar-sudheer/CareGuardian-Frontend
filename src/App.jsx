import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User, Lock, Activity, Heart, Smile, AlertTriangle, Phone, MessageSquare, Bot, X, BarChart2, ShieldCheck, Sun, Moon, Loader2, Sparkles, Send, Info, PhoneCall, Trash2, UserPlus } from 'lucide-react';

// This data now lives inside the component to fix any potential import errors.
const countryCodes = [
  { value: '+1', label: '+1 (USA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+7', label: '+7 (Russia)' },
  { value: '+55', label: '+55 (Brazil)' },
];

// Main App Component
const App = () => {
    const [auth, setAuth] = useState({ token: null, user: null });
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [healthData, setHealthData] = useState([]);
    const [emotionData, setEmotionData] = useState([]);
    const [latestHealth, setLatestHealth] = useState({ heartRate: '--', bloodPressure: '--' });
    const [latestEmotion, setLatestEmotion] = useState({ level: 'Safe', message: 'Feeling Calm' });
    const [contacts, setContacts] = useState([]);

    const handleLoginSuccess = (data) => {
        setAuth({ token: data.token, user: data.user });
    };
    
    const handleLogout = () => {
        setAuth({ token: null, user: null });
        setCurrentPage('dashboard');
    };

    const fetchData = async () => {
        if (!auth.user) return;
        
        try {
            const healthRes = await fetch(`http://localhost:3001/api/health/${auth.user.id}`);
            const healthJson = await healthRes.json();
            if (healthJson.length > 0) {
                 setHealthData(healthJson);
                 setLatestHealth(healthJson[healthJson.length-1]);
            } else {
                 setHealthData([]);
                 setLatestHealth({ heartRate: '--', bloodPressure: '--' });
            }

            const contactsRes = await fetch(`http://localhost:3001/api/contacts/${auth.user.id}`);
            const contactsJson = await contactsRes.json();
            setContacts(contactsJson);

        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };
    
    useEffect(() => {
        if (auth.user) {
            fetchData();
        }
    }, [auth.user]);


    const handleHealthUpdate = (newHealthEntry) => {
        const optimisticHealth = { ...newHealthEntry, name: `M${healthData.length + 1}` };
        setHealthData([...healthData, optimisticHealth]);
        setLatestHealth(optimisticHealth);
    };

    const handleEmotionUpdate = (newEmotionResult) => {
        setLatestEmotion(newEmotionResult);
        const newEmotionEntry = { name: `M${emotionData.length+1}`, level: newEmotionResult.level === 'Safe' ? 8 : (newEmotionResult.level === 'Warning' ? 4 : 2) };
        setEmotionData([...emotionData, newEmotionEntry]);
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    if (!auth.token) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className={`flex h-screen font-sans bg-gray-100 dark:bg-gray-900 transition-colors duration-300`}>
            <Navbar setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <PageContent 
                        currentPage={currentPage}
                        healthData={healthData}
                        emotionData={emotionData}
                        latestHealth={latestHealth}
                        latestEmotion={latestEmotion}
                        onHealthUpdate={handleHealthUpdate}
                        onEmotionUpdate={handleEmotionUpdate}
                        auth={auth}
                        contacts={contacts}
                        setContacts={setContacts}
                    />
                </main>
                <Footer />
            </div>
            <Chatbot />
        </div>
    );
};

// Login/Register Page Component
const LoginPage = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const onSubmit = async (data) => {
        const endpoint = isLoginView ? 'login' : 'register';
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'An error occurred.');
            
            if (isLoginView) {
                onLoginSuccess(result);
            } else {
                setIsLoginView(true);
                setError('Registration successful! Please log in.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4"><ShieldCheck className="w-16 h-16 text-blue-500" /></div>
                    <h1 className="text-3xl font-bold text-gray-800">{isLoginView ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="mt-2 text-gray-600">Your personal health companion.</p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {!isLoginView && (
                         <div className="relative">
                            <UserPlus className="absolute w-5 h-5 text-gray-400 top-3.5 left-4" />
                            <input {...register('name', { required: 'Name is required' })} type="text" placeholder="Full Name" className="w-full py-3 pl-12 pr-4 text-gray-700 bg-gray-100 rounded-lg"/>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                    )}
                     <div className="relative">
                        <User className="absolute w-5 h-5 text-gray-400 top-3.5 left-4" />
                        <input {...register('email', { required: 'Email is required' })} type="email" placeholder="Email" className="w-full py-3 pl-12 pr-4 text-gray-700 bg-gray-100 rounded-lg"/>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="relative">
                        <Lock className="absolute w-5 h-5 text-gray-400 top-3.5 left-4" />
                        <input {...register('password', { required: 'Password is required' })} type="password" placeholder="Password" className="w-full py-3 pl-12 pr-4 text-gray-700 bg-gray-100 rounded-lg"/>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex justify-center items-center disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Sign In' : 'Register')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-blue-500 hover:underline">
                        {isLoginView ? 'Need an account? Register' : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Navbar Component
const Navbar = ({ setCurrentPage, isDarkMode, setIsDarkMode, onLogout }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: User },
        { id: 'health', label: 'Health Status', icon: Activity },
        { id: 'emotion', label: 'Emotion Tracker', icon: Smile },
        { id: 'analysis', label: 'Analysis', icon: BarChart2 },
        { id: 'emergency', label: 'Emergency', icon: Phone },
    ];
    
    const [activePage, setActivePage] = useState('dashboard');

    const handleNavClick = (pageId) => {
        setActivePage(pageId);
        setCurrentPage(pageId);
    };

    return (
        <nav className="w-20 lg:w-64 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between shadow-lg">
            <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-10 p-2">
                    <ShieldCheck className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                    <span className="hidden lg:block text-2xl font-bold text-gray-800 dark:text-white">CareGuardian</span>
                </div>
                <ul>
                    {navItems.map(item => (
                        <li key={item.id} className="mb-2">
                            <button
                                onClick={() => handleNavClick(item.id)}
                                className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                                    activePage === item.id 
                                        ? 'bg-blue-500 text-white shadow-md' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="hidden lg:block ml-4 font-semibold">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col items-center lg:items-start">
                 <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center w-full p-3 mb-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                    {isDarkMode ? <Sun className="w-6 w-6"/> : <Moon className="w-6 w-6" />}
                    <span className="hidden lg:block ml-4 font-semibold">Toggle Mode</span>
                </button>
                <button onClick={onLogout} className="flex items-center w-full p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg">
                    <X className="h-6 w-6" />
                    <span className="hidden lg:block ml-4 font-semibold">Logout</span>
                </button>
            </div>
        </nav>
    );
};

// Page Content Router
const PageContent = (props) => {
    switch (props.currentPage) {
        case 'dashboard':
            return <Dashboard {...props} />;
        case 'health':
            return <HealthStatus {...props} />;
        case 'emotion':
            return <EmotionTracker {...props} />;
        case 'analysis':
            return <AnalysisCharts {...props} />;
        case 'emergency':
            return <EmergencyContacts {...props} />;
        default:
            return <Dashboard {...props} />;
    }
};

// Dashboard Component
const Dashboard = ({ latestHealth, latestEmotion, healthData, emotionData, auth }) => (
    <div className="space-y-6 animate-fade-in">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Welcome, {auth.user.name || 'User'}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your health summary for today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transform transition-transform hover:scale-105">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Heart Rate</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{latestHealth.heartRate} BPM</p>
                    </div>
                    <Heart className="w-12 h-12 text-red-500"/>
                </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transform transition-transform hover:scale-105">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Mood</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{latestEmotion.message.split(' ')[2] || 'Calm'}</p>
                    </div>
                     <Smile className={`w-12 h-12 ${latestEmotion.level === 'Safe' ? 'text-green-500' : latestEmotion.level === 'Warning' ? 'text-amber-500' : 'text-red-500'}`}/>
                </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transform transition-transform hover:scale-105">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Level</p>
                        <p className={`text-3xl font-bold ${latestEmotion.level === 'Safe' ? 'text-green-500' : latestEmotion.level === 'Warning' ? 'text-amber-500' : 'text-red-500'}`}>{latestEmotion.level}</p>
                    </div>
                    <ShieldCheck className={`w-12 h-12 ${latestEmotion.level === 'Safe' ? 'text-green-500' : latestEmotion.level === 'Warning' ? 'text-amber-500' : 'text-red-500'}`}/>
                </div>
            </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Health Suggestion</h2>
            <p className="text-gray-600 dark:text-gray-300">Your vitals look good. Remember to stay hydrated and take a short walk today to maintain your great health!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Heart Rate Trend</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={healthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Emotion Level Trend</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={emotionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Bar dataKey="level" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);


// Health Status Component
const HealthStatus = ({ onHealthUpdate, healthData, auth }) => {
    const { register, handleSubmit, reset } = useForm();
    
    const handleUpdate = async (data) => {
        const newHealthEntry = {
            heartRate: parseInt(data.heartRate),
            bloodPressure: parseInt(data.bloodPressure),
            userId: auth.user.id
        };
        try {
            const response = await fetch('http://localhost:3001/api/health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHealthEntry)
            });
            if (!response.ok) throw new Error("Failed to save health data");

            onHealthUpdate(newHealthEntry);
            reset();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Health Status</h1>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Update Your Health Vitals</h2>
                <form onSubmit={handleSubmit(handleUpdate)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heart Rate (BPM)</label>
                        <input type="number" {...register("heartRate", { required: true })} placeholder="e.g., 75" className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                    </div>
                     <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Systolic BP (mmHg)</label>
                        <input type="number" {...register("bloodPressure", { required: true })} placeholder="e.g., 120" className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">Update Vitals</button>
                </form>
            </div>
            
             <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Detailed Health Metrics</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" stroke="#9ca3af"/>
                        <YAxis yAxisId="left" stroke="#ef4444" />
                        <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate (BPM)" />
                        <Line yAxisId="right" type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} name="Systolic BP (mmHg)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Emotion Tracker Component
const EmotionTracker = ({ onEmotionUpdate, auth }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const sendSmsAlert = async () => {
        try {
            await fetch('http://localhost:3001/api/alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: auth.user.id, userName: auth.user.name })
            });
        } catch (error) {
            console.error("Failed to send SMS alert:", error);
        }
    };

    const analyzeEmotionWithAI = async () => {
        if (text.trim() === '') return;
        setIsLoading(true);
        setError('');
        setResult(null);
        setShowAlert(false);

        try {
            const prompt = `Analyze sentiment from: "${text}". Categorize as 'Danger', 'Warning', or 'Safe'. Respond ONLY with JSON: {"level": "...", "message": "..."}.`;
            
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };
            const apiKey = "AIzaSyBPFGv8HZ8AX9g756uRczKdQQAuz64XS9c";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed`);
            const apiResult = await response.json();
            
            if (apiResult.candidates && apiResult.candidates.length > 0) {
                const jsonText = apiResult.candidates[0].content.parts[0].text;
                const parsedResult = JSON.parse(jsonText);
                setResult(parsedResult);
                onEmotionUpdate(parsedResult);
                
                if (parsedResult.level === 'Danger' || parsedResult.level === 'Warning') {
                    setShowAlert(true);
                    sendSmsAlert();
                }
            } else { throw new Error("No content from API."); }
        } catch (err) {
            console.error(err);
            setError('Could not analyze mood. Please try again.');
        } finally { setIsLoading(false); }
    };
    
    const getRiskColor = (level) => {
        if (level === 'Danger') return 'text-red-500 border-red-500';
        if (level === 'Warning') return 'text-amber-500 border-amber-500';
        return 'text-green-500 border-green-500';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Emotion Tracker</h1>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">How are you feeling today?</h2>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe your feelings..." className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" rows="4"></textarea>
                <button onClick={analyzeEmotionWithAI} disabled={isLoading} className="mt-4 flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                    {isLoading ? 'Analyzing...' : '✨ Analyze with AI'}
                </button>
            </div>
             {error && <p className="mt-4 text-sm text-center text-red-500">{error}</p>}
            {result && (
                <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 ${getRiskColor(result.level).split(' ')[1]}`}>
                    <div className="flex items-center gap-4">
                        <AlertTriangle className={`w-8 h-8 ${getRiskColor(result.level).split(' ')[0]}`} />
                        <div>
                            <h3 className={`text-2xl font-bold ${getRiskColor(result.level).split(' ')[0]}`}>{result.level}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{result.message}</p>
                            <p className="text-xs text-right mt-2 text-indigo-400">Powered by Gemini</p>
                        </div>
                    </div>
                </div>
            )}
             {showAlert && (
                <div className="p-4 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 rounded-r-lg" role="alert">
                    <div className="flex">
                        <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4"/></div>
                        <div>
                            <p className="font-bold text-red-800 dark:text-red-200">Emergency Alert Sent</p>
                            <p className="text-sm text-red-700 dark:text-red-300">An SMS notification has been sent to your primary emergency contact.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// Analysis Charts Component
const AnalysisCharts = ({ healthData, emotionData }) => {
    const emotionDistributionData = [
        { name: 'Safe', value: 65 }, { name: 'Warning', value: 25 }, { name: 'Danger', value: 10 },
    ];
    const COLORS = { 'Safe': '#22c55e', 'Warning': '#f59e0b', 'Danger': '#ef4444' };

    return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Health & Mental Analysis</h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Comprehensive Health Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#ef4444" strokeWidth={2}/>
                        <Line type="monotone" dataKey="bloodPressure" name="Blood Pressure" stroke="#3b82f6" strokeWidth={2}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Emotional State Analysis</h2>
                 <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={emotionData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="name" stroke="#9ca3af"/>
                        <YAxis stroke="#9ca3af"/>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Bar dataKey="level" name="Emotion Level (1-10)" fill="#f59e0b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Overall Emotion Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={emotionDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {emotionDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.name]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
    );
};


// Emergency Contacts Component
const EmergencyContacts = ({ auth, contacts, setContacts }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [verifyingId, setVerifyingId] = useState(null);

    const addContact = async (data) => {
        const newContactData = { ...data, userId: auth.user.id };
        try {
            const response = await fetch('http://localhost:3001/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContactData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to add contact');
            
            setContacts([...contacts, result]);
            reset({name: '', relation: '', countryCode: '', phone: ''});
        } catch (error) {
            console.error(error);
        }
    };

    const deleteContact = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/api/contacts/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete contact');
            setContacts(contacts.filter(contact => contact.id !== id));
        } catch(error) { console.error(error); }
    };
    
    const verifyContact = async (contactId) => {
        setVerifyingId(contactId);
        try {
            const res = await fetch('http://localhost:3001/api/contacts/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId })
            });
            const result = await res.json();
            if (result.success) {
                setContacts(contacts.map(c => c.id === contactId ? { ...c, verified: 1 } : c));
            } else {
                alert(result.message || 'Verification failed.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during verification.');
        } finally {
            setVerifyingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Emergency Contacts</h1>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add New Contact</h2>
                <form onSubmit={handleSubmit(addContact)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                     <div className="w-full">
                        <input {...register("name", { required: "Name is required" })} placeholder="Name" className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                     </div>
                     <div className="w-full">
                        <input {...register("relation", { required: "Relation is required" })} placeholder="Relation" className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation.message}</p>}
                     </div>
                     <div className="w-full">
                        <select {...register("countryCode", { required: true })} className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg">
                            <option value="">Code</option>
                            {countryCodes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                         {errors.countryCode && <p className="text-red-500 text-xs mt-1">Code is required</p>}
                     </div>
                     <div className="w-full">
                        <input {...register("phone", { required: "Phone number is required", pattern: { value: /^[0-9-() ]{7,15}$/, message: "Invalid phone number" } })} placeholder="Phone Number" className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                     </div>
                     <button type="submit" className="py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors w-full">Add Contact</button>
                </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map(contact => (
                    <div key={contact.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col justify-between">
                        <div>
                             <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{contact.name}</h3>
                                {contact.verified ? (
                                    <span className="flex items-center text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-full">
                                        <ShieldCheck className="w-4 h-4 mr-1"/> Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
                                        <AlertTriangle className="w-4 h-4 mr-1"/> Unverified
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{contact.relation}</p>
                            <p className="text-lg font-medium text-blue-500 dark:text-blue-400 mt-2">{`${contact.countryCode} ${contact.phone}`}</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                             <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
                                <Phone className="w-4 h-4" /> Call Now
                             </button>
                            {!contact.verified && (
                                <button onClick={() => verifyContact(contact.id)} disabled={verifyingId === contact.id} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 disabled:opacity-50">
                                    {verifyingId === contact.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShieldCheck className="w-4 h-4" />}
                                    {verifyingId === contact.id ? 'Verifying...' : 'Verify Contact'}
                                </button>
                            )}
                             <button onClick={() => deleteContact(contact.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600">
                                <Trash2 className="w-4 h-4" /> Delete
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Chatbot Component
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am Guardian Bot, your AI assistant. How can I help you today? ✨' }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const chatHistory = useRef([]);

    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isTyping) return;
        
        const userMessage = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        chatHistory.current.push({ role: "user", parts: [{ text: input }] });

        try {
            const prompt = `You are Guardian Bot, a friendly and empathetic AI health assistant for a caretaking app. Your name is Guardian Bot. Keep your responses concise and helpful. Refer to different sections of the app if relevant (Dashboard, Health Status, Emotion Tracker, Analysis, Emergency). Here is the conversation so far:`;

            const payload = { contents: [ { role: "model", parts: [{ text: prompt }] }, ...chatHistory.current] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) throw new Error("API request failed");
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                const botResponseText = result.candidates[0].content.parts[0].text;
                const botMessage = { sender: 'bot', text: botResponseText };
                setMessages([...newMessages, botMessage]);
                chatHistory.current.push({ role: "model", parts: [{ text: botResponseText }] });
            } else { throw new Error("No response from bot"); }
        } catch (error) {
            console.error(error);
            const errorMessage = { sender: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' };
            setMessages([...newMessages, errorMessage]);
        } finally { setIsTyping(false); }
    };

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50">
                {isOpen ? <X className="w-8 h-8"/> : <Bot className="w-8 h-8" />}
            </button>
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col animate-fade-in-up z-50">
                    <div className="p-4 bg-blue-500 text-white rounded-t-2xl flex items-center gap-2"> <Sparkles className="w-6 h-6"/> <h3 className="font-bold text-lg">Guardian Bot</h3> </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`p-3 rounded-lg max-w-xs text-sm ${msg.sender === 'bot' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-blue-500 text-white'}`}>{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && (
                             <div className="flex justify-start">
                                <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                                    <div className="flex items-center justify-center space-x-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask me anything..." className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 dark:text-white border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isTyping}/>
                            <button onClick={handleSend} disabled={isTyping} className="ml-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Footer Component
const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600 dark:text-gray-300">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center"><Info className="mr-2 h-5 w-5"/>About Us</h3>
                    <p className="text-sm">CareGuardian is dedicated to providing peace of mind through smart health monitoring and instant support, helping you and your loved ones stay safe and healthy.</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center"><PhoneCall className="mr-2 h-5 w-5"/>Contact Us</h3>
                    <p className="text-sm">Email: support@careguardian.com</p>
                    <p className="text-sm">Phone: +18777804236</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center"><Send className="mr-2 h-5 w-5"/>Quick Query</h3>
                    <form className="flex gap-2">
                        <input type="email" placeholder="Your email for a reply" className="flex-1 p-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" />
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-600">Send</button>
                    </form>
                </div>
            </div>
        </footer>
    );
}

export default App;
