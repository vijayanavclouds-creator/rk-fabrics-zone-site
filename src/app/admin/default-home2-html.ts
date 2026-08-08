export const DEFAULT_HERO_HTML = `<section class="relative flex items-center pt-2 md:pt-6 pb-2 md:pb-12 overflow-hidden bg-white">
  <div class="relative w-full">
    <!-- Desktop View -->
    <div class="hidden md:flex flex-col items-center justify-center w-full bg-[#fdfbf7] pt-12 pb-16 relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>
      
      <div class="text-center z-10 relative px-4 mt-8 md:mt-16">
        <h1 class="font-serif text-5xl lg:text-7xl font-bold text-[#2a2a2a] leading-[1.15] mb-4">
          Premium <span class="text-slate-600">Fabrics</span><br />
          Stylish <span class="text-slate-600">You</span>
        </h1>
        <p class="text-lg lg:text-xl text-slate-700 max-w-2xl mx-auto mb-8 font-medium tracking-wide">
          Curated collections of premium fabrics and designer ethnic wear for the fashion-forward you at RK Fabrics Zone, Jaipur.
        </p>
        <div class="flex items-center gap-4 justify-center">
          <a href="/shop" class="bg-teal-600 hover:bg-teal-700 text-white rounded-full text-base px-8 py-3.5 flex items-center gap-2 font-semibold shadow-md transition-all">
            Explore Collection
          </a>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="flex md:hidden flex-col items-center justify-center w-full bg-[#fdfbf7] pt-8 pb-10 relative overflow-hidden">
      <div class="text-center z-10 relative px-4 mt-4">
        <h1 class="font-serif text-4xl font-bold text-[#2a2a2a] leading-tight mb-3">
          Premium <span class="text-slate-600">Fabrics</span><br />
          Stylish <span class="text-slate-600">You</span>
        </h1>
        <p class="text-base text-slate-700 max-w-md mx-auto mb-6 font-medium">
          Curated collections of premium fabrics and designer ethnic wear.
        </p>
        <div class="flex items-center justify-center">
          <a href="/shop" class="bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm px-6 py-3 flex items-center gap-2 font-semibold shadow-md">
            Explore Collection
          </a>
        </div>
      </div>
    </div>
  </div>
</section>`;

export const DEFAULT_CAROUSEL_HTML = `<section class="py-12 md:py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-10">
      <h2 class="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] mb-3">Featured Collections</h2>
      <p class="text-slate-600 max-w-2xl mx-auto">Discover our latest arrivals and handpicked selections for the season.</p>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <!-- Item 1 -->
      <a href="/shop?category=cottons" class="group block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="aspect-[4/5] bg-slate-100 relative">
          <img src="https://images.unsplash.com/photo-1584852952528-6625db197d19?auto=format&fit=crop&q=80&w=800" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt="Cottons" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6">
          <h3 class="text-white font-bold text-lg md:text-xl mb-1">Pure Cottons</h3>
          <span class="text-white/80 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now →</span>
        </div>
      </a>
      
      <!-- Item 2 -->
      <a href="/shop?category=silks" class="group block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="aspect-[4/5] bg-slate-100 relative">
          <img src="https://images.unsplash.com/photo-1596464518118-2e008d66df16?auto=format&fit=crop&q=80&w=800" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt="Silks" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6">
          <h3 class="text-white font-bold text-lg md:text-xl mb-1">Premium Silks</h3>
          <span class="text-white/80 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now →</span>
        </div>
      </a>
      
      <!-- Item 3 -->
      <a href="/shop?category=chiffons" class="group block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="aspect-[4/5] bg-slate-100 relative">
          <img src="https://images.unsplash.com/photo-1588629731633-e1882d92176b?auto=format&fit=crop&q=80&w=800" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt="Chiffons" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6">
          <h3 class="text-white font-bold text-lg md:text-xl mb-1">Elegant Chiffons</h3>
          <span class="text-white/80 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now →</span>
        </div>
      </a>
      
      <!-- Item 4 -->
      <a href="/shop?category=linens" class="group block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="aspect-[4/5] bg-slate-100 relative">
          <img src="https://images.unsplash.com/photo-1596464518118-2e008d66df16?auto=format&fit=crop&q=80&w=800" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt="Linens" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6">
          <h3 class="text-white font-bold text-lg md:text-xl mb-1">Summer Linens</h3>
          <span class="text-white/80 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now →</span>
        </div>
      </a>
    </div>
  </div>
</section>`;
