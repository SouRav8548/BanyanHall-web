import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function MealControl({ profile, roleName, isMealUpdating, toggleMealStatus }) {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [timeMessage, setTimeMessage] = useState('');
  const [nextMeal, setNextMeal] = useState('');
  
  // Guest Counters
  const [guestVeg, setGuestVeg] = useState(0);
  const [guestEgg, setGuestEgg] = useState(0);
  const [guestFish, setGuestFish] = useState(0);
  const [guestChicken, setGuestChicken] = useState(0);
  const [isGuestUpdating, setIsGuestUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setGuestVeg(profile.guest_veg_count || 0);
      setGuestEgg(profile.guest_egg_count || 0);
      setGuestFish(profile.guest_fish_count || 0);
      setGuestChicken(profile.guest_chicken_count || 0);
    }
  }, [profile]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (hours >= 20 || (hours < 6) || (hours === 6 && minutes < 30)) {
        setIsWindowOpen(true);
        setNextMeal('Lunch');
        setTimeMessage('Lunch window closes at 6:30 AM');
      } else if ((hours > 6 || (hours === 6 && minutes >= 30)) && hours < 18) {
        setIsWindowOpen(true);
        setNextMeal('Dinner');
        setTimeMessage('Dinner window closes at 6:00 PM');
      } else {
        setIsWindowOpen(false);
        setNextMeal('Locked');
        setTimeMessage('Meal window is currently locked.');
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateGuest = async (type, change) => {
    if (!isWindowOpen || isGuestUpdating) return;
    
    let current = 0;
    if (type === 'veg') current = guestVeg;
    if (type === 'egg') current = guestEgg;
    if (type === 'fish') current = guestFish;
    if (type === 'chicken') current = guestChicken;

    const newValue = Math.max(0, current + change); 
    if (newValue === current) return;

    setIsGuestUpdating(true);
    
    let updateData = {};
    if (type === 'veg') { setGuestVeg(newValue); updateData = { guest_veg_count: newValue }; }
    if (type === 'egg') { setGuestEgg(newValue); updateData = { guest_egg_count: newValue }; }
    if (type === 'fish') { setGuestFish(newValue); updateData = { guest_fish_count: newValue }; }
    if (type === 'chicken') { setGuestChicken(newValue); updateData = { guest_chicken_count: newValue }; }

    await supabase.from('profiles').update(updateData).eq('id', profile.id);
    setIsGuestUpdating(false);
  };

  // Compact Guest Counter UI
  const GuestCounter = ({ label, icon, iconClass, bgClass, type, value }) => (
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
      
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${bgClass} flex items-center justify-center`}>
          <i className={`fas ${icon} ${iconClass} text-[10px] md:text-xs`}></i>
        </div>
        <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 p-0.5">
        <button 
          onClick={() => handleUpdateGuest(type, -1)} 
          disabled={value === 0 || !isWindowOpen || isGuestUpdating} 
          className="w-6 h-6 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 disabled:opacity-40 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <i className="fas fa-minus text-[10px]"></i>
        </button>
        
        <span className="text-xs font-black w-6 text-center text-slate-900 dark:text-white">
          {value}
        </span>
        
        <button 
          onClick={() => handleUpdateGuest(type, 1)} 
          disabled={!isWindowOpen || isGuestUpdating} 
          className="w-6 h-6 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 disabled:opacity-40 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <i className="fas fa-plus text-[10px]"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 h-full flex flex-col justify-center relative overflow-hidden">
      
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${profile?.meal_status ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">My Meal Status</h2>
        
        <div className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-6 ${isWindowOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
          <i className={`fas ${isWindowOpen ? 'fa-unlock' : 'fa-lock'} mr-1`}></i> {timeMessage}
        </div>

        <button 
          onClick={toggleMealStatus}
          disabled={!isWindowOpen || isMealUpdating}
          className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${
            profile?.meal_status 
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' 
              : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-500 dark:text-slate-400 shadow-slate-900/10'
          } ${(!isWindowOpen || isMealUpdating) ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 hover:shadow-xl active:scale-95'}`}
        >
          <i className={`fas ${isMealUpdating ? 'fa-spinner fa-spin' : 'fa-utensils'} text-3xl md:text-4xl mb-2`}></i>
          <span className="font-black text-base md:text-lg tracking-wider uppercase">
            {profile?.meal_status ? 'ON' : 'OFF'}
          </span>
        </button>
        <p className="mt-4 font-bold text-slate-600 dark:text-slate-400 text-xs md:text-sm mb-6">
          Regular Meal for {nextMeal}
        </p>

        <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          
          <div className="text-left mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-200"><i className="fas fa-user-plus text-indigo-500 mr-1.5"></i> Add Guest Meals</h3>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold mt-0.5">Adjust counts for guests (Auto-resets)</p>
            </div>
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] md:text-xs font-black px-2 py-1 rounded-md shadow-sm">
              Total: {guestVeg + guestEgg + guestFish + guestChicken}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <GuestCounter label="Veg" icon="fa-leaf" iconClass="text-emerald-500" bgClass="bg-emerald-50 dark:bg-emerald-500/10" type="veg" value={guestVeg} />
            <GuestCounter label="Egg" icon="fa-egg" iconClass="text-amber-500" bgClass="bg-amber-50 dark:bg-amber-500/10" type="egg" value={guestEgg} />
            <GuestCounter label="Fish" icon="fa-fish" iconClass="text-blue-500" bgClass="bg-blue-50 dark:bg-blue-500/10" type="fish" value={guestFish} />
            <GuestCounter label="Chicken" icon="fa-drumstick-bite" iconClass="text-rose-500" bgClass="bg-rose-50 dark:bg-rose-500/10" type="chicken" value={guestChicken} />
          </div>
        </div>

      </div>
    </div>
  );
}