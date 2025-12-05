
import React from 'react';

interface DiveTablesImagesModalProps {
  onClose: () => void;
}

const table1Svg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600' fill='%230c2d48'%3E%3Crect width='400' height='600' fill='%23f0f9ff' /%3E%3Ctext x='200' y='50' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle'%3EPADI RDP - Table 1%3C/text%3E%3Ctext x='200' y='80' font-family='sans-serif' font-size='16' text-anchor='middle'%3ENDLs %26 Pressure Groups%3C/text%3E%3Cg font-family='monospace' font-size='14' text-anchor='middle'%3E%3Ctext x='50' y='120' font-weight='bold'%3EDepth%3C/text%3E%3Ctext x='150' y='120' font-weight='bold'%3ETIME %28min%29%3C/text%3E%3Ctext x='250' y='120' font-weight='bold'%3EPG%3C/text%3E%3Ctext x='350' y='120' font-weight='bold'%3ENDL%3C/text%3E%3Cpath d='M20 130 h 360' stroke='%230c2d48' stroke-width='1' /%3E%3Ctext x='50' y='150'%3E10m%3C/text%3E%3Ctext x='150' y='150'%3E10...19...25%3C/text%3E%3Ctext x='250' y='150'%3EA...B...C%3C/text%3E%3Ctext x='350' y='150'%3E219%3C/text%3E%3Ctext x='50' y='170'%3E12m%3C/text%3E%3Ctext x='150' y='170'%3E9...16...22%3C/text%3E%3Ctext x='250' y='170'%3EA...B...C%3C/text%3E%3Ctext x='350' y='170'%3E147%3C/text%3E%3Ctext x='50' y='190'%3E14m%3C/text%3E%3Ctext x='150' y='190'%3E8...14...19%3C/text%3E%3Ctext x='250' y='190'%3EA...B...C%3C/text%3E%3Ctext x='350' y='190'%3E95%3C/text%3E%3Ctext x='200' y='350' font-size='30' fill-opacity='0.3'%3E...etc...%3C/text%3E%3C/g%3E%3C/svg%3E";
const table2Svg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600' fill='%230c2d48'%3E%3Crect width='400' height='600' fill='%23f0f9ff' /%3E%3Ctext x='200' y='50' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle'%3EPADI RDP - Table 2%3C/text%3E%3Ctext x='200' y='80' font-family='sans-serif' font-size='16' text-anchor='middle'%3ESurface Interval Credit%3C/text%3E%3Cg font-family='monospace' font-size='12' text-anchor='start'%3E%3Ctext x='30' y='120' font-weight='bold'%3EPG%3C/text%3E%3Ctext x='100' y='120' font-weight='bold'%3ETime (min-max)%3C/text%3E%3Ctext x='280' y='120' font-weight='bold'%3ENew PG%3C/text%3E%3Cpath d='M20 130 h 360' stroke='%230c2d48' stroke-width='1' /%3E%3Ctext x='30' y='150'%3EZ%3C/text%3E%3Ctext x='100' y='150'%3E10 - 48%3C/text%3E%3Ctext x='280' y='150'%3EY%3C/text%3E%3Ctext x='30' y='170'%3EZ%3C/text%3E%3Ctext x='100' y='170'%3E49 - 88%3C/text%3E%3Ctext x='280' y='170'%3EX%3C/text%3E%3Ctext x='30' y='190'%3EY%3C/text%3E%3Ctext x='100' y='190'%3E10 - 39%3C/text%3E%3Ctext x='280' y='190'%3EX%3C/text%3E%3Ctext x='30' y='210'%3EY%3C/text%3E%3Ctext x='100' y='210'%3E40 - 79%3C/text%3E%3Ctext x='280' y='210'%3EW%3C/text%3E%3Ctext x='200' y='350' font-size='30' fill-opacity='0.3' text-anchor='middle'%3E...etc...%3C/text%3E%3C/g%3E%3C/svg%3E";
const table3Svg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600' fill='%230c2d48'%3E%3Crect width='400' height='600' fill='%23f0f9ff' /%3E%3Ctext x='200' y='50' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle'%3EPADI RDP - Table 3%3C/text%3E%3Ctext x='200' y='80' font-family='sans-serif' font-size='16' text-anchor='middle'%3ERepetitive Dive Timetable%3C/text%3E%3Cg font-family='monospace' font-size='12' text-anchor='middle'%3E%3Ctext x='50' y='120' font-weight='bold'%3EPG%3C/text%3E%3Ctext x='150' y='120' font-weight='bold'%3EDepth%3C/text%3E%3Ctext x='250' y='120' font-weight='bold'%3ERNT%3C/text%3E%3Ctext x='350' y='120' font-weight='bold'%3EANDL%3C/text%3E%3Cpath d='M20 130 h 360' stroke='%230c2d48' stroke-width='1' /%3E%3Ctext x='50' y='150'%3EA%3C/text%3E%3Ctext x='150' y='150'%3E10m%3C/text%3E%3Ctext x='250' y='150'%3E10%3C/text%3E%3Ctext x='350' y='150'%3E209%3C/text%3E%3Ctext x='50' y='170'%3EB%3C/text%3E%3Ctext x='150' y='170'%3E10m%3C/text%3E%3Ctext x='250' y='170'%3E19%3C/text%3E%3Ctext x='350' y='170'%3E200%3C/text%3E%3Ctext x='50' y='190'%3EB%3C/text%3E%3Ctext x='150' y='190'%3E12m%3C/text%3E%3Ctext x='250' y='190'%3E16%3C/text%3E%3Ctext x='350' y='190'%3E131%3C/text%3E%3Ctext x='200' y='350' font-size='30' fill-opacity='0.3'%3E...etc...%3C/text%3E%3C/g%3E%3C/svg%3E";

export const DiveTablesImagesModal: React.FC<DiveTablesImagesModalProps> = ({ onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-6xl w-full animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl">PADI RDP Table Images</h2>
            <button onClick={onClose} className="text-3xl text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors leading-none">&times;</button>
        </div>
        
        <div className="overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-semibold text-lg">Table 1: NDL & Pressure Groups</h3>
            <img src={table1Svg} alt="PADI RDP Table 1" className="rounded-lg border border-black/10 dark:border-white/10" />
          </div>
           <div className="flex flex-col items-center gap-2">
            <h3 className="font-semibold text-lg">Table 2: Surface Interval Credit</h3>
            <img src={table2Svg} alt="PADI RDP Table 2" className="rounded-lg border border-black/10 dark:border-white/10" />
          </div>
           <div className="flex flex-col items-center gap-2">
            <h3 className="font-semibold text-lg">Table 3: Repetitive Dives</h3>
            <img src={table3Svg} alt="PADI RDP Table 3" className="rounded-lg border border-black/10 dark:border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};
