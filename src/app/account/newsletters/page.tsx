import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Mail, X } from "lucide-react"
import { getUserNewsletters, deleteUserNewsletter } from "@/actions/newsletter"
import Link from "next/link"

export default async function CustomerNewslettersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { newsletters = [] } = await getUserNewsletters()

  async function handleDelete(id: string) {
    "use server"
    await deleteUserNewsletter(id)
  }

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-charcoal/10">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal flex items-center gap-3">
          <Mail size={24} className="text-teal-600" />
          My Newsletters
        </h2>
      </div>

      {!newsletters || newsletters.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
          <Mail size={48} className="mx-auto text-slate mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-charcoal mb-2">No newsletters yet</h3>
          <p className="text-slate mb-8">When we send out updates and offers, you&apos;ll find them here.</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((item: any) => (
            <div key={item.id} className="bg-white border rounded-2xl p-6 border-charcoal/10 relative group hover:border-charcoal/20 transition-colors">
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <span className="text-xs text-slate font-medium">
                  {new Date(item.newsletter.createdAt).toLocaleString()}
                </span>
                <form action={handleDelete.bind(null, item.id)}>
                  <button type="submit" className="text-slate hover:text-rose-600 transition-colors p-2 rounded-full hover:bg-rose-50" title="Close Newsletter">
                    <X size={18} />
                  </button>
                </form>
              </div>
              
              <div className="pr-10">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-charcoal">
                    {item.newsletter.subject}
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none text-charcoal whitespace-pre-wrap">
                  {item.newsletter.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
