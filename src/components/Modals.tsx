import { ShieldAlert, Trash2, X } from "lucide-react";

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Hapus",
  cancelText = "Batal",
  isDanger = true
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-6 text-center ${isDanger ? 'text-red-500' : 'text-blue-500'}`}>
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 font-bold text-white rounded-lg transition ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InputModal({
  isOpen,
  title,
  fields,
  onSubmit,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  fields: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    fields.forEach(f => {
      data[f.name] = formData.get(f.name);
    });
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input 
                name={field.name}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#facc15] focus:outline-none transition"
              />
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Batal</button>
          <button type="submit" className="px-4 py-2 bg-[#facc15] text-[#4a3525] hover:bg-[#eab308] font-bold rounded-lg transition">Simpan</button>
        </div>
      </form>
    </div>
  );
}
