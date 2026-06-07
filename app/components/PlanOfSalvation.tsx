const salvationSteps = [
  {
    title: "Hear the Gospel",
    reference: "Romans 10:17",
    body:
      "Faith begins with hearing the word of Christ. The good news of Jesus shows us our need for mercy, his death and resurrection, and the way God calls us to respond.",
  },
  {
    title: "Believe in Jesus",
    reference: "Hebrews 11:6",
    body:
      "We must believe that Jesus is the Son of God and trust him enough to follow what he teaches. Faith is more than agreement; it is a living response to the Lord.",
  },
  {
    title: "Repent of Sin",
    reference: "Acts 3:19",
    body:
      "Repentance is a turning of the heart and life back to God. Scripture calls every person to leave sin behind and seek the forgiveness God gives through Christ.",
  },
  {
    title: "Confess Christ",
    reference: "Romans 10:9-10",
    body:
      "The New Testament shows believers openly confessing faith in Jesus Christ. We gladly acknowledge him as the Son of God and the risen Lord.",
  },
  {
    title: "Be Baptized",
    reference: "Acts 2:38",
    body:
      "Those who believed the gospel were told to repent and be baptized in the name of Jesus Christ for the forgiveness of sins. Baptism unites us with Christ in his death, burial, and resurrection.",
  },
  {
    title: "Remain Faithful",
    reference: "Revelation 2:10",
    body:
      "After God adds the saved to his people, Christians continue walking with him in faith, worship, service, and hope until death.",
  },
];

export default function PlanOfSalvation() {
  return (
    <section
      className="container-wide mb-12 rounded-lg border border-white/15 bg-white/[0.07] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.14)] md:p-8"
      aria-labelledby="plan-of-salvation-title"
    >
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-rose-light">
            What Must I Do?
          </p>
          <h2
            id="plan-of-salvation-title"
            className="text-3xl font-bold leading-tight text-white md:text-4xl"
          >
            God&apos;s Plan of Salvation
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/74">
            The Bible gives a clear answer to those seeking forgiveness and new
            life in Christ. These passages offer a simple place to begin.
          </p>
        </div>

        <div className="divide-y divide-white/12 overflow-hidden rounded-lg border border-white/12 bg-sage-deep/55">
          {salvationSteps.map((step, index) => (
            <details key={step.title} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.06] focus-ring md:px-5 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-base font-bold text-white">
                    {index + 1}. {step.title}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-rose-light">
                    {step.reference}
                  </span>
                </span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg font-semibold text-white/80 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="px-4 pb-5 text-sm leading-7 text-white/74 md:px-5">
                {step.body}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
