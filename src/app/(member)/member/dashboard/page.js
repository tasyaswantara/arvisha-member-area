export default function MemberDashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <p>Member dashboard placeholder</p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
          >
            Logout
          </button>
        </form>
      </div>
    </main>
  );
}
