"use client";

import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/utils";
import { services, products } from "@/lib/content";

const SERVICE_OPTIONS = [
  ...services.map((s) => ({ value: s.name, label: s.name })),
  ...products.map((p) => ({ value: p.name, label: p.name })),
  { value: "Not sure", label: "Not sure yet" },
];

type FormState = {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  service: SERVICE_OPTIONS[0]?.value ?? "",
  message: "",
};

export function ContactForm({
  defaultService,
}: {
  defaultService?: string;
}) {
  const [data, setData] = useState<FormState>({
    ...INITIAL,
    service: defaultService ?? INITIAL.service,
  });
  const [submitted, setSubmitted] = useState(false);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data.name.trim() || !data.phone.trim()) return;

    const message = [
      `Hi Prova Media, I'd like to start a project.`,
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      data.email ? `Email: ${data.email}` : null,
      `Service: ${data.service}`,
      data.message ? `Message: ${data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = buildWhatsAppLink(message);
    setSubmitted(true);

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(15_23_42_/_0.2)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Aarav Mehta"
            required
            value={data.name}
            onChange={update("name")}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            required
            value={data.phone}
            onChange={update("phone")}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="hello@brand.com"
            value={data.email}
            onChange={update("email")}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="service">Service interested in</Label>
          <Select
            id="service"
            name="service"
            value={data.service}
            onChange={update("service")}
          >
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="message">Project details</Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your goals, budget and timeline..."
            value={data.message}
            onChange={update("message")}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Send className="h-4 w-4" />
          Send via WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          href={buildWhatsAppLink(
            "Hi Prova Media, I'd like to chat about a project."
          )}
          external
          className="w-full sm:w-auto"
        >
          <MessageCircle className="h-4 w-4" />
          Or just say hi
        </Button>
      </div>

      {submitted ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Opening WhatsApp with your details — we&rsquo;ll respond within minutes.
        </p>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          By submitting, you agree to be contacted on WhatsApp / phone. We never
          share your details.
        </p>
      )}
    </form>
  );
}
