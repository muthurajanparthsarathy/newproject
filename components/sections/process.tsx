import {
  Section,
  Container,
  SectionHeading,
} from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { processSteps } from "@/lib/content";

export function ProcessSection() {
  return (
    <Section id="process" className="bg-white/40">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Process"
            title={
              <>
                A simple, transparent{" "}
                <span className="text-gradient">workflow</span>
              </>
            }
            description="Built around clear sprints, weekly check-ins and zero surprises."
          />
        </Reveal>

        <Stagger
          stagger={0.1}
          className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {processSteps.map((step, idx) => (
            <StaggerItem key={step.step}>
              <div className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-glow">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-extrabold text-gradient">
                    {step.step}
                  </span>
                  {idx < processSteps.length - 1 ? (
                    <div className="hidden h-0.5 flex-1 origin-left scale-x-0 bg-gradient-brand transition-transform duration-700 group-hover:scale-x-100 lg:block" />
                  ) : null}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
