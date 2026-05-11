import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const client = generateClient();

const TIME_SLOTS = [
  "7:00 AM",
  "8:30 AM",
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
  "5:30 PM",
  "7:00 PM",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BookingForm() {
  const today = new Date();

  const [bookedSlots, setBookedSlots]   = useState({});
  const [viewYear, setViewYear]         = useState(today.getFullYear());
  const [viewMonth, setViewMonth]       = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [playerName, setPlayerName]     = useState("");
  const [submitted, setSubmitted]       = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        const { data: bookings, errors } = await client.models.Booking.list();
        if (errors?.length) throw new Error(errors[0].message);

        const slots = {};
        for (const b of bookings) {
          if (!slots[b.date]) slots[b.date] = [];
          slots[b.date].push(b.time);
        }
        setBookedSlots(slots);
      } catch (err) {
        setError("Failed to load bookings. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }
    loadBookings();
  }, []);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const getSlotsForDate   = (dateStr) => bookedSlots[dateStr] || [];
  const isFullyBooked     = (dateStr) => getSlotsForDate(dateStr).length === TIME_SLOTS.length;
  const isPartiallyBooked = (dateStr) => {
    const count = getSlotsForDate(dateStr).length;
    return count > 0 && count < TIME_SLOTS.length;
  };
  const isSlotBooked = (dateStr, slot) => getSlotsForDate(dateStr).includes(slot);
  const isPast = (day) => {
    const cellDate      = new Date(viewYear, viewMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < todayMidnight;
  };

  const isFormComplete =
    selectedDate !== null && selectedTime !== null && playerName.trim().length > 0;

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else                 { setViewMonth((m) => m - 1); }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else                  { setViewMonth((m) => m + 1); }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateClick = (day) => {
    const dateStr = toDateString(viewYear, viewMonth, day);
    if (isFullyBooked(dateStr) || isPast(day)) return;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setPlayerName("");
    setSubmitted(false);
  };

  const handleTimeClick = (slot) => setSelectedTime(slot);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { errors } = await client.models.Booking.create({
        playerName: playerName.trim(),
        date:       selectedDate,
        time:       selectedTime,
      });
      if (errors?.length) throw new Error(errors[0].message);

      setBookedSlots((prev) => {
        const current = prev[selectedDate] || [];
        return { ...prev, [selectedDate]: [...current, selectedTime] };
      });
      setSubmitted(true);
    } catch (err) {
      setError("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-500 text-sm">Loading court availability…</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Court Reserved!</h2>
          <p className="text-slate-500 text-sm mb-7">See you on the court!!!!!</p>
          <div className="bg-slate-800/70 rounded-xl p-4 text-left space-y-2.5 mb-8 border border-slate-700/40">
            <p className="text-sm">
              <span className="text-amber-400 font-semibold">Date — </span>
              <span className="text-slate-200">{selectedDate}</span>
            </p>
            <p className="text-sm">
              <span className="text-amber-400 font-semibold">Time — </span>
              <span className="text-slate-200">{selectedTime}</span>
            </p>
            <p className="text-sm">
              <span className="text-amber-400 font-semibold">Player — </span>
              <span className="text-slate-200">{playerName}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedDate(null);
              setSelectedTime(null);
              setPlayerName("");
            }}
            className="w-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-900 font-bold py-3 rounded-xl transition-all duration-150"
          >
            Book Another Court
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1e293b 0%, #020617 70%)" }}
    >
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <p className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">
            Jison Football Court
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Reserve Your Court
          </h1>
          <p className="text-slate-500 text-sm mt-2">Select a date to begin your booking</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">

          <div className="flex items-center justify-between px-5 py-4 bg-slate-800/60 border-b border-slate-700/50">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold tracking-wide">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 bg-slate-800/30 border-b border-slate-700/30">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-700/20 p-1">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`spacer-${idx}`} className="bg-slate-900 h-11 rounded-md" />;
              }

              const dateStr    = toDateString(viewYear, viewMonth, day);
              const booked     = isFullyBooked(dateStr);
              const partial    = isPartiallyBooked(dateStr);
              const past       = isPast(day);
              const isSelected = selectedDate === dateStr;
              const isToday    = dateStr === todayStr;
              const slotsLeft  = TIME_SLOTS.length - getSlotsForDate(dateStr).length;

              const cellBase  = "relative h-11 rounded-md flex flex-col items-center justify-center transition-all duration-150 ";
              const cellStyle =
                booked     ? "bg-red-950/70 cursor-not-allowed " :
                past       ? "opacity-25 cursor-not-allowed " :
                isSelected ? "bg-amber-400 shadow-lg shadow-amber-400/20 cursor-pointer " :
                partial    ? "bg-slate-900 ring-1 ring-amber-500/30 hover:bg-slate-800 cursor-pointer hover:ring-amber-500/60 " :
                             "bg-slate-900 hover:bg-slate-800 cursor-pointer hover:ring-1 hover:ring-amber-400/30 ";

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={booked || past}
                  title={
                    booked  ? "Fully Booked" :
                    partial ? `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} remaining` :
                    undefined
                  }
                  className={cellBase + cellStyle}
                >
                  {isToday && !isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                  <span
                    className={`text-sm font-medium leading-none ${
                      booked     ? "text-red-400 line-through" :
                      past       ? "text-slate-600" :
                      isSelected ? "text-slate-900 font-bold" :
                                   "text-slate-200"
                    }`}
                  >
                    {day}
                  </span>
                  {booked && (
                    <span className="text-[8px] font-bold text-red-500 tracking-widest mt-0.5 uppercase">
                      full
                    </span>
                  )}
                  {partial && !isSelected && (
                    <span className="text-[8px] font-semibold text-amber-500 mt-0.5">
                      {slotsLeft} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 px-5 py-3.5 border-t border-slate-700/40 bg-slate-800/20">
            <LegendItem color="bg-red-950/70 border border-red-800/40"   label="Fully Booked"     />
            <LegendItem color="bg-slate-900 ring-1 ring-amber-500/40"    label="Partially Booked" />
            <LegendItem color="bg-amber-400"                              label="Selected"         />
            <LegendItem color="bg-slate-800 border border-slate-600/50"  label="Available"        />
          </div>
        </div>

        {selectedDate && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">

            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-white font-semibold">Select a Time Slot</h2>
                <span className="ml-auto text-xs text-slate-500 tabular-nums">{selectedDate}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {getSlotsForDate(selectedDate).length === 0
                  ? "All slots available"
                  : `${TIME_SLOTS.length - getSlotsForDate(selectedDate).length} of ${TIME_SLOTS.length} slots remaining`}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const slotTaken  = isSlotBooked(selectedDate, slot);
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTimeClick(slot)}
                      disabled={slotTaken}
                      className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        slotTaken
                          ? "bg-slate-800/40 text-slate-600 border border-slate-800/60 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-amber-400 text-slate-900 font-bold shadow-md shadow-amber-400/25"
                          : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-amber-400/30"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedTime && (
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <h2 className="text-white font-semibold">Player Details</h2>
                </div>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/40 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isFormComplete || isSubmitting}
                  className={`mt-4 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                    isFormComplete && !isSubmitting
                      ? "bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-900 shadow-lg shadow-amber-400/20"
                      : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming…
                    </>
                  ) : isFormComplete ? "Confirm Reservation →" : "Enter your name to continue"}
                </button>
              </div>
            )}
          </form>
        )}

        {!selectedDate && (
          <p className="text-center text-slate-600 text-sm mt-4">
            Select an available date above to begin your booking
          </p>
        )}

      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}
