import { MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer id='kontak' className='bg-[#3e2723] text-[#fef6e5] pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12 mb-12'>
          {/* Brand Info */}
          <div>
            <h2 className='text-3xl font-extrabold text-[#facc15] mb-6 tracking-wide'>BananaCuuuyy</h2>
            <p className='text-[#fef6e5]/90 leading-relaxed mb-6'>Kami menyediakan nuget pisang goreng terbaik dengan bahan berkualitas dengan topping yang melimpah.
              
            </p>
            <p className='text-[#fef6e5]/80'>
              Made With Love For You !!
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className='text-xl font-bold text-[#facc15] mb-6'>Hubungi Kami</h2>
            <ul className='space-y-6'>
              <li className='flex items-start gap-4'>
                <MapPin className='text-[#facc15] shrink-0' size={24} />
                <div>
                  <p className='text-sm text-[#fef6e5]/60 mb-1'>Alamat</p>
                  <p className='font-semibold'>Jl. Palapa, Kupang</p>
                </div>
              </li>
              <li className='flex items-start gap-4'>
                <Phone className='text-[#facc15] shrink-0' size={24} />
                <div>
                  <p className='text-sm text-[#fef6e5]/60 mb-1'>Telepon</p>
                  <p className='font-semibold'>+62 812-3456-7890</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h2 className='text-xl font-bold text-[#facc15] mb-6'>Ikuti Kami</h2>
            <p className='text-[#fef6e5]/90 leading-relaxed mb-6'>
              Dapatkan update terbaru dan penawaran eksklusif di media sosial kami!
            </p>
            <div className='flex gap-4'>
              <a href='https://www.instagram.com/bananacuuuyy?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' target='_blank' rel='noopener noreferrer' className='w-12 h-12 bg-[#5d4037] flex items-center justify-center rounded-xl text-[#facc15] hover:bg-[#6d4c41] transition-colors' aria-label='Instagram'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                  <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
                </svg>
              </a>
              <a href='https://www.tiktok.com/@bananacuuuyy?is_from_webapp=1&sender_device=pc' target='_blank' rel='noopener noreferrer' className='w-12 h-12 bg-[#5d4037] flex items-center justify-center rounded-xl text-[#facc15] hover:bg-[#6d4c41] transition-colors' aria-label='TikTok'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a4 4 0 1 1-4-4Z' />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-[#facc15]/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#fef6e5]/60'>
          <p> {new Date().getFullYear()} BananaCuuuyy.</p>
          
        </div>
      </div>
    </footer>
  )
}
