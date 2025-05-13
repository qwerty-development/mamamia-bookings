'use client'
import React, { useState, useEffect } from 'react';
import { ChevronDown, PlusCircle, X, Calendar, Clock, BarChart2 } from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface User {
  id: number;
  name: string;
  color: string;
}

interface Booking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userId: number;
  userName: string;
  color: string;
}

interface BookingWithDayInfo extends Booking {
  isFirstDay: boolean;
  isLastDay: boolean;
}

interface BookingsByDay {
  [day: number]: BookingWithDayInfo[];
}

interface Stats {
  userId: number;
  name: string;
  color: string;
  days: number;
}

// Mock images - in a real app, you'd import actual images
const BOAT_IMAGE = "/boat.JPG";
const FAMILY_IMAGE = "/family.JPG";

// User data with assigned colors
const USERS: User[] = [
  { id: 1, name: "Nabil Zahlan", color: "#FF5733" },
  { id: 2, name: "Kamal Zahlan", color: "#33A1FF" },
  { id: 3, name: "Mira Mouawad", color: "#AD33FF" }
];

// Props interface for confirmation dialog
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingName: string;
}

// Confirmation Dialog component
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, bookingName }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium">Confirm Deletion</h3>
          <p className="mt-2 text-gray-600">
            Are you sure you want to delete this booking?<br />
            <span className="font-medium">(You must be {bookingName})</span>
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Props interface for password screen
interface PasswordScreenProps {
  onPasswordSuccess: () => void;
}

