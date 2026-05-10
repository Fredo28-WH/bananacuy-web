"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProductStore, Product, Topping } from "@/store/productStore";
import { Edit2, Plus, Trash2, Save, X, Utensils, IceCream, Users, LogOut, KeyRound, Settings, CheckCircle2 } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { ConfirmModal, InputModal } from "@/components/Modals";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const { admin, setAdmin, logout } = useAdminStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'products' | 'toppings' | 'admins' | 'settings'>('products');
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [qrisUrl, setQrisUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  // Load existing QRIS and Logo url from public bucket if exists
  useEffect(() => {
    const { data: qrisData } = supabase.storage.from("store_assets").getPublicUrl("qris_active.png");
    setQrisUrl(`${qrisData.publicUrl}?t=${Date.now()}`);

    const { data: logoData } = supabase.storage.from("store_assets").getPublicUrl("logo.png");
    setLogoUrl(`${logoData.publicUrl}?t=${Date.now()}`);

    // Check store status
    const fetchStatus = async () => {
      const { data } = supabase.storage.from("store_assets").getPublicUrl("store_status.json");
      if (data?.publicUrl) {
         try {
           const res = await fetch(`${data.publicUrl}?t=${Date.now()}`);
           if (res.ok) {
             const json = await res.json();
             if (typeof json.isOpen === "boolean") {
               setIsStoreOpen(json.isOpen);
             }
           }
         } catch (e) {
           console.log("Status not found, assuming open");
         }
      }
    };
    fetchStatus();
  }, []);

  // Modal States
  const [confirmDeleteAdminId, setConfirmDeleteAdminId] = useState<string | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [confirmDeleteToppingId, setConfirmDeleteToppingId] = useState<string | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editPasswordAdminId, setEditPasswordAdminId] = useState<string | null>(null);

  // Fetch Admins dari API
  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/auth/admins', {credentials: 'include'});
      if (res.ok) {
        const json = await res.json();
        setAdminsList(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch admins", e);
    }
  };

  useEffect(() => {
    // Kalau tab admins aktif dan rolenya superadmin, fetch list admin
    if (activeTab === 'admins' && admin?.role === 'superadmin') {
      fetchAdmins();
    }
  }, [activeTab, admin]);

  const { 
    products, addProduct, updateProduct, deleteProduct,
    toppings, addTopping, updateTopping, deleteTopping
  } = useProductStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  const [editingToppingId, setEditingToppingId] = useState<string | null>(null);
  const [toppingData, setToppingData] = useState<Partial<Topping>>({});

  useEffect(() => {
    // Check session dari API (bukan localStorage lagi)
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
          console.log('[SESSION] Admin session found:', data.admin);
        } else {
          console.log('[SESSION] No session found');
        }
      } catch (error) {
        console.error('[SESSION ERROR]:', error);
      }
    };

    checkSession();
    
    // Fetch initial data from Supabase
    useProductStore.getState().fetchData();
  }, [setAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔐 Login attempt:", { username, password: '***' });
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Untuk mengirim cookie
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Login berhasil:', data.admin);
        setAdmin(data.admin);
        setUsername("");
        setPassword("");
        // Session cookie sudah di-set otomatis
      } else {
        console.log('❌ Login gagal:', data.error);
        alert(data.error || 'Login gagal! Coba lagi.');
      }
    } catch (error) {
      console.error('🔥 Login error:', error);
      alert('Terjadi kesalahan saat login');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        console.log('✅ Logout berhasil');
        logout();
        router.push("/");
      }
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push("/");
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
  };

  const handleSave = async () => {
    if (editingId === "new") {
      await addProduct({
        name: formData.name || "Nama Menu",
        description: formData.description || "",
        price: formData.price || 0,
        image: formData.image || "",
        isActive: formData.isActive ?? true,
      });
    } else if (editingId) {
      await updateProduct(editingId, formData);
    }
    setEditingId(null);
    setFormData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleEditTopping = (t: Topping) => {
    setEditingToppingId(t.id);
    setToppingData(t);
  };

  const handleSaveTopping = async () => {
    if (editingToppingId === "new") {
      await addTopping({
        name: toppingData.name || "Nama Topping",
        price: toppingData.price || 0,
      });
    } else if (editingToppingId) {
      await updateTopping(editingToppingId, toppingData);
    }
    setEditingToppingId(null);
    setToppingData({});
  };

  const cancelEditTopping = () => {
    setEditingToppingId(null);
    setToppingData({});
  };

  const handleUploadQris = async (file: File) => {
    setIsUploading(true);
    try {
      const { error } = await supabase.storage
        .from('store_assets')
        .upload('qris_active.png', file, { upsert: true, cacheControl: '0' });
      
      if (error) {
        console.error(error);
        if (error.message.includes('Bucket not found')) {
           alert("Upload gagal! Anda perlu membuat Storage Bucket bernama 'store_assets' di Supabase terlebih dahulu dan pastikan di-set Public.");
           return;
        }
        throw error;
      }
      
      alert("Berhasil mengubah gambar QRIS!");
      const { data } = supabase.storage.from('store_assets').getPublicUrl('qris_active.png');
      setQrisUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (error: any) {
      alert("Gagal mengupload QRIS: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    setIsUploading(true);
    try {
      const { error } = await supabase.storage
        .from('store_assets')
        .upload('logo.png', file, { upsert: true, cacheControl: '0' });
      
      if (error) {
        console.error(error);
        if (error.message.includes('Bucket not found')) {
           alert("Upload gagal! Anda perlu membuat Storage Bucket bernama 'store_assets' di Supabase terlebih dahulu dan pastikan di-set Public.");
           return;
        }
        throw error;
      }
      
      alert("Berhasil mengubah Logo Toko!");
      const { data } = supabase.storage.from('store_assets').getPublicUrl('logo.png');
      setLogoUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (error: any) {
      alert("Gagal mengupload Logo: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleStoreStatus = async () => {
    setIsStatusLoading(true);
    const newStatus = !isStoreOpen;
    const fileContent = JSON.stringify({ isOpen: newStatus });
    const file = new File([fileContent], "store_status.json", { type: "application/json" });
    
    try {
      const { error } = await supabase.storage
        .from('store_assets')
        .upload('store_status.json', file, { upsert: true, cacheControl: '0' });
        
      if (error) throw error;
      
      setIsStoreOpen(newStatus);
      alert(newStatus ? "Toko berhasil DIBUKA kembali." : "Toko berhasil DITUTUP.");
    } catch (error: any) {
       alert("Gagal mengubah status toko: " + error.message);
    } finally {
       setIsStatusLoading(false);
    }
  };

  const handleUploadProductImage = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error } = await supabase.storage
        .from('store_assets')
        .upload(fileName, file, { cacheControl: '3600' });
      
      if (error) {
        console.error(error);
        if (error.message.includes('Bucket not found')) {
           alert("Upload gagal! Anda perlu membuat Storage Bucket bernama 'store_assets' di Supabase terlebih dahulu dan pastikan di-set Public.");
           return;
        }
        throw error;
      }
      
      const { data } = supabase.storage.from('store_assets').getPublicUrl(fileName);
      setFormData({...formData, image: data.publicUrl});
    } catch (error: any) {
      alert("Gagal mengupload gambar produk: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef6e5]">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#4a3525]">Admin Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a3525]"
              required
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a3525]"
              required
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-[#4a3525] text-[#facc15] font-bold py-3 rounded-xl hover:bg-[#3a2815] transition"
            >
              Login
            </button>
            
            
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#fef6e5] to-[#fffdf9]">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-[#facc15]/30 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#facc15]/20 to-transparent -z-10" />
        
        <div className="p-6 border-b border-[#facc15]/20">
          <h1 className="text-2xl font-black text-[#4a3525]">Bananacuy<span className="text-[#facc15] animate-pulse inline-block">.</span></h1>
          <p className="text-xs text-[#4a3525]/60 mt-1 uppercase tracking-wider font-bold">Admin Panel</p>
        </div>
        
        <div className="p-4 flex-1 space-y-2 cursor-pointer">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'products' ? 'bg-[#facc15]/10 text-[#4a3525]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Utensils size={20} className={activeTab === 'products' ? 'text-[#facc15]' : ''} /> Produk Menu
          </button>
          <button 
            onClick={() => setActiveTab('toppings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'toppings' ? 'bg-[#facc15]/10 text-[#4a3525]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <IceCream size={20} className={activeTab === 'toppings' ? 'text-[#facc15]' : ''}/> Addons & Topping
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings' ? 'bg-[#facc15]/10 text-[#4a3525]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-[#facc15]' : ''}/> Pengaturan Toko
          </button>

          {admin.role === 'superadmin' && (
             <button 
               onClick={() => setActiveTab('admins')} 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all mt-8 ${activeTab === 'admins' ? 'bg-[#4a3525] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
             >
               <Users size={20} className={activeTab === 'admins' ? 'text-white' : ''}/> Data Admin
             </button>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#facc15] to-[#fde047] flex justify-center items-center font-bold text-[#4a3525] shadow-sm">
              {admin.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-900 text-sm truncate">{admin.username}</p>
              <p className="text-xs text-gray-500 capitalize">{admin.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100/50">
             <LogOut size={16}/> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Background Decorative Blob for Main Content */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#facc15]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[10%] w-80 h-80 bg-[#4a3525]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="p-8 max-w-6xl mx-auto space-y-6">

        {/* ADMINS SECTION */}
        {activeTab === 'admins' && admin.role === 'superadmin' && (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
             <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-50 bg-white">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manajemen Admin</h2>
                  <p className="text-sm text-gray-500 mt-1">Kelola akses pengguna yang dapat masuk ke dashboard</p>
               </div>
               <button 
                  onClick={() => setShowAddAdmin(true)} 
                  className="flex items-center gap-2 bg-[#4a3525] hover:bg-[#3a2815] text-[#facc15] px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
               >
                 <Plus size={20} /> Tambah Admin
               </button>
             </div>
             
             <div className="p-6 lg:p-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                {adminsList.map(u => (
                  <div key={u.id} className="flex flex-col p-5 border border-gray-100 bg-white hover:border-[#facc15]/50 hover:shadow-md transition-all rounded-2xl gap-4">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${u.role === 'superadmin' ? 'bg-[#4a3525] text-[#facc15]' : 'bg-gray-100 text-gray-700'}`}>
                             {u.username.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{u.username}</p>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                       <button 
                         onClick={() => setEditPasswordAdminId(u.id)} 
                         className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition"
                       >
                         <KeyRound size={16}/> Ubah Password
                       </button>
                       {u.id !== admin.id && (
                         <button 
                           onClick={() => setConfirmDeleteAdminId(u.id)} 
                           className="flex-none p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
                         >
                           <Trash2 size={18}/>
                         </button>
                       )}
                    </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {/* PRODUCTS SECTION */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-50">
              <div>
                 <h2 className="text-2xl font-bold text-gray-900">Daftar Produk</h2>
                 <p className="text-sm text-gray-500 mt-1">Kelola menu pisang dan minuman</p>
              </div>
              <button
                onClick={() => {
                  setEditingId("new");
                  setFormData({ isActive: true, image: "/logo.png" });
                }}
                className="flex items-center gap-2 bg-[#facc15] hover:bg-[#eab308] text-[#4a3525] px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
              >
                <Plus size={20} /> Tambah Menu
              </button>
          </div>

          <div className="w-full overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 rounded-xl text-gray-500 text-sm">
                  <th className="p-4 font-semibold rounded-l-xl">Info Menu</th>
                  <th className="p-4 text-right font-semibold">Harga</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold rounded-r-xl w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {editingId === "new" && (
                  <tr className="bg-[#facc15]/5">
                    <td className="p-4">
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={formData.name || ""} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          className="p-2 border border-yellow-200 rounded-lg w-full bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                          placeholder="Nama Produk"
                        />
                        <input 
                          type="text" 
                          value={formData.description || ""} 
                          onChange={e => setFormData({...formData, description: e.target.value})} 
                          className="p-2 border border-yellow-200 rounded-lg w-full bg-white text-sm text-gray-600 focus:ring-2 focus:ring-yellow-400 outline-none"
                          placeholder="Deskripsi Singkat"
                        />
                        <div className="flex items-center gap-3">
                          {formData.image && <img src={formData.image} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-yellow-200" />}
                          <label className={`flex-1 p-2 border border-yellow-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-yellow-400 outline-none cursor-pointer flex justify-center items-center font-bold ${isUploading ? 'text-gray-400' : 'text-[#4a3525] hover:bg-gray-50'}`}>
                            {isUploading ? "Mengupload..." : "Upload Foto Produk"}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              disabled={isUploading}
                              onChange={e => {
                                if(e.target.files?.[0]) handleUploadProductImage(e.target.files[0]);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top pt-5">
                      <input 
                        type="number" 
                        value={formData.price || ""} 
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                        className="p-2 border border-yellow-200 rounded-lg w-full bg-white text-right focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="Harga (Rp)"
                      />
                    </td>
                    <td className="p-4 text-center align-top pt-5">
                      <select 
                        value={formData.isActive ? "true" : "false"}
                        onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}
                        className="p-2 border border-yellow-200 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-yellow-400 outline-none w-full"
                      >
                        <option value="true">Tersedia</option>
                        <option value="false">Habis</option>
                      </select>
                    </td>
                    <td className="p-4 align-top pt-5">
                      <div className="flex gap-2 justify-center">
                        <button onClick={handleSave} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium flex justify-center items-center"><Save size={18} /></button>
                        <button onClick={cancelEdit} className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition flex justify-center items-center"><X size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )}
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    {editingId === p.id ? (
                      <>
                        <td className="p-4">
                          <div className="space-y-2">
                             <input type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="p-2 border rounded-lg w-full" />
                             <input type="text" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="p-2 border rounded-lg w-full text-sm" />
                               <div className="flex items-center gap-2">
                                 {formData.image && <img src={formData.image} alt="preview" className="w-10 h-10 object-cover rounded border" />}
                                 <label className={`flex-1 p-2 border rounded-lg bg-white text-sm cursor-pointer flex justify-center items-center font-bold ${isUploading ? 'text-gray-400' : 'text-[#4a3525] hover:bg-gray-50'}`}>
                                    {isUploading ? "Mengupload..." : "Upload Foto"}
                                    <input 
                                      type="file" accept="image/*" className="hidden" disabled={isUploading}
                                      onChange={e => { if(e.target.files?.[0]) handleUploadProductImage(e.target.files[0]); }}
                                    />
                                 </label>
                               </div>
                          </div>
                        </td>
                        <td className="p-4 align-top pt-5"><input type="number" value={formData.price || ""} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="p-2 border rounded-lg w-full text-right" /></td>
                        <td className="p-4 text-center align-top pt-5">
                          <select value={formData.isActive ? "true" : "false"} onChange={e => setFormData({...formData, isActive: e.target.value === "true"})} className="p-2 border rounded-lg bg-white w-full">
                            <option value="true">Tersedia</option><option value="false">Habis</option>
                          </select>
                        </td>
                        <td className="p-4 align-top pt-5">
                          <div className="flex gap-2 justify-center">
                            <button onClick={handleSave} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg flex justify-center"><Save size={18} /></button>
                            <button onClick={cancelEdit} className="p-1.5 bg-gray-200 rounded-lg flex justify-center"><X size={18} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                               {p.image ? (
                                 <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100" />
                               ) : (
                                 <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Utensils size={24}/></div>
                               )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{p.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900">
                          <span className="text-gray-400 text-xs font-normal">Rp</span> {p.price.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-center">
                          {p.isActive ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-100/80 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-red-100/80 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Habis
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-lg transition"><Edit2 size={18} /></button>
                            <button onClick={() => setConfirmDeleteProductId(p.id)} className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg transition"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* TOPPINGS SECTION */}
        {activeTab === 'toppings' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
          <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daftar Topping</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola tambahan topping pesanan</p>
            </div>
            <button
              onClick={() => {
                setEditingToppingId("new");
                setToppingData({});
              }}
              className="flex items-center gap-2 bg-[#facc15] hover:bg-[#eab308] text-[#4a3525] px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
            >
              <Plus size={20} /> Tambah Topping
            </button>
          </div>

          <div className="w-full overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 rounded-xl text-gray-500 text-sm">
                  <th className="p-4 font-semibold rounded-l-xl">Nama Topping</th>
                  <th className="p-4 text-right font-semibold">Harga Extra</th>
                  <th className="p-4 text-center font-semibold rounded-r-xl w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {editingToppingId === "new" && (
                  <tr className="bg-[#facc15]/5">
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={toppingData.name || ""} 
                        onChange={e => setToppingData({...toppingData, name: e.target.value})} 
                        className="p-2 border border-yellow-200 rounded-lg w-full focus:ring-2 focus:outline-none"
                        placeholder="Keju / Coklat dll"
                      />
                    </td>
                    <td className="p-4 w-48 pt-5">
                      <input 
                        type="number" 
                        value={toppingData.price || ""} 
                        onChange={e => setToppingData({...toppingData, price: Number(e.target.value)})} 
                        className="p-2 border border-yellow-200 rounded-lg w-full text-right focus:outline-none focus:ring-2"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4 text-center w-32 pt-5">
                      <div className="flex gap-2 justify-center">
                        <button onClick={handleSaveTopping} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"><Save size={18} className="mx-auto" /></button>
                        <button onClick={cancelEditTopping} className="p-2 bg-gray-200 rounded-lg transition"><X size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )}
                {toppings?.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    {editingToppingId === t.id ? (
                      <>
                        <td className="p-4">
                          <input type="text" value={toppingData.name || ""} onChange={e => setToppingData({...toppingData, name: e.target.value})} className="p-2 border rounded-lg w-full" />
                        </td>
                        <td className="p-4 w-48 text-right">
                          <input type="number" value={toppingData.price || ""} onChange={e => setToppingData({...toppingData, price: Number(e.target.value)})} className="p-2 border rounded-lg w-full text-right" />
                        </td>
                        <td className="p-4 text-center w-32">
                          <div className="flex gap-2 justify-center">
                            <button onClick={handleSaveTopping} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg flex justify-center"><Save size={18} /></button>
                            <button onClick={cancelEditTopping} className="p-1.5 bg-gray-200 rounded-lg flex justify-center"><X size={18} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 text-lg">{t.name}</div>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900">
                          <span className="text-gray-400 text-xs font-normal">Rp</span> {t.price.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditTopping(t)} className="p-2 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-lg transition"><Edit2 size={18} /></button>
                            <button onClick={() => setConfirmDeleteToppingId(t.id)} className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg transition"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* SETTINGS SECTION */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-50">
              <div>
                 <h2 className="text-2xl font-bold text-gray-900">Pengaturan Toko</h2>
                 
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-8">
              {/* Target Buka/Tutup Toko */}
              <div className="p-5 border border-gray-100 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Status Operasional Toko</h3>
                    <p className="text-sm text-gray-600">
                      Jika dimatikan (Tutup), pelanggan tidak akan bisa memesan dari website.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isStoreOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {isStoreOpen ? 'Toko Sedang Buka' : 'Toko Sedang Tutup'}
                    </span>
                    <button
                      onClick={handleToggleStoreStatus}
                      disabled={isStatusLoading}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isStoreOpen ? 'bg-green-500' : 'bg-gray-300'} ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isStoreOpen ? 'translate-x-7' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Section */}
              <div className="p-5 border border-gray-100 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Logo Navbar</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                   <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                     {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                     ) : (
                        <span className="text-gray-400 text-xs font-medium">Belum ada</span>
                     )}
                   </div>
                   <div className="flex-1 space-y-4">
                     <p className="text-sm text-gray-600 leading-relaxed">
                       Logo ini akan muncul di bagian kiri atas Navbar utama website. Format bebas (PNG direkomendasikan).
                     </p>
                     
                     <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer ${isUploading ? 'bg-gray-200 text-gray-400' : 'bg-[#4a3525] hover:bg-[#3a2815] text-[#facc15]'}`}>
                       {isUploading ? <><span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Mengupload...</> : <><Plus size={20} /> Upload Logo Baru</>}
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         disabled={isUploading}
                         onChange={(e) => {
                           if(e.target.files?.[0]) handleUploadLogo(e.target.files[0]);
                         }}
                       />
                     </label>
                   </div>
                </div>
              </div>

              {/* QRIS Section */}
              <div className="p-5 border border-gray-100 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Gambar QRIS Toko</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                   <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                     {qrisUrl ? (
                        <img src={qrisUrl} alt="Active QRIS" className="w-full h-full object-contain" />
                     ) : (
                        <span className="text-gray-400 text-sm font-medium">Belum ada QRIS</span>
                     )}
                   </div>
                   <div className="flex-1 space-y-4">
                     <p className="text-sm text-gray-600 leading-relaxed">
                       Gambar ini akan muncul di halaman pembayaran pelanggan saat mereka memilih metode pembayaran. 
                       Gunakan gambar beresolusi jelas agar mudah di-scan.
                     </p>
                     
                     <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer ${isUploading ? 'bg-gray-200 text-gray-400' : 'bg-[#4a3525] hover:bg-[#3a2815] text-[#facc15]'}`}>
                       {isUploading ? <><span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Mengupload...</> : <><Plus size={20} /> Upload QRIS Baru</>}
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         disabled={isUploading}
                         onChange={(e) => {
                           if(e.target.files?.[0]) handleUploadQris(e.target.files[0]);
                         }}
                       />
                     </label>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        </div>
      </main>

      {/* --- MODALS AREA --- */}
      
      {/* 1. Modal Confirm Delete Admin */}
      <ConfirmModal 
        isOpen={!!confirmDeleteAdminId}
        title="Hapus Admin?"
        message="Apakah Anda yakin ingin mencabut akses admin ini secara permanen?"
        onCancel={() => setConfirmDeleteAdminId(null)}
        onConfirm={async () => {
          if (!confirmDeleteAdminId) return;
          try {
             const res = await fetch(`/api/auth/admins?id=${confirmDeleteAdminId}`, { method: 'DELETE' });
             if (res.ok) fetchAdmins(); 
             else alert("Gagal menghapus admin");
          } catch (e) { alert("Terjadi kesalahan sistem"); }
        }}
      />

      {/* 2. Modal Add Admin */}
      <InputModal 
        isOpen={showAddAdmin}
        title="Tambah Akun Admin"
        fields={[
          { name: 'username', label: 'Username Baru', placeholder: 'contoh_admin', required: true },
          { name: 'password', label: 'Password Baru', type: 'password', placeholder: 'Ketik password', required: true }
        ]}
        onCancel={() => setShowAddAdmin(false)}
        onSubmit={async (data) => {
          try {
             const res = await fetch('/api/auth/admins', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ username: data.username, password: data.password, role: 'admin' })
             });
             if (res.ok) {
               fetchAdmins();
               setShowAddAdmin(false);
             } else {
               const err = await res.json();
               alert("Gagal menambahkan: " + err.error);
             }
          } catch (e) { alert("Terjadi kesalahan sistem"); }
        }}
      />

      {/* 3. Modal Edit Password */}
      <InputModal 
        isOpen={!!editPasswordAdminId}
        title="Ubah Password Admin"
        fields={[
          { name: 'newPassword', label: 'Password Baru', type: 'password', placeholder: 'Masukkan password baru', required: true }
        ]}
        onCancel={() => setEditPasswordAdminId(null)}
        onSubmit={async (data) => {
          if (!editPasswordAdminId) return;
          try {
             const res = await fetch('/api/auth/admins', {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ id: editPasswordAdminId, newPassword: data.newPassword })
             });
             if (res.ok) {
               setEditPasswordAdminId(null);
             } else {
               alert("Gagal ubah password");
             }
          } catch (e) { alert("Terjadi kesalahan sistem"); }
        }}
      />
      
      {/* 4. Modal Confirm Delete Product */}
      <ConfirmModal 
        isOpen={!!confirmDeleteProductId}
        title="Hapus Produk?"
        message="Produk ini akan dihapus dari menu secara permanen."
        onCancel={() => setConfirmDeleteProductId(null)}
        onConfirm={async () => {
          if (!confirmDeleteProductId) return;
          await deleteProduct(confirmDeleteProductId);
        }}
      />

      {/* 5. Modal Confirm Delete Topping */}
      <ConfirmModal 
        isOpen={!!confirmDeleteToppingId}
        title="Hapus Topping?"
        message="Topping ini akan dihapus dari pilihan pesanan."
        onCancel={() => setConfirmDeleteToppingId(null)}
        onConfirm={async () => {
          if (!confirmDeleteToppingId) return;
          await deleteTopping(confirmDeleteToppingId);
        }}
      />

    </div>
  );
}