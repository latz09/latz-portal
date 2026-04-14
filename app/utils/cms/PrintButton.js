// app/components/portal/PrintButton.jsx
'use client';

export default function PrintButton() {
  function handlePrint() {
    const iframe = document.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }

  return (
    <button
      onClick={handlePrint}
      className='font-mono text-xs text-white hover:text-white/70 tracking-widest uppercase transition-colors'
    >
      Print ↗
    </button>
  );
}