export default function PropertiesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="h-10 w-64 animate-pulse bg-muted" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[4/3] animate-pulse bg-muted" />
        ))}
      </div>
    </div>
  );
}
