import React from 'react';
import { ROLES_DATA } from '../data/rolesData';
import { BookOpen, X, Shield, Skull, HeartHandshake, Search, Flame, Clock, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12131a] p-6 sm:p-7 border border-zinc-800 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Mafiya O'yini Qoidalari
              </h2>
              <p className="text-xs text-zinc-400">
                O'yin mexanikasi, rollar vazifasi va g'alaba qoidalari
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors border border-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-zinc-300 pr-1 scrollbar-thin">
          {/* Section: Maqsad */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>O'yin Maqsadi</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Mafiya — bu psixologik, strategik va munozarali ko'p o'yinchili o'yin. O'yinchilar ikki asosiy tarafga bo'linadi: <strong className="text-emerald-400">Tinch Aholi</strong> va <strong className="text-red-400">Yashirin Mafiya</strong> (shuningdek yakka <strong className="text-amber-400">Manyak</strong>). Tinch aholi shaharni himoya qilib jinoyatchilarni fosh qilishi, Mafiya esa shaharni butunlay qo'lga kiritishi lozim.
            </p>
          </div>

          {/* Section: Fazalar */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>O'yin Fazalari Ketma-ketligi</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#181924] border border-zinc-800">
                <span className="font-bold text-indigo-400">1. Tun (Night):</span> Shahar uyquga ketadi. Mafiya nishonni tanlaydi, Shifokor bir kishini davolaydi, Komissar gumonlanuvchini tergov qiladi, Manyak esa o'z qurbonini tanlaydi.
              </div>
              <div className="p-3 rounded-xl bg-[#181924] border border-zinc-800">
                <span className="font-bold text-amber-400">2. Kun Tongi (Day):</span> Shahar uyg'onadi. Tungi hujum va davolanish natijalari e'lon qilinadi.
              </div>
              <div className="p-3 rounded-xl bg-[#181924] border border-zinc-800">
                <span className="font-bold text-sky-400">3. Muhokama (Discussion):</span> Barcha tirik fuqarolar umumiy chatda dalillarni tahlil qiladi va gumonlanuvchilarni fosh etadi.
              </div>
              <div className="p-3 rounded-xl bg-[#181924] border border-zinc-800">
                <span className="font-bold text-red-400">4. Ovoz Berish & Qatl (Voting & Execution):</span> O'yinchilar qatl qilinadigan gumonlanuvchiga ovoz beradi. Ko'pchilik ovoz to'plagan o'yinchi qatl qilinadi.
              </div>
            </div>
          </div>

          {/* Section: Rollar */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Maxfiy Rollar va Qobiliyatlar</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.values(ROLES_DATA).map((role) => (
                <div
                  key={role.id}
                  className="p-3 rounded-xl bg-[#181924] border border-zinc-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{role.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${role.badgeBg}`}>
                        {role.teamName}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mb-2">
                      {role.description}
                    </p>
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium">
                    ⚡ {role.ability}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: G'alaba shartlari */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              <span>G'alaba Shartlari</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400 leading-relaxed">
              <li><strong className="text-emerald-400">Tinch Aholi g'alabasi:</strong> Barcha Mafiya a'zolari va Manyak to'liq fosh qilinib yo'q qilinsa.</li>
              <li><strong className="text-red-400">Mafiya g'alabasi:</strong> Mafiya a'zolari soni qolgan barcha tirik aholi soniga teng yoki undan ko'p bo'lsa.</li>
              <li><strong className="text-amber-400">Manyak g'alabasi:</strong> Manyak barcha Mafiyani yo'q qilib, oxirida faqat 1 nafar fuqaro bilan yakkama-yakka qolsa yoki yolg'iz tirik qolsa.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 text-center flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow cursor-pointer transition-all"
          >
            Tushundim, O'yinga Qaytish
          </button>
        </div>
      </div>
    </div>
  );
};