// Component to handle the password protection
const PasswordScreen: React.FC<PasswordScreenProps> = ({ onPasswordSuccess }) => {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (password === "mamamia") {
      onPasswordSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Family Boat Bookings</h2>
          <p className="mt-2 text-sm text-gray-600">Enter password to access the booking system</p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {error && <p className="mt-2 text-sm text-red-600">Incorrect password</p>}
          </div>
          <div>
            <button
              onClick={(e: React.MouseEvent) => handleSubmit(e)}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Access Booking System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Props interface for date picker
interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  label: string;
}

// Create a DatePicker component
const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, label }) => {
  return (
    <div className="relative">
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Calendar size={16} className="text-gray-500" />
        </div>
        <input
          type="date"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

// Props interface for booking stats
interface BookingStatsProps {
  bookings: Booking[];
}

// Stats component to show booking statistics
const BookingStats: React.FC<BookingStatsProps> = ({ bookings }) => {
  // Calculate days booked per user
  const calculateStats = (): Stats[] => {
    const stats: Record<number, Stats> = {};
    
    // Initialize stats for all users
    USERS.forEach(user => {
      stats[user.id] = {
        userId: user.id,
        name: user.name,
        color: user.color,
        days: 0
      };
    });
    
    // Count days for each booking
    bookings.forEach(booking => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (stats[booking.userId]) {
        stats[booking.userId].days += days;
      }
    });
    
    return Object.values(stats);
  };
  
  const stats = calculateStats();
  const totalDays = stats.reduce((sum, user) => sum + user.days, 0);
  
  return (
    <div className="mb-8 p-4 bg-gray-50 text-black rounded-lg shadow-sm">
      <div className="flex items-center mb-3">
        <BarChart2 className="mr-2 text-blue-600" size={20} />
        <h3 className="text-lg  font-semibold">Booking Statistics</h3>
      </div>
      
      <div className="space-y-3 text-black">
        {stats.map(user => (
          <div key={user.userId} className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: user.color }}></div>
                <span className="font-medium">{user.name}</span>
              </div>
              <span className="font-semibold">{user.days} days</span>
            </div>
            <div className="w-full h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: totalDays > 0 ? `${(user.days / totalDays) * 100}%` : '0%',
                  backgroundColor: user.color 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
        <span className="font-medium">Total Days Booked:</span>
        <span className="font-bold">{totalDays} days</span>
      </div>
    </div>
  );
};

// Props interface for booking form
interface BookingFormProps {
  onClose: () => void;
  onSave: (booking: Booking) => void;
  existingBookings: Booking[];
}

// Create a BookingForm component
const BookingForm: React.FC<BookingFormProps> = ({ onClose, onSave, existingBookings }) => {
  const [userId, setUserId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  const handleSubmit = (): void => {
    // Validate form
    if (!userId || !startDate || !endDate) {
      setError("Please fill out all fields");
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (start >= end) {
      setError("End date must be after start date");
      return;
    }
    
    // Check for booking conflicts
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
    
    if (hasConflict) {
      setError("This time period overlaps with an existing booking");
      return;
    }
    
    // Get user data
    const user = USERS.find(u => u.id === parseInt(userId));
    
    if (!user) {
      setError("Invalid user selected");
      return;
    }
    
    // Create booking object - using user name as the title
    const newBooking: Booking = {
      id: Date.now().toString(),
      title: user.name,
      start,
      end,
      userId: parseInt(userId),
      userName: user.name,
      color: user.color
    };
    
    // Save booking
    onSave(newBooking);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex text-black items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">New Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Family Member
            </label>
            <div className="relative">
              <select
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={userId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserId(e.target.value)}
              >
                <option value="">Select a family member</option>
                {USERS.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <DatePicker
              selectedDate={startDate}
              onChange={setStartDate}
              label="Start Date"
            />
            <DatePicker
              selectedDate={endDate}
              onChange={setEndDate}
              label="End Date"
            />
          </div>
          
          {error && (
            <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Props interface for calendar event
interface CalendarEventProps {
  event: BookingWithDayInfo;
  day?: number;
  isFirstDay: boolean;
  isLastDay: boolean;
  onDelete: (id: string) => void;
}

// Simple Calendar Event component - Improved to always show name
const CalendarEvent: React.FC<CalendarEventProps> = ({ event, day, isFirstDay, isLastDay, onDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Determine styles based on position in multi-day booking
  const borderRadius = (() => {
    if (isFirstDay && isLastDay) return 'rounded';
    if (isFirstDay) return 'rounded-l';
    if (isLastDay) return 'rounded-r';
    return '';
  })();

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const confirmDelete = (): void => {
    onDelete(event.id);
    setShowConfirmation(false);
  };

  return (
    <>
      <div 
        className={`px-2 py-1 m-1 ${borderRadius} text-white flex justify-between items-center`}
        style={{ 
          backgroundColor: event.color,
          marginLeft: isFirstDay ? '4px' : '0',
          marginRight: isLastDay ? '4px' : '0',
          borderRight: isLastDay ? '' : 'none',
          borderLeft: isFirstDay ? '' : 'none'
        }}
      >
        {/* Show name on every day, not just first day */}
        <span className="truncate text-sm">
          {event.userName}
          {!isFirstDay && !isLastDay && " (cont.)"}
          {isLastDay && !isFirstDay && " (end)"}
        </span>
        
        {/* Show delete button on every day */}
        <button 
          onClick={handleDelete}
          className="ml-1 hover:bg-red-800 rounded-full p-1 text-white text-xs"
        >
          ✕
        </button>
      </div>
      
      {/* Confirmation dialog is connected here */}
      <ConfirmationDialog 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmDelete}
        bookingName={event.userName}
      />
    </>
  );
};

// Props interface for calendar
interface SimpleCalendarProps {
  bookings: Booking[];
  onDeleteBooking: (id: string) => void;
}

// Simple Calendar component
const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ bookings, onDeleteBooking }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>('month');
  
  // Get current month and year
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get first day of month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Create calendar days
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Get bookings for current month - include any booking that overlaps with this month
  const currentMonthBookings = bookings.filter(booking => {
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Check if booking overlaps with this month
    return (
      (startDate <= lastDay && endDate >= firstDay)
    );
  });
  
  // Group bookings by day and determine first/last days
  const bookingsByDay: BookingsByDay = {};
  currentMonthBookings.forEach(booking => {
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);
    
    // Loop through each day of the booking
    let currentDay = new Date(startDate);
    while (currentDay <= endDate) {
      // Only include days in the current month
      if (currentDay.getMonth() === month && currentDay.getFullYear() === year) {
        const day = currentDay.getDate();
        if (!bookingsByDay[day]) {
          bookingsByDay[day] = [];
        }
        
        // Determine if this is the first or last day of the booking
        const isFirstDay = 
          currentDay.getDate() === startDate.getDate() && 
          currentDay.getMonth() === startDate.getMonth() && 
          currentDay.getFullYear() === startDate.getFullYear();
        
        const isLastDay = 
          currentDay.getDate() === endDate.getDate() && 
          currentDay.getMonth() === endDate.getMonth() && 
          currentDay.getFullYear() === endDate.getFullYear();
        
        bookingsByDay[day].push({
          ...booking,
          isFirstDay,
          isLastDay
        });
      }
      // Move to the next day
      currentDay.setDate(currentDay.getDate() + 1);
    }
  });
  
  // Format month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Previous month
  const prevMonth = (): void => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  // Next month
  const nextMonth = (): void => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Previous
        </button>
        <h3 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h3>
        <button 
          onClick={nextMonth}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Next
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="py-2 text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`min-h-24 p-1 border rounded ${day ? 'bg-white' : 'bg-gray-100'}`}
          >
            {day && (
              <>
                <div className="text-sm font-medium">{day}</div>
                <div className="overflow-y-auto max-h-20">
                  {bookingsByDay[day]?.map(booking => (
                    <CalendarEvent 
                      key={`${booking.id}-${day}`} 
                      event={booking}
                      day={day}
                      isFirstDay={booking.isFirstDay}
                      isLastDay={booking.isLastDay}
                      onDelete={onDeleteBooking}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main application component
const BoatBookingApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Load bookings from localStorage on component mount
  useEffect(() => {
    const storedBookings = localStorage.getItem('boatBookings');
    if (storedBookings) {
      try {
        const parsedBookings = JSON.parse(storedBookings).map((booking: any) => ({
          ...booking,
          start: new Date(booking.start),
          end: new Date(booking.end)
        }));
        setBookings(parsedBookings);
      } catch (error) {
        console.error("Error parsing stored bookings:", error);
      }
    }
  }, []);
  
  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('boatBookings', JSON.stringify(bookings));
    }
  }, [bookings]);
  
  const handleBookingSave = (newBooking: Booking): void => {
    setBookings([...bookings, newBooking]);
  };
  
  const handleDeleteBooking = (bookingId: string): void => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    setBookings(updatedBookings);
    
    // Update localStorage
    if (updatedBookings.length > 0) {
      localStorage.setItem('boatBookings', JSON.stringify(updatedBookings));
    } else {
      localStorage.removeItem('boatBookings');
    }
  };
  
  if (!isAuthenticated) {
    return <PasswordScreen onPasswordSuccess={() => setIsAuthenticated(true)} />;
  }
  
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header with images */}
      <header className="px-4 py-6 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-800">Family Boat Bookings</h1>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg shadow-md">
            <img src={BOAT_IMAGE} alt="Our Family Boat" className="object-cover w-full h-48" />
            <div className="p-2 text-center bg-blue-100">
              <p className="font-medium text-blue-800">Our Beautiful Boat</p>
            </div>
          </div>
          
          <div className="w-full max-w-md overflow-hidden rounded-lg shadow-md">
            <img src={FAMILY_IMAGE} alt="Family Photo" className="object-cover w-full h-48" />
            <div className="p-2 text-center bg-blue-100">
              <p className="font-medium text-blue-800">Family Memories</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content with statistics and calendar */}
      <main className="container p-4 mx-auto my-8 bg-white rounded-lg shadow-lg">
        {/* Stats Section - New addition */}
        <BookingStats bookings={bookings} />
        
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Booking Calendar</h2>
          <div className="flex-grow"></div>
          {/* Legend */}
          <div className="flex items-center space-x-4">
            {USERS.map(user => (
              <div key={user.id} className="flex items-center">
                <div className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: user.color }}></div>
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Calendar component */}
        <div className="max-h-[600px]">
          <SimpleCalendar 
            bookings={bookings} 
            onDeleteBooking={handleDeleteBooking}
          />
        </div>
      </main>
      
      {/* Floating action button */}
      <button
        className="fixed p-4 text-white bg-blue-600 rounded-full shadow-lg bottom-8 right-8 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setShowBookingForm(true)}
      >
        <PlusCircle size={24} />
      </button>
      
      {/* Booking form modal */}
      {showBookingForm && (
        <BookingForm
          onClose={() => setShowBookingForm(false)}
          onSave={handleBookingSave}
          existingBookings={bookings}
        />
      )}
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <BoatBookingApp />
    </div>
  );
}