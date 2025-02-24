export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      <div>
        {children}
      </div>
    </section>
  );
}
