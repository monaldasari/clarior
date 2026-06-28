const Topbar = () => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Clarior CRM
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-slate-800 text-white px-4 py-2 rounded-lg outline-none w-72"
        />

        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white">
          M
        </div>
      </div>
    </header>
  );
};

export default Topbar;