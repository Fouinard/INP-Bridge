export function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function getDurationInMinutes(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / 60_000;
}

export function getDurationFormatted(start: Date, end: Date): { heures: string, minutes: string } {
    const diff = end.getTime() - start.getTime();

    const totalMinutes = Math.floor(diff / 60_000);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { heures: heures.toString(), minutes: minutes.toString().padStart(2, '0') };
}

export function dateToNaturalLanguage(date: Date): string {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

export function getRelativeDate(date: Date | string): string {
    const target = new Date(date);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays === -1) return "Hier";
    if (diffDays > 0) {
        return `Dans ${diffDays} jours`;
    }
    return `Il y a ${Math.abs(diffDays)} jours`;
}

export function getWeekdays(date?: Date) {
    const today = date || new Date();
    const monday = new Date(today);
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diffToMonday);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return {
        startDay: monday.getDate(),
        startMonth: monday.getMonth() + 1,
        startYear: monday.getFullYear(),

        endDay: friday.getDate(),
        endMonth: friday.getMonth() + 1,
        endYear: friday.getFullYear()
    };
}