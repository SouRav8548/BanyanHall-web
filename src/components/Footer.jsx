export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-4 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Brand Info */}
        <div className="flex items-center gap-2" id="support">
          <i className="fas fa-utensils text-emerald-400"></i>
          <span className="font-black text-white tracking-wider">
            Banyan Hall
          </span>
          <span className="text-slate-500 hidden sm:inline">
            | © 2026 All rights reserved.
          </span>
        </div>

        {/* Social Media Links */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold mr-1 hidden lg:inline">
            Follow Us:
          </span>
          <a
            href="https://www.facebook.com/share/g/1DyGJuiStw/"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <i className="fab fa-facebook-f text-xs"></i>
          </a>
          {/* <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <i className="fab fa-twitter text-xs"></i>
          </a> */}
          {/* 🔥 New Browser/Website Icon (Added between FB and YT) */}
          <a
            href="https://banyanhall.wordpress.com/"
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-colors"
          >
            <i className="fas fa-globe text-sm"></i>
          </a>
          {/* <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-700 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <i className="fab fa-linkedin-in text-xs"></i>
          </a> */}
          <a
            href="https://youtu.be/PfG9W9Pc7_4"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
          >
            <i className="fab fa-youtube text-xs"></i>
          </a>
        </div>

        {/* Download APK Link & Designer Note */}
        <div className="flex items-center gap-4">
          <a
            href="https://drive.google.com/file/d/1SufrLm0bKrTW1urXh3B8unfSkRFYAZkp/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-all text-xs font-bold shadow-sm"
          >
            <i className="fas fa-download text-emerald-400"></i>
            <span>Download APK</span>
          </a>
          <span className="text-slate-500 hidden xl:inline">
            Designed with <i className="fas fa-heart text-rose-500"></i> of
            Boarders
          </span>
        </div>
      </div>
    </footer>
  );
}
