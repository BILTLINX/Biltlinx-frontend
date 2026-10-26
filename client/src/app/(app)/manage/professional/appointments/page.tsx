"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { BOOKABLE_SERVICES, BOOKING_RULES, PROFESSIONAL_APPOINTMENT_DAYS, type AppointmentTone } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const TAG_TONE: Record<AppointmentTone, string> = {
  video: "bg-[#eff5ff] text-brand-900",
  person: "bg-[#dcfce7] text-[#16a34a]",
  paid: "bg-[#fef3c7] text-[#b45309]",
  office: "bg-[#f1f5f9] text-[#334155]",
};

/** Manage · Professional · Appointments (Figma node 1083:34861): the schedule of consultations and visits, and what clients can book. */
export default function ProfessionalAppointmentsPage() {
  const router = useRouter();
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(BOOKABLE_SERVICES.map((service) => [service.id, service.on])));
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function toggle(id: string, title: string) {
    const next = !on[id];
    setOn((current) => ({ ...current, [id]: next }));
    showSuccessToast(`${title} ${next ? "can be booked" : "is closed to bookings"}`);
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Appointments" role="Professional" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Appointments</h1>
            <p className="text-sm leading-5 text-gray-500">Consultations, design reviews and site visits. Clients book the slots you open.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Booking settings")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Booking settings
            </Button>
            <Button variant="primary" onClick={comingSoon("New appointment")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New appointment
            </Button>
          </div>
        </div>

        <ProfessionalTabs active="appointments" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {PROFESSIONAL_APPOINTMENT_DAYS.map((day) => (
              <section key={day.label} className="flex flex-col gap-3">
                <h2 className="text-[13px] font-bold leading-[19px] text-gray-500">{day.label}</h2>
                {day.appointments.map((appointment) => (
                  <div key={appointment.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl border border-gray-200 bg-white p-3.5">
                    <span className="w-[110px] shrink-0 whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#0f172a]">{appointment.time}</span>
                    <span className="flex min-w-0 flex-1 basis-44 flex-col gap-0.5">
                      <span className="text-sm font-semibold leading-5 text-[#0f172a]">{appointment.title}</span>
                      <span className="text-xs leading-[17px] text-gray-500">{appointment.who}</span>
                    </span>
                    <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", TAG_TONE[appointment.tag.tone])}>{appointment.tag.label}</span>
                    <Button
                      variant={appointment.action === "Join" ? "primary" : "outline"}
                      onClick={comingSoon(appointment.action === "Join" ? "Join call" : appointment.action === "Directions" ? "Directions" : "Appointment details")}
                      className="h-[34px] w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]"
                    >
                      {appointment.action}
                    </Button>
                  </div>
                ))}
              </section>
            ))}
          </div>

          <section className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 lg:w-[380px]">
            <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">What clients can book</h2>
            {BOOKABLE_SERVICES.map((service) => (
              <div key={service.id} className="flex items-center gap-2.5 border-t border-gray-200 py-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{service.title}</span>
                  <span className="text-xs leading-[17px] text-gray-500">{service.price}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on[service.id]}
                  aria-label={`${service.title} bookable`}
                  onClick={() => toggle(service.id, service.title)}
                  className={cn("flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", on[service.id] ? "bg-brand-900" : "bg-[#cbd5e1]")}
                >
                  <span className={cn("size-4 rounded-full bg-white transition-transform", on[service.id] && "translate-x-4")} />
                </button>
              </div>
            ))}
            {BOOKING_RULES.map((rule) => (
              <div key={rule.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
                <span className="text-gray-500">{rule.label}</span>
                <span className="text-right font-medium text-[#0f172a]">{rule.value}</span>
              </div>
            ))}
            <p className="text-xs leading-[17px] text-gray-500">Fees are held by Biltlinx and paid to you after the appointment.</p>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}

