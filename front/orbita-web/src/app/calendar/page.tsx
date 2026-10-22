import dynamic from 'next/dynamic';

const AppointmentCalendar = dynamic(
    () => import('@/components/ui/appointment-calendar'),
    { ssr: false }
);

export default function Home() {
    return <AppointmentCalendar />;
}