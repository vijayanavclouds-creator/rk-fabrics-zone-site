"use client";

import { useState, useEffect } from "react";
import { MapPin, Truck, ChevronRight, LocateFixed, UserCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getUserAddresses, saveAddress } from "@/actions/address";
import { checkDeliveryAvailability } from "@/actions/delivery";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCheckoutStore } from "@/store/checkout";

export function DeliveryDetails() {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [pincode, setPincode] = useState("");
  const [savedPincode, setSavedPincode] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [detectedAddress, setDetectedAddress] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<'saved' | 'detected' | 'manual' | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const pathname = usePathname();
  const { selectedAddress, setAddress } = useCheckoutStore();

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const fetchedAddresses = await getUserAddresses();
        if (fetchedAddresses && fetchedAddresses.length > 0) {
          setAddresses(fetchedAddresses);
          const defaultAddress = fetchedAddresses.find((a: any) => a.isDefault) || fetchedAddresses[0];
          if (defaultAddress) {
            setAddress(defaultAddress);
          }
          if (defaultAddress?.pincode) {
            setSavedPincode(defaultAddress.pincode);
            setSelectedSource('saved');
          }
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };
    fetchAddress();
  }, []);

  const calculateDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    // Default fallback if no pincode is entered yet
    setDeliveryDate(calculateDate(5));

    // Countdown timer for "Order in..." (resetting every 24h at midnight)
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheck = async () => {
    if (pincode.trim().length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      setSuccessMsg("");
      return;
    }
    setError("");
    setSuccessMsg("");
    setIsChecking(true);
    
    const result = await checkDeliveryAvailability(pincode);
    setIsChecking(false);
    
    if (!result.isServiceable) {
      setError(result.message || "Delivery is not available for this location.");
      setSuccessMsg("");
      return;
    }
    
    setSuccessMsg(result.message || "Delivery is available!");
    if (result.expectedDeliveryDays) {
      setDeliveryDate(calculateDate(result.expectedDeliveryDays));
    }
    setSavedPincode(pincode);
    setSelectedSource('manual');
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data && data.address && data.address.postcode) {
          const foundPincode = data.address.postcode.replace(/\D/g, '').substring(0,6);
          if (foundPincode.length === 6) {
            const detectedAddressObj = {
               id: "temp_detected_" + Date.now(),
               firstName: session?.user?.name?.split(" ")[0] || "User",
               lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
               phone: session?.user?.phone || "",
               address: data.display_name,
               city: data.address.city || data.address.town || data.address.village || "",
               state: data.address.state || "",
               pincode: foundPincode,
               fullText: data.display_name,
               isDefault: false
            };
            setDetectedAddress(detectedAddressObj);
            setIsChecking(true);
            
            const existingAddress = addresses.find(a => a.pincode === foundPincode && a.address === detectedAddressObj.fullText);
            if (existingAddress) {
                setAddress(existingAddress);
            } else if (session?.user) {
                setAddress(detectedAddressObj);
            }

            setTimeout(() => {
               setIsChecking(false);
               setSavedPincode(foundPincode);
               setSelectedSource('detected');
            }, 600);
          } else {
             alert("Could not determine a valid 6-digit pincode from your location.");
          }
        } else {
          alert("Could not determine pincode from your location.");
        }
      } catch (error) {
        console.error("Error getting location:", error);
        alert("Failed to get location.");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      setIsLocating(false);
      alert("Please allow location access to use this feature.");
    });
  };

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  return (
    <div className="mt-8 mb-6">
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-4">Delivery details</h3>
      
      <div className="flex flex-col rounded-3xl neumorphic-surface overflow-hidden">
        {/* Location Section */}
        <div className="flex flex-col p-5 sm:p-6 transition-colors">
          <div className="flex items-center gap-4 sm:gap-5 mb-5">
            <div className="w-11 h-11 rounded-full neumorphic-surface flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
              <MapPin size={18} />
            </div>
            <span className="font-bold text-charcoal text-lg">Check delivery availability</span>
          </div>
          
          <div className="flex flex-col flex-1 w-full">
              {(!session) || (addresses.length > 0 && defaultAddress) || detectedAddress ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Left: Saved Address / Login */}
                  <div className="flex flex-col gap-4">
                    {!session && (
                      <div className="flex flex-col gap-3 h-full">
                        <span className="text-xs sm:text-sm font-bold text-slate uppercase tracking-wider">Saved Addresses</span>
                        <Link href="/auth/login" className="flex-1 flex flex-col items-center justify-center gap-3 p-5 rounded-3xl neumorphic-surface hover:scale-[1.02] transition-all text-center">
                          <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-teal-600">
                            <UserCircle size={24} />
                          </div>
                          <span className="font-bold text-charcoal">Login to see saved addresses</span>
                        </Link>
                      </div>
                    )}
                    {session && addresses.length > 0 && defaultAddress && (
                      <div className="flex flex-col gap-3">
                        <span className="text-xs sm:text-sm font-bold text-slate uppercase tracking-wider">Use Saved Address</span>
                        <button 
                          onClick={() => {
                            if (savedPincode === defaultAddress.pincode && selectedSource === 'saved') {
                                setSavedPincode("");
                                setSelectedSource(null);
                                // clear from store if using clearCheckout or pass null if setAddress accepts null
                                // Wait, setAddress requires a valid CheckoutAddress, let's cast null as any for now
                                setAddress(null as any);
                            } else {
                                setSavedPincode(defaultAddress.pincode);
                                setSelectedSource('saved');
                                setAddress(defaultAddress);
                            }
                          }}
                          className={cn("flex flex-col items-start p-5 rounded-3xl transition-all text-left w-full", savedPincode === defaultAddress.pincode && selectedSource === 'saved' ? "neumorphic-inset ring-2 ring-teal-600/50" : "neumorphic-surface hover:scale-[1.02]")}
                        >
                          <span className="font-bold text-charcoal">{defaultAddress.firstName} {defaultAddress.lastName}</span>
                          <span className="text-xs text-slate mt-1.5 leading-relaxed line-clamp-2">{defaultAddress.address}, {defaultAddress.city}, {defaultAddress.state}</span>
                          <div className="flex items-center justify-between w-full mt-3">
                            <span className="text-sm font-bold text-teal-600">{defaultAddress.pincode}</span>
                          </div>
                        </button>
                        <Link href={`/account/addresses?returnUrl=${pathname}`} className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 hover:underline mt-1 self-start">
                          Show all saved addresses <ChevronRight size={16} />
                        </Link>
                      </div>
                    )}
                    
                    {detectedAddress && (
                      <div className="flex flex-col gap-3">
                        <span className="text-xs sm:text-sm font-bold text-slate uppercase tracking-wider">Current Location</span>
                        <button 
                          onClick={() => {
                            if (savedPincode === detectedAddress.pincode && selectedSource === 'detected') {
                                setSavedPincode("");
                                setSelectedSource(null);
                                setAddress(null as any);
                            } else {
                                setSavedPincode(detectedAddress.pincode);
                                setSelectedSource('detected');
                                setAddress(detectedAddress as any);
                            }
                          }}
                          className={cn("flex flex-col items-start p-5 rounded-3xl transition-all text-left w-full", savedPincode === detectedAddress.pincode && selectedSource === 'detected' ? "neumorphic-inset ring-2 ring-teal-600/50" : "neumorphic-surface hover:scale-[1.02]")}
                        >
                          <span className="font-bold text-charcoal">
                            {session?.user?.name || "Detected Location"}
                            {session?.user?.phone && <span className="text-sm font-normal text-slate ml-2">{session.user.phone}</span>}
                          </span>
                          <span className="text-xs text-slate mt-1.5 leading-relaxed line-clamp-2">{detectedAddress.fullText}</span>
                          <div className="flex items-center justify-between w-full mt-3">
                            <span className="text-sm font-bold text-teal-600">{detectedAddress.pincode}</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Manual Input */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs sm:text-sm font-bold text-slate uppercase tracking-wider">Or Enter Pincode</span>
                    <div className="flex flex-col gap-3">
                      <div className="w-full px-5 py-4 rounded-full neumorphic-inset flex items-center transition-all">
                        <input 
                          type="text" 
                          placeholder="Search by area, street, or pincode"
                          value={pincode}
                          onFocus={() => setIsInputFocused(true)}
                          onBlur={() => setIsInputFocused(false)}
                          onChange={(e) => {
                            setPincode(e.target.value);
                            setError("");
                            setSuccessMsg("");
                          }}
                          className="w-full bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-sm font-bold text-charcoal placeholder:text-slate-400"
                        />
                      </div>
                      {error && (
                        <span className="text-xs font-bold text-rose px-2 mt-[-4px]">{error}</span>
                      )}
                      {successMsg && (
                        <span className="text-xs font-bold text-teal-600 px-2 mt-[-4px]">{successMsg}</span>
                      )}
                      <button 
                        onClick={handleCheck}
                        disabled={pincode.trim().length < 3 || isChecking}
                        className={cn("w-full py-4 rounded-full text-sm font-bold transition-all disabled:cursor-not-allowed", (pincode.length > 0) ? "btn-primary" : "neumorphic-surface text-charcoal")}
                      >
                        {isChecking ? "Checking..." : "Check"}
                      </button>

                      <div className="flex items-center gap-3 w-full py-1">
                        <div className="h-px flex-1 bg-charcoal/5" />
                        <span className="text-[10px] font-bold text-slate/60 uppercase tracking-widest">OR</span>
                        <div className="h-px flex-1 bg-charcoal/5" />
                      </div>

                      <button 
                        onClick={handleCurrentLocation}
                        disabled={isLocating}
                        className="w-full py-4 rounded-full btn-primary text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed !text-blue-600"
                      >
                        <LocateFixed size={18} /> {isLocating ? "Detecting location..." : "Use my current location"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-1">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 px-5 py-3.5 rounded-full neumorphic-inset flex items-center transition-all">
                      <input 
                        type="text" 
                        placeholder="Search by area, street, or pincode"
                        value={pincode}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="w-full bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-sm font-bold text-charcoal placeholder:text-slate-400"
                      />
                    </div>
                    <button 
                      onClick={handleCheck}
                      disabled={pincode.trim().length < 3 || isChecking}
                      className={cn("px-8 py-3.5 rounded-full text-sm font-bold transition-all disabled:cursor-not-allowed", (pincode.length > 0) ? "btn-primary" : "neumorphic-surface text-charcoal")}
                    >
                      {isChecking ? "..." : "Check"}
                    </button>
                  </div>
                  {error && (
                    <span className="text-xs font-bold text-rose px-2 mt-[-4px]">{error}</span>
                  )}
                  {successMsg && (
                    <span className="text-xs font-bold text-teal-600 px-2 mt-[-4px]">{successMsg}</span>
                  )}
                  
                  <div className="flex items-center gap-3 w-full py-2">
                    <div className="h-px flex-1 bg-charcoal/5" />
                    <span className="text-[10px] font-bold text-slate/60 uppercase tracking-widest">OR</span>
                    <div className="h-px flex-1 bg-charcoal/5" />
                  </div>

                  <button 
                    onClick={handleCurrentLocation}
                    disabled={isLocating}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full btn-primary text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed !text-blue-600"
                  >
                    <LocateFixed size={18} /> {isLocating ? "Detecting location..." : "Use my current location"}
                  </button>

                  <div className="flex items-center mt-1">
                    <Link href={`/account/addresses?returnUrl=${pathname}`} className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 hover:underline">
                      Or select a saved address <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-charcoal/5" />

        {/* Delivery Estimate */}
        <div className={cn("flex items-start gap-4 sm:gap-5 p-5 sm:p-6 transition-colors", savedPincode ? "" : "opacity-50 grayscale pointer-events-none")}>
          <div className="w-11 h-11 rounded-full neumorphic-surface flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
            <Truck size={18} />
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-bold text-charcoal text-base">
              {savedPincode ? `Delivery by ${deliveryDate}` : "Enter pincode to see delivery date"}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-rose">
              {savedPincode ? `Order within ${timeLeft}` : "Delivery time depends on your location"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
