import { SettingsNav } from "./_components/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <div className="grid w-full flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <SettingsNav />
        <div className="grid gap-6">
          {children}
        </div>
      </div>
    </div>
  )
}
